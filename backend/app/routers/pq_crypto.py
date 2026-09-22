from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.crypto.kyber import generate_kyber_keypair, encapsulate_key, decapsulate_key
from app.services.crypto.dilithium import generate_dilithium_keypair, sign_document, verify_document_signature
from app.models.security_incident import SecurityIncident
from app.schemas.security_incident import SecurityIncidentResponse
from typing import List

router = APIRouter(prefix="/pq_crypto", tags=["Post-Quantum Cryptography Testing"])

@router.post("/sign")
def api_sign_document(file: UploadFile = File(...)):
    """Generate a Dilithium signature for the uploaded file."""
    file_data = file.file.read()
    pk, sk = generate_dilithium_keypair()
    signature = sign_document(file_data, sk)
    return {
        "dilithium_public_key_base64": pk,
        "dilithium_secret_key_base64": sk,
        "signature_base64": signature
    }

@router.post("/verify-signature")
def api_verify_signature(
    signature_base64: str,
    public_key_base64: str,
    file: UploadFile = File(...)
):
    """Verify a Dilithium signature."""
    file_data = file.file.read()
    is_valid = verify_document_signature(file_data, signature_base64, public_key_base64)
    if is_valid:
        return {"status": "Verified"}
    raise HTTPException(status_code=400, detail="Signature Invalid")

@router.post("/encapsulate-key")
def api_encapsulate():
    """Generate a Kyber keypair and encapsulate a shared secret."""
    pk, sk = generate_kyber_keypair()
    ciphertext, shared_secret = encapsulate_key(pk)
    return {
        "kyber_public_key_base64": pk,
        "kyber_secret_key_base64": sk,
        "ciphertext_base64": ciphertext,
        "shared_secret_base64": shared_secret
    }

@router.post("/decapsulate-key")
def api_decapsulate(ciphertext_base64: str, secret_key_base64: str):
    """Decapsulate the shared secret using the Kyber Secret Key."""
    try:
        shared_secret = decapsulate_key(ciphertext_base64, secret_key_base64)
        return {"shared_secret_base64": shared_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Decapsulation failed: {e}")

@router.get("/security-incidents", response_model=List[SecurityIncidentResponse])
def get_security_incidents(db: Session = Depends(get_db)):
    """Retrieve all security incidents."""
    return db.query(SecurityIncident).order_by(SecurityIncident.timestamp.desc()).all()

@router.post("/simulate")
def simulate_attack(
    attack_type: str = Form(...),
    paper_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """
    Simulates an attack by generating a Security Incident and returning the simulated result.
    Does NOT damage the actual paper.
    """
    # Mapping simulation types to our VerificationEngine errors
    reason = "Unknown Error"
    if attack_type == "File Tampering" or attack_type == "Corrupted Ciphertext":
        reason = "Hash Mismatch"
    elif attack_type == "Invalid Signature":
        reason = "Invalid Signature"
    elif attack_type == "Wrong AES Key" or attack_type == "Key Corruption":
        reason = "Invalid Key Recovery"
    elif attack_type == "Unauthorized Access":
        reason = "Unauthorized Access"
    elif attack_type == "Replay Attempt":
        reason = "Replay Attack Detected"
    
    incident = SecurityIncident(
        user_id=1, # Admin or simulated user
        role="Hacker",
        paper_id=paper_id,
        reason=reason,
        action="Blocked"
    )
    db.add(incident)
    db.commit()
    
    return {
        "status": "Blocked",
        "detection_method": "Cryptographic Verification Engine",
        "reason": reason
    }
