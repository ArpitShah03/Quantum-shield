import os
from app.services.crypto.kem_engine import MLKEMEngine

class ServerKeyManager:
    def __init__(self):
        self.kem = MLKEMEngine()
        self.keys_dir = "./keys/server"
        self.pk_path = os.path.join(self.keys_dir, "kem_public.bin")
        self.sk_path = os.path.join(self.keys_dir, "kem_secret.bin")
        os.makedirs(self.keys_dir, exist_ok=True)

    def generate_server_kem_keys(self):
        pk, sk = self.kem.generate_keypair()
        self.save_server_keys(pk, sk)
        return pk, sk

    def save_server_keys(self, pk: bytes, sk: bytes):
        with open(self.pk_path, "wb") as f:
            f.write(pk)
        with open(self.sk_path, "wb") as f:
            f.write(sk)

    def load_server_kem_keys(self) -> tuple[bytes, bytes]:
        if not os.path.exists(self.pk_path) or not os.path.exists(self.sk_path):
            return self.generate_server_kem_keys()
        
        with open(self.pk_path, "rb") as f:
            pk = f.read()
        with open(self.sk_path, "rb") as f:
            sk = f.read()
        return pk, sk

class ProfessorKeyManager:
    def __init__(self):
        self.keys_dir = "./keys/professors"
        os.makedirs(self.keys_dir, exist_ok=True)

    def load_professor_dsa_private_key(self, user_id: int) -> bytes:
        sk_path = os.path.join(self.keys_dir, f"prof_{user_id}_private.bin")
        if not os.path.exists(sk_path):
            raise FileNotFoundError(f"Missing private key for Professor {user_id}")
        
        with open(sk_path, "rb") as f:
            sk = f.read()
        return sk
