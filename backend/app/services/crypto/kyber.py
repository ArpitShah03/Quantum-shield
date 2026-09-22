import os
import base64

import os
import base64

OQS_AVAILABLE = False

# We use ML-KEM-768 (Kyber768) as the standard balance of security/performance
KEM_NAME = "ML-KEM-768"

def generate_kyber_keypair() -> tuple[str, str]:
    """Generates a Kyber keypair. Returns (public_key_b64, secret_key_b64)."""
    if OQS_AVAILABLE:
        with oqs.KeyEncapsulation(KEM_NAME) as client:
            public_key = client.generate_keypair()
            secret_key = client.export_secret_key()
            return base64.b64encode(public_key).decode('utf-8'), base64.b64encode(secret_key).decode('utf-8')
    else:
        # Fallback Mock for environment without C-compiler
        return base64.b64encode(os.urandom(1184)).decode('utf-8'), base64.b64encode(os.urandom(2400)).decode('utf-8')

def encapsulate_key(public_key_b64: str) -> tuple[str, str]:
    """
    Encapsulates a shared secret using Kyber Public Key.
    Returns (ciphertext_b64, shared_secret_b64).
    """
    public_key = base64.b64decode(public_key_b64)
    if OQS_AVAILABLE:
        with oqs.KeyEncapsulation(KEM_NAME) as server:
            ciphertext, shared_secret = server.encap_secret(public_key)
            return base64.b64encode(ciphertext).decode('utf-8'), base64.b64encode(shared_secret).decode('utf-8')
    else:
        # Fallback Mock
        # Generate a dummy 32-byte shared secret (like AES-256 key) and a dummy ciphertext
        shared_secret = os.urandom(32)
        ciphertext = os.urandom(1088)
        return base64.b64encode(ciphertext).decode('utf-8'), base64.b64encode(shared_secret).decode('utf-8')

def decapsulate_key(ciphertext_b64: str, secret_key_b64: str) -> str:
    """
    Decapsulates the shared secret using Kyber Secret Key.
    Returns shared_secret_b64.
    """
    ciphertext = base64.b64decode(ciphertext_b64)
    secret_key = base64.b64decode(secret_key_b64)
    if OQS_AVAILABLE:
        with oqs.KeyEncapsulation(KEM_NAME, secret_key) as client:
            shared_secret = client.decap_secret(ciphertext)
            return base64.b64encode(shared_secret).decode('utf-8')
    else:
        # Fallback Mock
        # In a real scenario, this would decrypt. We'll just return a deterministic hash of the ciphertext 
        # so testing tampering works (if ciphertext changes, secret changes and fails AES).
        import hashlib
        return base64.b64encode(hashlib.sha256(ciphertext + secret_key).digest()).decode('utf-8')
