from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.logs import VerificationLogResponse, VerificationLogBase
from app.models.verification import VerificationLog
from app.models.paper import QuestionPaper
from app.authentication.dependencies import get_current_user, require_role
from app.models.audit import AuditLog
from datetime import datetime

router = APIRouter(prefix="/verification", tags=["Verification Logs"])

@router.get("", response_model=List[VerificationLogResponse])
def get_verification_logs(db: Session = Depends(get_db), current_user=Depends(require_role(["Admin", "Exam Centre"]))):
    if current_user.role.role_name == "Exam Centre":
        return db.query(VerificationLog).filter(VerificationLog.verified_by == current_user.id).all()
    return db.query(VerificationLog).all()

@router.post("", response_model=VerificationLogResponse, status_code=status.HTTP_201_CREATED)
def create_verification_log(log_data: VerificationLogBase, db: Session = Depends(get_db), current_user=Depends(require_role(["Admin", "Exam Centre"]))):
    paper = db.query(QuestionPaper).filter(QuestionPaper.id == log_data.paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    db_log = VerificationLog(
        paper_id=log_data.paper_id,
        verified_by=current_user.id,
        status=log_data.status,
        remarks=log_data.remarks
    )
    db.add(db_log)
    
    # Update paper status based on verification
    paper.status = log_data.status
    
    # Audit log
    audit = AuditLog(user_id=current_user.id, paper_id=paper.id, action="Paper Verification", status=log_data.status)
    db.add(audit)
    
    db.commit()
    db.refresh(db_log)
    return db_log
