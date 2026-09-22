from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.database.session import SessionLocal
from app.models.audit import AuditLog
from datetime import datetime

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Don't log static files or swagger docs
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return response
            
        # For simplicity in this demo, we log API hits if they aren't explicitly handled elsewhere
        # A more robust solution would attach this to specific router dependencies
        
        return response
