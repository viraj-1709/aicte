import json
import os
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from fastapi.responses import FileResponse

from ..config import DATA_DIR, STORAGE_DIR
from ..models.schemas import (
    ApplicationDetail,
    OfficerDecisionRequest,
    FeedbackRequest,
    FlagItem
)
from ..pipeline.coordinator import run_full_pipeline
from ..audit.hash_chain import HashChainedAuditLedger
from ..audit.pdf_exporter import generate_audit_pdf
from ..auth import require_role

router = APIRouter(prefix="/api/applications", tags=["Applications"])

def get_db_path() -> Path:
    return DATA_DIR / "applications_db.json"

def load_applications() -> List[dict]:
    p = get_db_path()
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_applications(apps: List[dict]):
    p = get_db_path()
    with open(p, "w", encoding="utf-8") as f:
        json.dump(apps, f, indent=2)

@router.get("", response_model=List[dict], dependencies=[Depends(require_role(["OFFICER"]))])
def list_applications(
    category: Optional[str] = None,
    status: Optional[str] = None,
    sort_by_risk: bool = True
):
    """
    Returns application queue. Sorted by Risk Score (descending) by default
    so high-risk dossiers are scrutinized first.
    """
    apps = load_applications()
    
    # Process through pipeline if not yet processed
    all_processed = []
    for a in apps:
        if not a.get("risk_breakdown") or len(a.get("flags", [])) == 0:
            a = run_full_pipeline(a, apps, record_audit=False)
        all_processed.append(a)

    if category:
        all_processed = [a for a in all_processed if a.get("category") == category]
    if status:
        all_processed = [a for a in all_processed if a.get("status") == status]

    if sort_by_risk:
        all_processed.sort(key=lambda x: x.get("risk_score", 0), reverse=True)

    return all_processed

@router.get("/{app_id}", dependencies=[Depends(require_role(["OFFICER", "APPLICANT"]))])
def get_application(app_id: str):
    """
    Fetches consolidated case dossier for scrutiny review.
    """
    apps = load_applications()
    app = next((a for a in apps if a["id"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")

    # Run full pipeline to ensure latest flags and verification statuses
    app = run_full_pipeline(app, apps, record_audit=False)
    return app

@router.post("/{app_id}/precheck", dependencies=[Depends(require_role(["APPLICANT"]))])
def applicant_precheck(app_id: str):
    """
    Applicant Pre-Check: Instant non-binding pre-submission feedback.
    Detects missing files, expired dates, and mismatches early so applicants can rectify.
    """
    apps = load_applications()
    app = next((a for a in apps if a["id"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    processed = run_full_pipeline(app, apps, record_audit=False)
    flags = processed.get("flags", [])

    return {
        "application_id": app_id,
        "is_ready_for_submission": len([f for f in flags if f.get("severity") == "CRITICAL"]) == 0,
        "risk_score_estimate": processed.get("risk_score", 0),
        "total_gaps_found": len(flags),
        "critical_deficits": [f for f in flags if f.get("severity") == "CRITICAL"],
        "advisory_warnings": [f for f in flags if f.get("severity") != "CRITICAL"],
        "message": (
            "Pre-Check Complete. Fix highlighted gaps and re-upload documents before final submission to avoid technical scrutiny rejection."
            if flags else
            "All preliminary checklist items and statutory documents appear valid! Ready for official submission."
        )
    }

@router.post("/{app_id}/decision", dependencies=[Depends(require_role(["OFFICER"]))])
def record_officer_decision(app_id: str, req: OfficerDecisionRequest):
    """
    Scrutiny Officer Records Statutory Decision (Accept / Reject / Request Clarification).
    Requires mandatory scrutiny remarks. Cryptographically logs to immutable audit trail.
    """
    if not req.remarks or len(req.remarks.strip()) < 10:
        raise HTTPException(status_code=400, detail="Mandatory scrutiny remarks must contain at least 10 characters.")

    apps = load_applications()
    app = next((a for a in apps if a["id"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    decision_timestamp = datetime.utcnow().isoformat() + "Z"
    app["status"] = req.decision
    app["officer_decision"] = {
        "decision": req.decision,
        "remarks": req.remarks,
        "officer_name": req.officer_name,
        "timestamp": decision_timestamp
    }

    # Append to hash-chained audit ledger
    audit_chain = app.get("audit_chain", [])
    HashChainedAuditLedger.append_block(
        audit_chain,
        app_id,
        actor=req.officer_name,
        action=f"STATUTORY_DECISION_{req.decision}",
        details={
            "decision": req.decision,
            "remarks": req.remarks,
            "risk_score_at_decision": app.get("risk_score", 0)
        },
        timestamp=decision_timestamp
    )
    app["audit_chain"] = [b.dict() if hasattr(b, 'dict') else b for b in audit_chain]

    save_applications(apps)
    return {
        "status": "SUCCESS",
        "application_id": app_id,
        "new_status": req.decision,
        "officer": req.officer_name,
        "timestamp": decision_timestamp
    }

@router.post("/{app_id}/feedback", dependencies=[Depends(require_role(["OFFICER"]))])
def submit_officer_feedback(app_id: str, req: FeedbackRequest):
    """
    Human-in-the-loop feedback:
    Officer marks flag as 'CORRECT' (Real issue) or 'FALSE_ALARM'.
    Adjusts application risk score and records feedback for admin analytics.
    """
    apps = load_applications()
    app = next((a for a in apps if a["id"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    flag_found = False
    for f in app.get("flags", []):
        if f.get("id") == req.flag_id:
            f["officer_feedback"] = req.feedback
            f["officer_remarks"] = req.officer_remarks
            flag_found = True
            break

    if not flag_found:
        raise HTTPException(status_code=404, detail=f"Flag {req.flag_id} not found on application")

    # Re-run pipeline to recalculate effective risk score
    app = run_full_pipeline(app, apps, record_audit=False)

    # Log feedback block
    audit_chain = app.get("audit_chain", [])
    HashChainedAuditLedger.append_block(
        audit_chain,
        app_id,
        actor="SCRUTINY_OFFICER",
        action="HUMAN_IN_THE_LOOP_FEEDBACK",
        details={
            "flag_id": req.flag_id,
            "feedback": req.feedback,
            "officer_remarks": req.officer_remarks
        }
    )
    app["audit_chain"] = [b.dict() if hasattr(b, 'dict') else b for b in audit_chain]

    save_applications(apps)
    return {
        "status": "SUCCESS",
        "flag_id": req.flag_id,
        "feedback": req.feedback,
        "updated_risk_score": app.get("risk_score")
    }

@router.get("/{app_id}/verify-audit", dependencies=[Depends(require_role(["OFFICER", "ADMIN"]))])
def verify_audit_trail(app_id: str):
    """
    Cryptographically verifies SHA-256 chain integrity of the immutable audit ledger.
    """
    apps = load_applications()
    app = next((a for a in apps if a["id"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    raw_chain = app.get("audit_chain", [])
    # Convert dicts back to AuditBlock model
    from ..models.schemas import AuditBlock
    chain = [AuditBlock(**b) if isinstance(b, dict) else b for b in raw_chain]

    res = HashChainedAuditLedger.verify_chain_integrity(chain)
    return res

@router.get("/{app_id}/audit-pdf", dependencies=[Depends(require_role(["OFFICER", "ADMIN"]))])
def download_audit_pdf(app_id: str):
    """
    Generates and downloads the official AICTE Scrutiny Dossier & Audit Certificate PDF.
    """
    apps = load_applications()
    app = next((a for a in apps if a["id"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Run pipeline to ensure complete data
    app = run_full_pipeline(app, apps, record_audit=False)

    pdf_filename = f"AICTE_Scrutiny_Certificate_{app_id}.pdf"
    pdf_path = str(STORAGE_DIR / pdf_filename)
    generate_audit_pdf(app, pdf_path)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=pdf_filename
    )
