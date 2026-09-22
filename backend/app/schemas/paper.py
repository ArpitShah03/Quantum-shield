from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaperBase(BaseModel):
    title: str
    subject: str
    course_code: str
    semester: str
    exam_date: str
    exam_time: str
    status: Optional[str] = "Uploaded Successfully"

class PaperCreate(PaperBase):
    pass

class PaperUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    course_code: Optional[str] = None
    semester: Optional[str] = None
    exam_date: Optional[str] = None
    exam_time: Optional[str] = None
    status: Optional[str] = None

class PaperResponse(PaperBase):
    id: int
    uploaded_by: int
    file_path: str
    encrypted_file_path: Optional[str] = None
    sha3_hash: Optional[str] = None
    kyber_public_key: Optional[str] = None
    encapsulated_aes_key: Optional[str] = None
    dilithium_signature: Optional[str] = None
    encryption_status: Optional[str] = None
    hash_status: Optional[str] = None
    verification_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
