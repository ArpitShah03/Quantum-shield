from app.services.crypto.sha3 import verify_hash
from app.services.crypto.dilithium import verify_document_signature
from app.services.crypto.kyber import decapsulate_key
from app.services.crypto.aes import decrypt_file
from app.models.paper import QuestionPaper
from app.models.security_incident import SecurityIncident
from sqlalchemy.orm import Session
import base64

class VerificationError(Exception):
    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(self.reason)

def verify_and_decrypt(paper: QuestionPaper, db: Session, user_id: int, role: str) -> bytes:
    """
    Orchestrates the Post-Quantum verification and decryption pipeline.
    If any verification fails, raises VerificationError and logs a Security Incident.
    """
    try:
        # 1. Read ciphertext
        with open(paper.encrypted_file_path, "rb") as f:
            ciphertext = f.read()

        # 2. Decapsulate AES Key using Kyber
        try:
            # We don't have a secure store for the Kyber Secret Key in this demo.
            # In a real scenario, the exam centre uses their own Kyber Secret Key.
            # For this demo, we read the temporary secret key from disk.
            sk_path = f"{paper.encrypted_file_path}.kyber_sk"
            with open(sk_path, "rb") as f:
                kyber_sk_b64 = f.read().decode('utf-8')
            
            aes_key_b64 = decapsulate_key(paper.encapsulated_aes_key, kyber_sk_b64)
            aes_key = base64.b64decode(aes_key_b64)
        except Exception as e:
            raise VerificationError("Invalid Key Recovery")

        # 3. Decrypt AES
        try:
            nonce = base64.b64decode(paper.aes_nonce)
            auth_tag = base64.b64decode(paper.aes_authentication_tag)
            decrypted_data = decrypt_file(ciphertext, aes_key, nonce, auth_tag)
        except Exception:
             raise VerificationError("AES Decryption Failed")

        # 4. Compare SHA3
        if not verify_hash(decrypted_data, paper.sha3_hash):
            raise VerificationError("Hash Mismatch")

        # 5. Verify Dilithium Signature
        if not verify_document_signature(decrypted_data, paper.dilithium_signature, paper.kyber_public_key):
             raise VerificationError("Invalid Signature")

        return decrypted_data

    except VerificationError as e:
        incident = SecurityIncident(
            user_id=user_id,
            role=role,
            paper_id=paper.id,
            reason=e.reason,
            action="Blocked"
        )
        db.add(incident)
        db.commit()
        raise e
    except Exception as e:
        # Catch unexpected errors (e.g. file missing)
        incident = SecurityIncident(
            user_id=user_id,
            role=role,
            paper_id=paper.id,
            reason=f"Unexpected Error: {str(e)}",
            action="Blocked"
        )
        db.add(incident)
        db.commit()
        raise VerificationError("Unexpected Error")
