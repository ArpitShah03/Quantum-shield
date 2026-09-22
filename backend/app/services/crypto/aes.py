import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def generate_aes_key() -> bytes:
    """Generate a random 256-bit AES key."""
    return AESGCM.generate_key(bit_length=256)

def encrypt_file(file_data: bytes, key: bytes) -> tuple[bytes, bytes, bytes]:
    """Encrypt using AES-256-GCM. Returns (ciphertext, nonce, auth_tag)."""
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # Recommended 96-bit nonce for GCM
    ct_with_tag = aesgcm.encrypt(nonce, file_data, None)
    ciphertext = ct_with_tag[:-16]
    auth_tag = ct_with_tag[-16:]
    return ciphertext, nonce, auth_tag

def decrypt_file(ciphertext: bytes, key: bytes, nonce: bytes, auth_tag: bytes) -> bytes:
    """Decrypt using AES-256-GCM."""
    aesgcm = AESGCM(key)
    ct_with_tag = ciphertext + auth_tag
    return aesgcm.decrypt(nonce, ct_with_tag, None)
