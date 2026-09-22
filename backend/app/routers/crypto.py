from fastapi import APIRouter, UploadFile, File, HTTPException
import base64
from app.services.crypto.aes import generate_aes_key, encrypt_file, decrypt_file
from app.services.crypto.sha3 import generate_hash, verify_hash

router = APIRouter(prefix="/crypto", tags=["Cryptography (Tamper Testing)"])

@router.post("/encrypt")
def test_encrypt(file: UploadFile = File(...)):
    file_data = file.file.read()
    aes_key = generate_aes_key()
    ciphertext, nonce, auth_tag = encrypt_file(file_data, aes_key)
    
    return {
        "message": "File encrypted successfully",
        "aes_key_base64": base64.b64encode(aes_key).decode('utf-8'),
        "nonce_base64": base64.b64encode(nonce).decode('utf-8'),
        "auth_tag_base64": base64.b64encode(auth_tag).decode('utf-8'),
        "ciphertext_base64": base64.b64encode(ciphertext).decode('utf-8')
    }

@router.post("/decrypt")
def test_decrypt(
    aes_key_base64: str,
    nonce_base64: str,
    auth_tag_base64: str,
    ciphertext_base64: str
):
    try:
        aes_key = base64.b64decode(aes_key_base64)
        nonce = base64.b64decode(nonce_base64)
        auth_tag = base64.b64decode(auth_tag_base64)
        ciphertext = base64.b64decode(ciphertext_base64)
        
        decrypted = decrypt_file(ciphertext, aes_key, nonce, auth_tag)
        return {"message": "Decryption successful", "decrypted_bytes_length": len(decrypted)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Decryption failed: {str(e)}")

@router.post("/hash")
def test_hash(file: UploadFile = File(...)):
    file_data = file.file.read()
    h = generate_hash(file_data)
    return {"sha3_256": h}

@router.post("/verify")
def test_verify(expected_hash: str, file: UploadFile = File(...)):
    file_data = file.file.read()
    is_valid = verify_hash(file_data, expected_hash)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Tampered: Hash mismatch")
    return {"status": "Verified"}
