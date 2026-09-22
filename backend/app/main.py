from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine
from app.models.models import Base
from app.routers import auth, papers

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QuantumShield V2 API",
    description="Post-Quantum Secure Exam Paper Distribution Framework API",
    version="2.0.0"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(papers.router)

@app.get("/")
def root():
    return {"message": "Welcome to QuantumShield V2 API"}
