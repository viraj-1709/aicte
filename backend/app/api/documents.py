import os
import shutil
import hashlib
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse

from ..config import DOCUMENTS_DIR, DATA_DIR
from ..cv_infra.ela_analyzer import perform_error_level_analysis
from .applications import load_applications, save_applications
from ..pipeline.coordinator import run_full_pipeline

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("/{doc_id}/file")
def get_document_file(doc_id: str):
    """Serves the actual document image or PDF for side-by-side officer review"""
    apps = load_applications()
    for app in apps:
        for doc in app.get("documents", []):
            if doc.get("id") == doc_id:
                p = doc.get("file_path")
                if p and os.path.exists(p):
                    media_type = "image/jpeg" if p.endswith((".jpg", ".jpeg")) else "image/png"
                    return FileResponse(p, media_type=media_type)
    raise HTTPException(status_code=404, detail=f"Document {doc_id} not found on disk")

@router.get("/{doc_id}/ela")
def get_document_ela_heatmap(doc_id: str):
    """Serves the Error Level Analysis (ELA) heatmap image for tamper inspection"""
    apps = load_applications()
    for app in apps:
        for doc in app.get("documents", []):
            if doc.get("id") == doc_id:
                ela_path = doc.get("tamper_signals", {}).get("ela_visual_path")
                if ela_path and os.path.exists(ela_path):
                    return FileResponse(ela_path, media_type="image/jpeg")

                # If not generated yet, compute on the fly
                src_path = doc.get("file_path")
                if src_path and os.path.exists(src_path):
                    res = perform_error_level_analysis(src_path)
                    if res.get("ela_visual_path") and os.path.exists(res["ela_visual_path"]):
                        return FileResponse(res["ela_visual_path"], media_type="image/jpeg")
                    return FileResponse(src_path, media_type="image/jpeg")

    raise HTTPException(status_code=404, detail="ELA visual not available")

@router.post("/upload")
async def upload_document(
    application_id: str = Form(...),
    doc_type: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Applicant document upload & rectification endpoint:
    Calculates SHA-256 hash, runs ELA analysis, and triggers incremental pipeline update.
    """
    apps = load_applications()
    app = next((a for a in apps if a["id"] == application_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    file_ext = Path(file.filename).suffix or ".jpg"
    safe_name = f"{application_id}_{doc_type}{file_ext}"
    dest_path = DOCUMENTS_DIR / safe_name

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Compute SHA-256
    h = hashlib.sha256()
    with open(dest_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    file_hash = h.hexdigest()

    # Perform ELA
    ela_res = perform_error_level_analysis(str(dest_path))

    doc_id = f"DOC-{application_id}-{doc_type}"

    # Replace or add document
    new_doc = {
        "id": doc_id,
        "application_id": application_id,
        "doc_type": doc_type,
        "filename": file.filename,
        "file_path": str(dest_path),
        "file_hash": file_hash,
        "file_size": os.path.getsize(dest_path),
        "upload_timestamp": "2026-05-18T12:00:00Z",
        "extracted_fields": {},
        "bounding_boxes": {},
        "tamper_signals": ela_res,
        "metadata": {}
    }

    existing_docs = [d for d in app.get("documents", []) if d.get("doc_type") != doc_type]
    existing_docs.append(new_doc)
    app["documents"] = existing_docs

    # Re-run pipeline
    app = run_full_pipeline(app, apps, record_audit=True)
    save_applications(apps)

    return {
        "status": "UPLOAD_SUCCESS",
        "document_id": doc_id,
        "file_hash": file_hash,
        "updated_risk_score": app.get("risk_score"),
        "total_flags": len(app.get("flags", []))
    }
