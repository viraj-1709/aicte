import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from ..config import DATA_DIR
from .hash_chain import HashChainedAuditLedger
from ..models.schemas import AuditBlock

AUDIT_LOG_FILE = DATA_DIR / "audit_log.json"

def get_system_audit_chain() -> List[AuditBlock]:
    if not AUDIT_LOG_FILE.exists():
        genesis = HashChainedAuditLedger.create_genesis_block(
            application_id="SYSTEM",
            details={"description": "AICTE Platform System Audit Ledger Initialized"}
        )
        chain = [genesis]
        save_system_audit_chain(chain)
        return chain
    
    try:
        with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)
            return [AuditBlock(**item) for item in raw]
    except Exception:
        genesis = HashChainedAuditLedger.create_genesis_block(
            application_id="SYSTEM",
            details={"description": "AICTE Platform System Audit Ledger Initialized"}
        )
        chain = [genesis]
        save_system_audit_chain(chain)
        return chain

def save_system_audit_chain(chain: List[AuditBlock]):
    with open(AUDIT_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump([b.model_dump() if hasattr(b, 'model_dump') else b.dict() for b in chain], f, indent=2)

def log_audit_event(
    actor: str,
    action: str,
    application_id: str = "SYSTEM",
    details: Optional[Dict[str, Any]] = None,
    timestamp: Optional[str] = None
) -> AuditBlock:
    chain = get_system_audit_chain()
    if details is None:
        details = {}
    if not timestamp:
        timestamp = datetime.utcnow().isoformat() + "Z"
    
    block = HashChainedAuditLedger.append_block(
        chain=chain,
        application_id=application_id,
        actor=actor,
        action=action,
        details=details,
        timestamp=timestamp
    )
    save_system_audit_chain(chain)
    return block

def log_access_denial(
    user: str,
    role: str,
    target: str,
    action: str = "BACKEND_403_DENIED",
    timestamp: Optional[str] = None,
    reason: Optional[str] = None
) -> AuditBlock:
    if not timestamp:
        timestamp = datetime.utcnow().isoformat() + "Z"
    details = {
        "user": user,
        "role": role,
        "target": target,
        "reason": reason or f"Unauthorized role '{role}' attempted access to '{target}'"
    }
    return log_audit_event(
        actor=user,
        action=action,
        application_id="SYSTEM",
        details=details,
        timestamp=timestamp
    )
