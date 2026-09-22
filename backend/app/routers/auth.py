from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.auth_service import verify_password, get_user_by_email
from app.authentication.jwt_handler import create_access_token
from app.schemas.auth import Token
from app.schemas.user import UserResponse
from app.authentication.dependencies import get_current_user
from app.models.models import AuditLog, Role
from datetime import datetime

router = APIRouter(prefix="", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        log = AuditLog(action="Failed Login", ip_address="Unknown", timestamp=datetime.utcnow())
        db.add(log)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_name = role.name if role else ""

    access_token = create_access_token(data={
        "sub": user.email, 
        "role_id": user.role_id,
        "role": role_name,
        "name": user.name
    })
    
    log = AuditLog(user_id=user.id, action="Login", ip_address="Unknown", timestamp=datetime.utcnow())
    db.add(log)
    db.commit()

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    log = AuditLog(user_id=current_user.id, action="Logout", timestamp=datetime.utcnow())
    db.add(log)
    db.commit()
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=Token)
def refresh_token(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    role_name = role.name if role else ""
    access_token = create_access_token(data={
        "sub": current_user.email, 
        "role_id": current_user.role_id,
        "role": role_name,
        "name": current_user.name
    })
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_users_me(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    cert = current_user.certificate
    
    return {
        "name": current_user.name,
        "email": current_user.email,
        "department": "Computer Science",
        "role": role.name if role else "Unknown",
        "certificate_id": cert.id if cert else None,
        "certificate_expiry": cert.expires_at.isoformat() if cert else None,
        "employee_id": current_user.employee_id,
        "centre_code": current_user.centre_code
    }
