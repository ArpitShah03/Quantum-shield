from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogBase(BaseModel):
    action: str
    paper_id: Optional[int] = None
    ip_address: Optional[str] = None
    status: str

class AuditLogResponse(AuditLogBase):
    id: int
    user_id: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True

class VerificationLogBase(BaseModel):
    paper_id: int
    status: str
    remarks: Optional[str] = None

class VerificationLogResponse(VerificationLogBase):
    id: int
    verified_by: int
    verification_time: datetime

    class Config:
        from_attributes = True
