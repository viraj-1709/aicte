from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header, Request, Depends
from pydantic import BaseModel
from .audit.access_logger import log_access_denial, get_system_audit_chain

router = APIRouter(prefix="/api/auth", tags=["Authentication & Access Control"])

class DenialReport(BaseModel):
    user: str
    role: str
    target_path: str
    timestamp: Optional[str] = None
    reason: Optional[str] = None

@router.post("/log-denial")
def report_access_denial(report: DenialReport):
    """
    Called by frontend RequireRole route guard when an unauthorized role attempt is intercepted.
    Logs the denied attempt to the cryptographic audit trail.
    """
    ts = report.timestamp or (datetime.utcnow().isoformat() + "Z")
    block = log_access_denial(
        user=report.user,
        role=report.role,
        target=report.target_path,
        action="FRONTEND_REDIRECT_DENIED",
        timestamp=ts,
        reason=report.reason or f"Frontend RequireRole redirected user from {report.target_path}"
    )
    return {
        "status": "RECORDED",
        "block_index": block.index,
        "hash": block.hash,
        "timestamp": block.timestamp
    }

@router.get("/audit-denials")
def list_denial_audit_logs():
    """
    Returns audit blocks that record backend 403s or frontend redirect denials.
    """
    chain = get_system_audit_chain()
    denials = [
        b.model_dump() if hasattr(b, 'model_dump') else b.dict()
        for b in chain
        if "DENIED" in b.action
    ]
    return denials

def require_role(allowed_roles: List[str]):
    """
    FastAPI dependency that enforces strict role-based access control on endpoints.
    Returns 403 and writes to audit trail if the caller's role is not in allowed_roles.
    """
    def dependency(
        request: Request,
        x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
        x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
        x_user_name: Optional[str] = Header(None, alias="X-User-Name")
    ):
        role = (x_user_role or "").upper().strip()
        user = x_user_name or x_user_id or "anonymous"
        target = f"{request.method} {request.url.path}"
        normalized_allowed = [r.upper().strip() for r in allowed_roles]

        if not role or role not in normalized_allowed:
            ts = datetime.utcnow().isoformat() + "Z"
            log_access_denial(
                user=user,
                role=role or "UNAUTHENTICATED",
                target=target,
                action="BACKEND_403_DENIED",
                timestamp=ts,
                reason=f"Role '{role}' is not in authorized list: {allowed_roles}"
            )
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden: Role '{role}' lacks statutory authority for {request.url.path}"
            )
        return {
            "user_id": x_user_id or user,
            "user_name": user,
            "role": role
        }
    return dependency
