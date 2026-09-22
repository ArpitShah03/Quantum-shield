from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SecurityIncidentBase(BaseModel):
    role: str
    paper_id: Optional[int] = None
    reason: str
    action: Optional[str] = "Blocked"

class SecurityIncidentCreate(SecurityIncidentBase):
    pass

class SecurityIncidentResponse(SecurityIncidentBase):
    id: int
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True
