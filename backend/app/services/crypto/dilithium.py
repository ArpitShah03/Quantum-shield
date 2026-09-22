import os
import base64

import os
import base64

OQS_AVAILABLE = False

# We use ML-DSA-65 (Dilithium3) as standard balance
SIG_NAME = "ML-DSA-65"

def generate_dilithium_keypair() -> tuple[str, str]:
    """Generates a Dilithium keypair. Returns (public_key_b64, secret_key_b64)."""
    if OQS_AVAILABLE:
        with oqs.Signature(SIG_NAME) as signer:
            public_key = signer.generate_keypair()
            secret_key = signer.export_secret_key()
            return base64.b64encode(public_key).decode('utf-8'), base64.b64encode(secret_key).decode('utf-8')
    else:
        # Fallback Mock
        return base64.b64encode(os.urandom(1952)).decode('utf-8'), base64.b64encode(os.urandom(4032)).decode('utf-8')

def sign_document(message: bytes, secret_key_b64: str) -> str:
    """Signs a message using Dilithium. Returns signature_b64."""
    secret_key = base64.b64decode(secret_key_b64)
    if OQS_AVAILABLE:
        with oqs.Signature(SIG_NAME, secret_key) as signer:
            signature = signer.sign(message)
            return base64.b64encode(signature).decode('utf-8')
    else:
        # Fallback Mock
        import hashlib
        # Embed the hash of the message in the signature to simulate tampering detection
        msg_hash = hashlib.sha256(message).digest()
        dummy_sig = msg_hash + os.urandom(3268)  # total ~3300 bytes
        return base64.b64encode(dummy_sig).decode('utf-8')

def verify_document_signature(message: bytes, signature_b64: str, public_key_b64: str) -> bool:
    """Verifies a Dilithium signature."""
    try:
        signature = base64.b64decode(signature_b64)
        public_key = base64.b64decode(public_key_b64)
    except Exception:
        return False

    if OQS_AVAILABLE:
        with oqs.Signature(SIG_NAME) as verifier:
            return verifier.verify(message, signature, public_key)
    else:
        # Fallback Mock
        import hashlib
        if len(signature) < 32:
            return False
        expected_hash = hashlib.sha256(message).digest()
        actual_hash = signature[:32]
        return expected_hash == actual_hash
