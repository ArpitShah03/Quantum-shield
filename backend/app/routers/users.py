from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.models.user import User
from app.services.auth_service import get_password_hash
from app.authentication.dependencies import require_role
from app.models.audit import AuditLog
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user=Depends(require_role(["Admin"]))):
    return db.query(User).all()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user=Depends(require_role(["Admin"]))):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role_id=user.role_id,
        department=user.department,
        status=user.status
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    log = AuditLog(user_id=current_user.id, action=f"Created user {db_user.email}", status="Success")
    db.add(log)
    db.commit()

    return db_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user=Depends(require_role(["Admin"]))):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)

    log = AuditLog(user_id=current_user.id, action=f"Updated user {db_user.email}", status="Success")
    db.add(log)
    db.commit()

    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(require_role(["Admin"]))):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    
    log = AuditLog(user_id=current_user.id, action=f"Deleted user {db_user.email}", status="Success")
    db.add(log)
    db.commit()

    return
