import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class AESEngine:
    def encrypt(self, plaintext: bytes, key: bytes) -> tuple[bytes, bytes, bytes]:
        iv = os.urandom(12)
        aesgcm = AESGCM(key)
        ciphertext_with_tag = aesgcm.encrypt(iv, plaintext, None)
        
        ciphertext = ciphertext_with_tag[:-16]
        tag = ciphertext_with_tag[-16:]
        return ciphertext, iv, tag

    def decrypt(self, ciphertext: bytes, iv: bytes, tag: bytes, key: bytes) -> bytes:
        aesgcm = AESGCM(key)
        ciphertext_with_tag = ciphertext + tag
        try:
            plaintext = aesgcm.decrypt(iv, ciphertext_with_tag, None)
            return plaintext
        except Exception as e:
            raise ValueError("AES-GCM Authentication Failed: Ciphertext tampered or wrong key.")
