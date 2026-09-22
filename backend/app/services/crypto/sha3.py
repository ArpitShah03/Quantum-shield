import hashlib

def generate_hash(file_data: bytes) -> str:
    """Generate SHA3-256 hash."""
    sha3 = hashlib.sha3_256()
    sha3.update(file_data)
    return sha3.hexdigest()

def verify_hash(file_data: bytes, expected_hash: str) -> bool:
    """Verify SHA3-256 hash."""
    return generate_hash(file_data) == expected_hash
