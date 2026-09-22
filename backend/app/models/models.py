from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    dsa_public_key = Column(String, nullable=True) 
    dsa_key_id = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    centre_code = Column(String, nullable=True)
    
    role = relationship("Role")
    certificate = relationship("ProfessorCertificate", back_populates="user", uselist=False)

class ProfessorCertificate(Base):
    __tablename__ = "professor_certificates"
    id = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    dsa_public_key = Column(String, nullable=False) 
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    ca_signature = Column(String, nullable=False) 
    
    user = relationship("User", back_populates="certificate")

class Paper(Base):
    __tablename__ = "papers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    course_code = Column(String, nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String, nullable=False)
    status = Column(String, default="Pending")
    rejection_reason = Column(String, nullable=True)
    release_datetime = Column(DateTime, nullable=True)
    download_window_seconds = Column(Integer, nullable=True)
    release_token = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    uploader = relationship("User")
    crypto_meta = relationship("CryptographicMetadata", back_populates="paper", uselist=False)

class CryptographicMetadata(Base):
    __tablename__ = "cryptographic_metadata"
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), unique=True)
    aes_iv = Column(String, nullable=False)
    aes_tag = Column(String, nullable=False)
    hkdf_salt = Column(String, nullable=False)
    kyber_ct = Column(String, nullable=False)
    sha3_hash = Column(String, nullable=False)
    dilithium_sig = Column(String, nullable=False)
    
    paper = relationship("Paper", back_populates="crypto_meta")

class SecurityIncident(Base):
    __tablename__ = "security_incidents"
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    failed_stage = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String, nullable=True)
    action = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class PerformanceMetrics(Base):
    __tablename__ = "performance_metrics"
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), unique=True)
    aes_encrypt_ms = Column(Float, nullable=True)
    sha3_hash_ms = Column(Float, nullable=True)
    mldsa_sign_ms = Column(Float, nullable=True)
    mlkem_encapsulation_ms = Column(Float, nullable=True)
    total_upload_ms = Column(Float, nullable=True)
    ca_verify_ms = Column(Float, nullable=True)
    mldsa_verify_ms = Column(Float, nullable=True)
    sha3_verify_ms = Column(Float, nullable=True)
    mlkem_decapsulation_ms = Column(Float, nullable=True)
    aes_decrypt_ms = Column(Float, nullable=True)
    total_download_ms = Column(Float, nullable=True)

