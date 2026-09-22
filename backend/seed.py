import os
from sqlalchemy.orm import Session
from app.database.session import engine, SessionLocal
from app.database.base import Base
from app.models.models import User, Role, ProfessorCertificate
from app.services.auth_service import get_password_hash
from app.services.certificate_authority import UniversityCA
from app.services.key_manager import ProfessorKeyManager
from app.services.crypto.dsa_engine import MLDSAEngine
from datetime import datetime, timedelta
import binascii

def seed_db():
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create roles
    prof_role = Role(name="Professor")
    admin_role = Role(name="Administrator")
    ec_role = Role(name="Exam Centre")
    db.add_all([prof_role, admin_role, ec_role])
    db.commit()
    
    # Initialize CA and Managers
    ca = UniversityCA()
    ca.generate_ca_keys()
    dsa = MLDSAEngine()
    prof_km = ProfessorKeyManager()
    
    # Professor
    prof = User(
        name="Bihari Babu",
        email="bihari@vit.ac.in",
        password_hash=get_password_hash("prof123"),
        role_id=prof_role.id,
        employee_id="VIT-PROF-101"
    )
    db.add(prof)
    db.commit()
    db.refresh(prof)
    
    # Generate keys for Professor
    prof_pk, prof_sk = dsa.generate_keypair()
    with open(os.path.join(prof_km.keys_dir, f"prof_{prof.id}_private.bin"), "wb") as f:
        f.write(prof_sk)
        
    prof.dsa_public_key = binascii.hexlify(prof_pk).decode()
    
    # Sign Certificate
    issued_at = datetime.utcnow()
    expires_at = issued_at + timedelta(days=365)
    ca_sig = ca.sign_professor_public_key(prof.id, prof_pk, issued_at, expires_at)
    
    cert = ProfessorCertificate(
        professor_id=prof.id,
        dsa_public_key=binascii.hexlify(prof_pk).decode(),
        issued_at=issued_at,
        expires_at=expires_at,
        ca_signature=binascii.hexlify(ca_sig).decode()
    )
    db.add(cert)
    
    # Admin
    admin = User(
        name="Rakesh Kumar",
        email="rakesh@vit.ac.in",
        password_hash=get_password_hash("admin123"),
        role_id=admin_role.id,
        employee_id="ADM-8472"
    )
    
    # Exam Centre
    ec = User(
        name="Priya Sharma",
        email="priya@vit.ac.in",
        password_hash=get_password_hash("centre123"),
        role_id=ec_role.id,
        centre_code="VIT-XC-09"
    )
    
    db.add_all([admin, ec])
    db.commit()
    print("Database seeded successfully with VIT identities!")

if __name__ == "__main__":
    seed_db()
