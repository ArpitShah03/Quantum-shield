import os
import binascii
from datetime import datetime
from app.services.crypto.dsa_engine import MLDSAEngine

class UniversityCA:
    def __init__(self):
        self.dsa = MLDSAEngine()
        self.keys_dir = "./keys/ca"
        self.pk_path = os.path.join(self.keys_dir, "ca_public.bin")
        self.sk_path = os.path.join(self.keys_dir, "ca_private.bin")
        os.makedirs(self.keys_dir, exist_ok=True)

    def generate_ca_keys(self) -> tuple[bytes, bytes]:
        pk, sk = self.dsa.generate_keypair()
        with open(self.pk_path, "wb") as f:
            f.write(pk)
        with open(self.sk_path, "wb") as f:
            f.write(sk)
        return pk, sk

    def load_ca_keys(self) -> tuple[bytes, bytes]:
        if not os.path.exists(self.pk_path) or not os.path.exists(self.sk_path):
            return self.generate_ca_keys()
        
        with open(self.pk_path, "rb") as f:
            pk = f.read()
        with open(self.sk_path, "rb") as f:
            sk = f.read()
        return pk, sk

    def sign_professor_public_key(self, prof_id: int, prof_pk: bytes, issued_at: datetime, expires_at: datetime) -> bytes:
        _, ca_sk = self.load_ca_keys()
        cert_payload = (
            str(prof_id).encode() + 
            prof_pk + 
            issued_at.isoformat().encode() + 
            expires_at.isoformat().encode()
        )
        payload_hash = self.dsa.hash_payload(cert_payload)
        return self.dsa.sign(payload_hash, ca_sk)

    def verify_professor_certificate(self, cert_obj: dict) -> bool:
        ca_pk, _ = self.load_ca_keys()
        prof_id = cert_obj["professor_id"]
        prof_pk = binascii.unhexlify(cert_obj["dsa_public_key"])
        issued_at = cert_obj["issued_at"]
        expires_at = cert_obj["expires_at"]
        ca_sig = binascii.unhexlify(cert_obj["ca_signature"])
        
        cert_payload = (
            str(prof_id).encode() + 
            prof_pk + 
            issued_at.isoformat().encode() + 
            expires_at.isoformat().encode()
        )
        payload_hash = self.dsa.hash_payload(cert_payload)
        return self.dsa.verify(payload_hash, ca_sig, ca_pk)
