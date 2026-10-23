from typing import Dict, Any, List
import json
from pathlib import Path

from .step1_intake import execute_step1_intake
from .step2_extract import extract_fields_from_document
from .step3_validate import execute_step3_validate
from .step4_anomaly import execute_step4_anomaly
from .step5_verify import execute_step5_verify
from .step6_review import compute_risk_score
from ..cv_infra.geotag_checker import check_photo_geotag
from ..cv_infra.floorplan_detector import analyze_floor_plan
from ..audit.hash_chain import HashChainedAuditLedger
from ..config import DATA_DIR

def load_rules_config() -> Dict[str, Any]:
    cfg_path = DATA_DIR / "rules_config.json"
    if cfg_path.exists():
        with open(cfg_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"rules": []}

def run_full_pipeline(
    application: Dict[str, Any],
    all_known_applications: List[Dict[str, Any]],
    record_audit: bool = True
) -> Dict[str, Any]:
    """
    Executes the entire 6-step AICTE validation pipeline end-to-end:
    1. Intake (Category detection & checklist matching)
    2. Extract (OCR field extraction & visual bounding box mapping)
    3. Validate (Completeness, statutory expiry, cross-document mismatches)
    4. Flag (SHA-256 duplicate detection, ELA image tampering, metadata forensics, reused identifiers)
    5. Infrastructure Check (Photo EXIF geotag & floor plan computer vision)
    6. Verify (Issuing authority API cross-checks, QR & digital signature validation)
    7. Review (Consolidated explainable risk scoring & hash-chained ledger logging)
    """
    rules_cfg = load_rules_config()
    audit_chain = application.get("audit_chain", [])

    # Step 1: Intake
    intake_res = execute_step1_intake(application)
    application["category_name"] = intake_res["category_name"]
    application["pipeline_step"] = 1

    if record_audit and not audit_chain:
        HashChainedAuditLedger.create_genesis_block(
            application["id"],
            {"category": application["category"], "institution": application["institution_name"]}
        )

    # Step 2: Extract (Iterate over documents and extract fields)
    application["pipeline_step"] = 2
    for doc in application.get("documents", []):
        ext_res = extract_fields_from_document(doc)
        if not doc.get("bounding_boxes"):
            doc["bounding_boxes"] = ext_res["bounding_boxes"]

    # Step 3: Validate Rules Engine
    application["pipeline_step"] = 3
    val_flags = execute_step3_validate(application, rules_cfg)

    # Step 4: Anomaly Detection Engine
    application["pipeline_step"] = 4
    anomaly_flags = execute_step4_anomaly(application, all_known_applications)

    # Infrastructure Checks (Geotag & Floor Plan CV)
    infra_flags: List[Dict[str, Any]] = []
    infra_summary: Dict[str, Any] = {}

    docs_by_type = {d["doc_type"]: d for d in application.get("documents", [])}

    # Geotag check
    if "CAMPUS_PHOTO" in docs_by_type:
        c_doc = docs_by_type["CAMPUS_PHOTO"]
        coords = application.get("gps_coordinates", {"latitude": 26.8467, "longitude": 80.9462})
        photo_path = c_doc.get("file_path", "")

        # Check if spoofed coords provided in metadata
        override_coords = None
        if c_doc.get("metadata", {}).get("spoofed_gps"):
            override_coords = tuple(c_doc["metadata"]["spoofed_gps"])

        geo_res = check_photo_geotag(
            photo_path,
            coords.get("latitude", 26.8467),
            coords.get("longitude", 80.9462),
            max_tolerance_meters=1500.0,
            mock_override_coords=override_coords
        )
        infra_summary["geotag_analysis"] = geo_res

        if geo_res["status"] == "FAIL":
            infra_flags.append({
                "id": f"FLAG-INFRA-GEO-{application['id']}",
                "rule_id": "RULE_GEOTAG_PROXIMITY",
                "category": "INFRASTRUCTURE",
                "severity": "HIGH",
                "title": f"Campus Photo Geotag Mismatch ({geo_res.get('distance_km', 0)} km Deviation)",
                "evidence": {
                    "source_doc_id": c_doc.get("id"),
                    "source_doc_type": "CAMPUS_PHOTO",
                    "page": 1,
                    "bounding_box": {"x": 10.0, "y": 10.0, "width": 80.0, "height": 80.0},
                    "snippet": f"Photo GPS: Lat {geo_res.get('photo_lat')}, Lon {geo_res.get('photo_lon')} vs Declared: Lat {coords.get('latitude')}, Lon {coords.get('longitude')}"
                },
                "reason": geo_res["reason"],
                "confidence": geo_res["confidence"],
                "risk_points": 20
            })

    # Floor Plan CV check
    if "FLOOR_PLAN" in docs_by_type:
        fp_doc = docs_by_type["FLOOR_PLAN"]
        fp_path = fp_doc.get("file_path", "")
        fp_res = analyze_floor_plan(
            fp_path,
            declared_classrooms=application.get("declared_classrooms", 12),
            declared_labs=application.get("declared_labs", 4)
        )
        infra_summary["floorplan_analysis"] = fp_res

        if fp_res["status"] == "WARN" and "Shortfall" in fp_res.get("reason", ""):
            infra_flags.append({
                "id": f"FLAG-INFRA-ROOMS-{application['id']}",
                "rule_id": "RULE_FLOORPLAN_COMPLIANCE",
                "category": "INFRASTRUCTURE",
                "severity": "MEDIUM",
                "title": "Instructional Space Deficit Detected by Computer Vision",
                "evidence": {
                    "source_doc_id": fp_doc.get("id"),
                    "source_doc_type": "FLOOR_PLAN",
                    "page": 1,
                    "bounding_box": {"x": 15.0, "y": 20.0, "width": 70.0, "height": 60.0},
                    "snippet": f"Detected {fp_res.get('classroom_count_detected')} classrooms vs declared {application.get('declared_classrooms', 12)}"
                },
                "reason": fp_res["reason"],
                "confidence": fp_res["confidence"],
                "risk_points": 15
            })

    application["infrastructure_check"] = infra_summary

    # Step 5: External Issuer Verification
    application["pipeline_step"] = 5
    verif_results, verif_flags = execute_step5_verify(application)
    application["verification_results"] = verif_results

    # Consolidate all flags
    all_flags = val_flags + anomaly_flags + infra_flags + verif_flags

    # Preserve any existing officer feedback if flags were already tagged
    existing_feedback_map = {f.get("id"): f.get("officer_feedback") for f in application.get("flags", [])}
    for fl in all_flags:
        if fl["id"] in existing_feedback_map:
            fl["officer_feedback"] = existing_feedback_map[fl["id"]]

    application["flags"] = all_flags

    # Step 6: Review & Risk Scoring
    application["pipeline_step"] = 6
    risk_info = compute_risk_score(all_flags)
    application["risk_score"] = risk_info["risk_score"]
    application["risk_band"] = risk_info["risk_band"]
    application["risk_breakdown"] = risk_info["breakdown"]

    # Record Audit Block for pipeline completion
    if record_audit:
        HashChainedAuditLedger.append_block(
            audit_chain,
            application["id"],
            actor="SYSTEM_AI_PIPELINE",
            action="VALIDATION_PIPELINE_EXECUTED",
            details={
                "risk_score": application["risk_score"],
                "risk_band": application["risk_band"],
                "flags_count": len(all_flags),
                "verifications_count": len(verif_results)
            }
        )
        application["audit_chain"] = [b.dict() if hasattr(b, 'dict') else b for b in audit_chain]

    return application
