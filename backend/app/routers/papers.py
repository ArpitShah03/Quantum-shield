from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Paper, CryptographicMetadata, AuditLog, ProfessorCertificate, SecurityIncident, PerformanceMetrics
from app.authentication.dependencies import get_current_user, require_role
from app.services.encryption_service import EncryptionService
from app.services.verification_service import VerificationService, VerificationError
from app.services.key_manager import ServerKeyManager, ProfessorKeyManager
from app.services.certificate_authority import UniversityCA
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid
import os
import binascii
from zoneinfo import ZoneInfo
import time

def get_ist_now():
    return datetime.now(ZoneInfo("Asia/Kolkata")).replace(tzinfo=None)

router = APIRouter(prefix="/papers", tags=["papers"])

class ApproveRequest(BaseModel):
    release_datetime: datetime
    download_window_seconds: int

class RejectRequest(BaseModel):
    reason: str

router = APIRouter(prefix="/papers", tags=["Papers"])

enc_service = EncryptionService()
ver_service = VerificationService()
server_km = ServerKeyManager()
prof_km = ProfessorKeyManager()
ca = UniversityCA()

@router.get("/")
def get_papers(db: Session = Depends(get_db), current_user: User = Depends(require_role(["Professor", "Administrator", "Exam Centre"]))):
    if current_user.role_name == "Administrator":
        papers = db.query(Paper).all()
    elif current_user.role_name == "Exam Centre":
        papers = db.query(Paper).filter(Paper.status == "Approved").all()
    else: # Professor
        papers = db.query(Paper).filter(Paper.uploader_id == current_user.id).all()
        
    result = []
    for p in papers:
        meta = p.crypto_meta
        sha3_hash = meta.sha3_hash[:16] + "..." if meta and meta.sha3_hash else "N/A"
        
        result.append({
            "id": p.id,
            "title": p.title,
            "course_code": p.course_code,
            "status": p.status,
            "timestamp": p.timestamp.isoformat(),
            "professor_name": p.uploader.name if p.uploader else "Unknown",
            "sha3_hash": sha3_hash,
            "ca_status": "Valid" if meta else "N/A",
            "release_datetime": p.release_datetime.isoformat() + "+05:30" if p.release_datetime else None,
            "download_window_seconds": p.download_window_seconds,
            "release_token": p.release_token
        })
    return result

@router.get("/audit/recent")
def get_recent_decisions(db: Session = Depends(get_db), current_user: User = Depends(require_role(["Administrator"]))):
    logs = db.query(AuditLog).filter(
        AuditLog.action.like("Approved paper%") | AuditLog.action.like("Rejected paper%")
    ).order_by(AuditLog.timestamp.desc()).limit(5).all()
    
    result = []
    for log in logs:
        # Extract paper ID from action (e.g., "Approved paper 1")
        parts = log.action.split(" ")
        decision = parts[0]
        try:
            paper_id = int(parts[2])
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            if paper:
                result.append({
                    "paper": paper.title,
                    "professor": paper.uploader.name if paper.uploader else "Unknown",
                    "decision": decision,
                    "time": log.timestamp.isoformat() + "Z"
                })
        except:
            pass
    return result

@router.get("/audit/incidents")
def get_recent_incidents(db: Session = Depends(get_db), current_user: User = Depends(require_role(["Administrator"]))):
    incidents = db.query(SecurityIncident).order_by(SecurityIncident.timestamp.desc()).limit(5).all()
    result = []
    for inc in incidents:
        paper = db.query(Paper).filter(Paper.id == inc.paper_id).first()
        user = db.query(User).filter(User.id == inc.user_id).first()
        result.append({
            "paper": paper.title if paper else f"Paper {inc.paper_id}",
            "failed_stage": inc.failed_stage,
            "user": user.name if user else "Unknown",
            "time": inc.timestamp.isoformat() + "Z"
        })
    return result

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_paper(
    title: str = Form(...),
    course_code: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Professor"]))
):
    t_start = time.perf_counter()
    new_paper = Paper(
        uploader_id=current_user.id,
        title=title,
        course_code=course_code,
        status="Pending",
        file_path=f"uploads/{file.filename}"
    )
    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    
    # 1. Chain of Custody: Paper Uploaded
    db.add(AuditLog(paper_id=new_paper.id, user_id=current_user.id, role=current_user.role.name, action="Paper Uploaded", ip_address="127.0.0.1", timestamp=get_ist_now()))
    
    plaintext = await file.read()
    sys_kem_pk, _ = server_km.load_server_kem_keys()
    prof_dsa_sk = prof_km.load_professor_dsa_private_key(current_user.id)
    
    crypto_result = enc_service.encrypt_pipeline(
        plaintext=plaintext,
        system_kyber_pk=sys_kem_pk,
        uploader_dsa_sk=prof_dsa_sk,
        paper_id=new_paper.id,
        timestamp_str=new_paper.timestamp.isoformat()
    )
    
    # 2. Chain of Custody: Cryptographic Signature Created
    db.add(AuditLog(paper_id=new_paper.id, user_id=current_user.id, role="System", action="Cryptographic Signature Created", ip_address="127.0.0.1", timestamp=get_ist_now()))
    
    os.makedirs("uploads", exist_ok=True)
    ct_path = f"uploads/ct_{new_paper.id}.bin"
    with open(ct_path, "wb") as f:
        f.write(crypto_result["ciphertext"])
    
    meta = CryptographicMetadata(
        paper_id=new_paper.id,
        aes_iv=binascii.hexlify(crypto_result["aes_iv"]).decode(),
        aes_tag=binascii.hexlify(crypto_result["aes_tag"]).decode(),
        hkdf_salt=binascii.hexlify(crypto_result["hkdf_salt"]).decode(),
        kyber_ct=binascii.hexlify(crypto_result["kyber_ct"]).decode(),
        sha3_hash=binascii.hexlify(crypto_result["sha3_hash"]).decode(),
        dilithium_sig=binascii.hexlify(crypto_result["dilithium_sig"]).decode()
    )
    new_paper.file_path = ct_path
    db.add(meta)
    
    total_ms = round((time.perf_counter() - t_start) * 1000, 2)
    m = crypto_result["metrics"]
    perf = PerformanceMetrics(
        paper_id=new_paper.id,
        aes_encrypt_ms=m['aes_encrypt_ms'],
        sha3_hash_ms=m['sha3_hash_ms'],
        mldsa_sign_ms=m['mldsa_sign_ms'],
        mlkem_encapsulation_ms=m['mlkem_encapsulation_ms'],
        total_upload_ms=total_ms
    )
    db.add(perf)
    db.commit()

    return {"paper_id": new_paper.id, "status": "Pending", "metrics": {**m, "total_upload_ms": total_ms}}

@router.patch("/approve/{id}")
def approve_paper(id: int, req: ApproveRequest, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Administrator"]))):
    paper = db.query(Paper).filter(Paper.id == id).first()
    if not paper: raise HTTPException(status_code=404, detail="Paper not found")
    paper.status = "Approved"
    paper.release_datetime = req.release_datetime.replace(tzinfo=None)
    paper.download_window_seconds = req.download_window_seconds
    paper.release_token = f"QS-{paper.id}-{os.urandom(4).hex().upper()}"
    
    # 3 & 4. Chain of Custody: Administrator Approved & Release Scheduled
    db.add(AuditLog(paper_id=id, user_id=current_user.id, role=current_user.role.name, action="Administrator Approved", ip_address="127.0.0.1", timestamp=get_ist_now()))
    db.add(AuditLog(paper_id=id, user_id=current_user.id, role=current_user.role.name, action="Release Scheduled", ip_address="127.0.0.1", timestamp=get_ist_now()))
    db.commit()
    return {"message": "Paper Approved", "paper_id": paper.id, "status": "Approved", "release_token": paper.release_token}

@router.patch("/reject/{id}")
def reject_paper(id: int, req: RejectRequest, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Administrator"]))):
    paper = db.query(Paper).filter(Paper.id == id).first()
    if not paper: raise HTTPException(status_code=404, detail="Paper not found")
    if paper.status != "Pending": raise HTTPException(status_code=400, detail="Only Pending papers can be rejected")
    paper.status = "Rejected"
    paper.rejection_reason = req.reason
    
    # 5. Chain of Custody: Administrator Rejected
    db.add(AuditLog(paper_id=id, user_id=current_user.id, role=current_user.role.name, action="Administrator Rejected", ip_address="127.0.0.1", timestamp=get_ist_now()))
    db.commit()
    return {"message": "Paper Rejected", "paper_id": paper.id, "status": "Rejected"}

@router.get("/download/{id}")
def download_paper(id: int, token: str = None, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Exam Centre"]))):
    paper = db.query(Paper).filter(Paper.id == id).first()
    if not paper or paper.status != "Approved":
        raise HTTPException(status_code=404, detail="Paper not found or not approved")
        
    # TOKEN CHECK
    if not paper.release_token or paper.release_token != token:
        db.add(SecurityIncident(paper_id=id, user_id=current_user.id, failed_stage="Time-Lock / Token", reason="Invalid Release Token", timestamp=get_ist_now()))
        db.commit()
        raise HTTPException(status_code=403, detail="Invalid Release Token.")
        
    # TIME-LOCK CHECK
    if not paper.release_datetime or not paper.download_window_seconds:
        raise HTTPException(status_code=403, detail="Release window not configured.")
        
    from zoneinfo import ZoneInfo
    server_now = datetime.now(ZoneInfo("Asia/Kolkata")).replace(tzinfo=None)
    window_end = paper.release_datetime + timedelta(seconds=paper.download_window_seconds)
    
    if server_now < paper.release_datetime:
        raise HTTPException(status_code=403, detail="Paper release time has not arrived.")
    if server_now > window_end:
        db.add(SecurityIncident(paper_id=id, user_id=current_user.id, failed_stage="Time-Lock", reason="Time Window Expired", timestamp=get_ist_now()))
        # CoC: Time Window Expired
        db.add(AuditLog(paper_id=id, user_id=current_user.id, role=current_user.role.name, action="Time Window Expired", ip_address="127.0.0.1", timestamp=get_ist_now()))
        db.commit()
        raise HTTPException(status_code=403, detail="Release window expired.")

    meta = db.query(CryptographicMetadata).filter(CryptographicMetadata.paper_id == id).first()
    if not meta:
        raise HTTPException(status_code=500, detail="Cryptographic metadata missing")

    ver_service = VerificationService()
    server_km = ServerKeyManager()
    ca = UniversityCA()
    
    t_start = time.perf_counter()
    
    prof_cert = db.query(ProfessorCertificate).filter(ProfessorCertificate.professor_id == paper.uploader_id).first()
    if not prof_cert:
        raise HTTPException(status_code=500, detail="Professor Certificate missing")
        
    cert_obj = {
        "professor_id": prof_cert.professor_id,
        "dsa_public_key": prof_cert.dsa_public_key,
        "issued_at": prof_cert.issued_at,
        "expires_at": prof_cert.expires_at,
        "ca_signature": prof_cert.ca_signature
    }
    
    t_ca = time.perf_counter()
    ca_valid = ca.verify_professor_certificate(cert_obj)
    ca_ms = round((time.perf_counter() - t_ca) * 1000, 2)
    
    if not ca_valid:
        db.add(SecurityIncident(paper_id=id, user_id=current_user.id, failed_stage="University CA", reason="Certificate verification failed.", timestamp=get_ist_now()))
        # CoC: Verification Failed
        db.add(AuditLog(paper_id=id, user_id=current_user.id, role=current_user.role.name, action="Verification Failed", ip_address="127.0.0.1", timestamp=get_ist_now()))
        db.commit()
        raise HTTPException(status_code=400, detail={"failed_stage": "University CA", "reason": "Certificate verification failed."})

    _, sys_kem_sk = server_km.load_server_kem_keys()
    
    with open(paper.file_path, "rb") as f:
        ciphertext = f.read()

    meta_dict = {
        "ciphertext": ciphertext,
        "paper_id": paper.id,
        "timestamp": paper.timestamp,
        "sha3_hash": binascii.unhexlify(meta.sha3_hash),
        "dilithium_sig": binascii.unhexlify(meta.dilithium_sig),
        "kyber_ct": binascii.unhexlify(meta.kyber_ct),
        "hkdf_salt": binascii.unhexlify(meta.hkdf_salt),
        "aes_iv": binascii.unhexlify(meta.aes_iv),
        "aes_tag": binascii.unhexlify(meta.aes_tag)
    }
    
    try:
        plaintext, m = ver_service.verify_pipeline(
            meta=meta_dict, 
            system_kyber_sk=sys_kem_sk, 
            uploader_dsa_pk=binascii.unhexlify(prof_cert.dsa_public_key)
        )
    except VerificationError as e:
        db.add(SecurityIncident(paper_id=id, user_id=current_user.id, failed_stage=e.stage, reason=e.reason, timestamp=get_ist_now()))
        # CoC: Verification Failed
        db.add(AuditLog(paper_id=id, user_id=current_user.id, role=current_user.role.name, action="Verification Failed", ip_address="127.0.0.1", timestamp=get_ist_now()))
        db.commit()
        raise HTTPException(status_code=400, detail={"failed_stage": e.stage, "reason": e.reason})
        
    total_ms = round((time.perf_counter() - t_start) * 1000, 2)
    
    # Update PerformanceMetrics with download values
    perf = db.query(PerformanceMetrics).filter(PerformanceMetrics.paper_id == id).first()
    if perf:
        perf.ca_verify_ms = ca_ms
        perf.mldsa_verify_ms = m.get('mldsa_verify_ms', 0)
        perf.sha3_verify_ms = m.get('sha3_verify_ms', 0)
        perf.mlkem_decapsulation_ms = m.get('mlkem_decapsulation_ms', 0)
        perf.aes_decrypt_ms = m.get('aes_decrypt_ms', 0)
        perf.total_download_ms = total_ms
    
    # 6 & 7. Chain of Custody: Exam Centre Verified & Download Completed
    db.add(AuditLog(paper_id=id, user_id=current_user.id, role=current_user.role.name, action="Exam Centre Verified", ip_address="127.0.0.1", timestamp=get_ist_now()))
    db.add(AuditLog(paper_id=id, user_id=current_user.id, role=current_user.role.name, action="Download Completed", ip_address="127.0.0.1", timestamp=get_ist_now()))
    db.commit()
    
    import json
    metrics_json = json.dumps({
        "ca_verify_ms": ca_ms,
        "mldsa_verify_ms": m.get('mldsa_verify_ms', 0),
        "sha3_verify_ms": m.get('sha3_verify_ms', 0),
        "mlkem_decapsulation_ms": m.get('mlkem_decapsulation_ms', 0),
        "aes_decrypt_ms": m.get('aes_decrypt_ms', 0),
        "total_download_ms": total_ms
    })
    
    return Response(
        content=plaintext, 
        media_type="application/pdf", 
        headers={
            "Content-Disposition": f"attachment; filename=paper_{id}.pdf",
            "X-Metrics": metrics_json,
            "Access-Control-Expose-Headers": "X-Metrics, Content-Disposition"
        }
    )

@router.get("/tamper/{id}")
def tamper_paper(id: int, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == id).first()
    if not paper: raise HTTPException(status_code=404, detail="Paper not found")
    
    with open(paper.file_path, "rb") as f:
        content = bytearray(f.read())
        
    # Flip one byte
    if len(content) > 0:
        content[0] ^= 0xFF
        
    with open(paper.file_path, "wb") as f:
        f.write(content)
        
    return {"message": "Paper tampered successfully for testing."}


@router.get("/chain/{id}")
def get_chain_of_custody(id: int, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.paper_id == id).order_by(AuditLog.timestamp.asc()).all()
    res = []
    for log in logs:
        user_name = db.query(User.name).filter(User.id == log.user_id).scalar() if log.user_id else "System"
        res.append({
            "time": log.timestamp.isoformat(),
            "user": user_name,
            "role": log.role or "System",
            "action": log.action
        })
    return res

@router.get("/metrics/admin")
def get_admin_metrics(db: Session = Depends(get_db), current_user: User = Depends(require_role(["Administrator"]))):
    from sqlalchemy.sql import func
    avg_upload = db.query(func.avg(PerformanceMetrics.total_upload_ms)).scalar() or 0
    avg_verify = db.query(func.avg(PerformanceMetrics.total_download_ms)).scalar() or 0
    total_papers = db.query(Paper).count()
    total_downloads = db.query(AuditLog).filter(AuditLog.action == "Download Completed").count()
    
    recent_chain = db.query(AuditLog).filter(AuditLog.paper_id.isnot(None)).order_by(AuditLog.timestamp.desc()).limit(5).all()
    recent = []
    for log in recent_chain:
        user_name = db.query(User.name).filter(User.id == log.user_id).scalar() if log.user_id else "System"
        recent.append({
            "paper_id": log.paper_id,
            "action": log.action,
            "user": user_name,
            "time": log.timestamp.isoformat()
        })
        
    return {
        "avg_upload_ms": round(avg_upload, 2),
        "avg_verify_ms": round(avg_verify, 2),
        "total_papers": total_papers,
        "total_downloads": total_downloads,
        "recent_chain": recent
    }

@router.get("/export")
def export_security_report(db: Session = Depends(get_db), current_user: User = Depends(require_role(["Administrator"]))):
    import io
    import csv
    from fastapi.responses import StreamingResponse
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Paper ID", "Upload Time", "Approval Time", "Download Time", "Total Upload ms", "Total Verification ms", "Final Status"])
    
    papers = db.query(Paper).all()
    for p in papers:
        upload_log = db.query(AuditLog).filter(AuditLog.paper_id == p.id, AuditLog.action == "Paper Uploaded").first()
        approve_log = db.query(AuditLog).filter(AuditLog.paper_id == p.id, AuditLog.action == "Administrator Approved").first()
        download_log = db.query(AuditLog).filter(AuditLog.paper_id == p.id, AuditLog.action == "Download Completed").order_by(AuditLog.timestamp.desc()).first()
        
        perf = db.query(PerformanceMetrics).filter(PerformanceMetrics.paper_id == p.id).first()
        
        writer.writerow([
            p.id,
            upload_log.timestamp.isoformat() if upload_log else "N/A",
            approve_log.timestamp.isoformat() if approve_log else "N/A",
            download_log.timestamp.isoformat() if download_log else "N/A",
            perf.total_upload_ms if perf and perf.total_upload_ms else 0,
            perf.total_download_ms if perf and perf.total_download_ms else 0,
            p.status
        ])
        
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=security_report.csv"})
