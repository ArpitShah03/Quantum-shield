from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None
    status: Optional[str] = "active"

class UserCreate(UserBase):
    password: str
    role_id: int

class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    role_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    role_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
