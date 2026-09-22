from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.logs import AuditLogResponse
from app.models.audit import AuditLog
from app.authentication.dependencies import require_role

router = APIRouter(prefix="/logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db), current_user=Depends(require_role(["Admin"]))):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
