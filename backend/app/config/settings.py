from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "QuantumShield Phase 2 API"
    # Defaulting to SQLite since Docker is not available.
    # To use PostgreSQL, set DATABASE_URL in your .env file.
    DATABASE_URL: str = "sqlite:///./quantumshield.db"

    # JWT Settings
    # Read from .env in production. Falls back to demo value for local dev.
    SECRET_KEY: str = "super_secret_quantum_key_phase2_replace_me_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Storage Paths
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

