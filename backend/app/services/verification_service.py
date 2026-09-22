from app.services.crypto.kem_engine import MLKEMEngine
from app.services.crypto.hkdf_engine import HKDFEngine
from app.services.crypto.aes_engine import AESEngine
from app.services.crypto.dsa_engine import MLDSAEngine

import time

class VerificationError(Exception):
    def __init__(self, stage: str, reason: str):
        self.stage = stage
        self.reason = reason
        super().__init__(reason)

class VerificationService:
    def __init__(self):
        self.kem = MLKEMEngine()
        self.hkdf = HKDFEngine()
        self.aes = AESEngine()
        self.dsa = MLDSAEngine()

    def verify_pipeline(self, meta: dict, system_kyber_sk: bytes, uploader_dsa_pk: bytes) -> tuple:
        metrics = {}
        
        # Reconstruct signature payload
        t0 = time.perf_counter()
        payload_to_sign = meta["ciphertext"] + str(meta["paper_id"]).encode() + meta["timestamp"].isoformat().encode()
        sha3_hash = self.dsa.hash_payload(payload_to_sign)
        metrics['sha3_verify_ms'] = round((time.perf_counter() - t0) * 1000, 2)
        
        # 1. Verify SHA3 structural hash match
        if sha3_hash != meta["sha3_hash"]:
            raise VerificationError("SHA3", "Integrity mismatch detected. Ciphertext was modified.")
            
        # 2. Verify DSA Signature
        t0 = time.perf_counter()
        if not self.dsa.verify(sha3_hash, meta["dilithium_sig"], uploader_dsa_pk):
            raise VerificationError("ML-DSA", "Digital signature is invalid.")
        metrics['mldsa_verify_ms'] = round((time.perf_counter() - t0) * 1000, 2)
            
        # 3. KEM Decapsulation
        t0 = time.perf_counter()
        try:
            shared_secret = self.kem.decapsulate(meta["kyber_ct"], system_kyber_sk)
        except Exception:
            raise VerificationError("ML-KEM", "Key encapsulation verification failed.")
        metrics['mlkem_decapsulation_ms'] = round((time.perf_counter() - t0) * 1000, 2)
            
        # 4. HKDF Key Derivation
        try:
            aes_key, _ = self.hkdf.derive_key(shared_secret, meta["hkdf_salt"])
        except Exception:
            raise VerificationError("HKDF", "Key derivation failed.")
        
        # 5. AES Decryption & Auth Tag Verification
        t0 = time.perf_counter()
        try:
            plaintext = self.aes.decrypt(meta["ciphertext"], meta["aes_iv"], meta["aes_tag"], aes_key)
        except Exception:
            raise VerificationError("AES", "Authentication tag verification failed.")
        metrics['aes_decrypt_ms'] = round((time.perf_counter() - t0) * 1000, 2)
            
        return plaintext, metrics
