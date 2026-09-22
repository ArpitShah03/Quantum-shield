from app.services.crypto.kem_engine import MLKEMEngine
from app.services.crypto.hkdf_engine import HKDFEngine
from app.services.crypto.aes_engine import AESEngine
from app.services.crypto.dsa_engine import MLDSAEngine

import time

class EncryptionService:
    def __init__(self):
        self.kem = MLKEMEngine()
        self.hkdf = HKDFEngine()
        self.aes = AESEngine()
        self.dsa = MLDSAEngine()

    def encrypt_pipeline(self, plaintext: bytes, system_kyber_pk: bytes, uploader_dsa_sk: bytes, paper_id: int, timestamp_str: str) -> dict:
        metrics = {}
        
        # 1. KEM Encapsulation
        t0 = time.perf_counter()
        kyber_ct, shared_secret = self.kem.encapsulate(system_kyber_pk)
        metrics['mlkem_encapsulation_ms'] = round((time.perf_counter() - t0) * 1000, 2)
        
        # 2. HKDF Key Derivation
        aes_key, hkdf_salt = self.hkdf.derive_key(shared_secret)
        
        # 3. AES-GCM Encryption
        t0 = time.perf_counter()
        ciphertext, aes_iv, aes_tag = self.aes.encrypt(plaintext, aes_key)
        metrics['aes_encrypt_ms'] = round((time.perf_counter() - t0) * 1000, 2)
        
        # 4. Hash the structural payload for signature
        t0 = time.perf_counter()
        payload_to_sign = ciphertext + str(paper_id).encode() + timestamp_str.encode()
        sha3_hash = self.dsa.hash_payload(payload_to_sign)
        metrics['sha3_hash_ms'] = round((time.perf_counter() - t0) * 1000, 2)
        
        # 5. DSA Signature
        t0 = time.perf_counter()
        dilithium_sig = self.dsa.sign(sha3_hash, uploader_dsa_sk)
        metrics['mldsa_sign_ms'] = round((time.perf_counter() - t0) * 1000, 2)
        
        return {
            "ciphertext": ciphertext,
            "aes_iv": aes_iv,
            "aes_tag": aes_tag,
            "hkdf_salt": hkdf_salt,
            "kyber_ct": kyber_ct,
            "sha3_hash": sha3_hash,
            "dilithium_sig": dilithium_sig,
            "metrics": metrics
        }
