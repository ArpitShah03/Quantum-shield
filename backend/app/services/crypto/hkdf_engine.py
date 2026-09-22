import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.backends import default_backend

class HKDFEngine:
    def derive_key(self, shared_secret: bytes, salt: bytes = None) -> tuple[bytes, bytes]:
        if salt is None:
            salt = os.urandom(32)
            
        hkdf = HKDF(
            algorithm=hashes.SHA3_256(),
            length=32,
            salt=salt,
            info=b'quantumshield-aes-key',
            backend=default_backend()
        )
        aes_key = hkdf.derive(shared_secret)
        return aes_key, salt
