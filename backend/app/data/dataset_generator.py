import json
import hashlib
import os
from pathlib import Path
from datetime import datetime, timedelta
import random

from ..config import DOCUMENTS_DIR, DATA_DIR
from .doc_image_helper import (
    generate_document_image,
    generate_blueprint_image,
    generate_campus_photo
)
from ..cv_infra.ela_analyzer import perform_error_level_analysis
from ..audit.hash_chain import HashChainedAuditLedger

def get_file_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def generate_synthetic_dataset():
    print("Generating AICTE synthetic applications and documents...")
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    applications = []
    ground_truth = []

    # Common states & cities
    locations = [
        {"state": "Uttar Pradesh", "district": "Lucknow", "lat": 26.8467, "lon": 80.9462},
        {"state": "Maharashtra", "district": "Pune", "lat": 18.5204, "lon": 73.8567},
        {"state": "Karnataka", "district": "Bengaluru Rural", "lat": 12.9716, "lon": 77.5946},
        {"state": "Tamil Nadu", "district": "Coimbatore", "lat": 11.0168, "lon": 76.9558},
        {"state": "Gujarat", "district": "Ahmedabad", "lat": 23.0225, "lon": 72.5714},
        {"state": "Madhya Pradesh", "district": "Bhopal", "lat": 23.2599, "lon": 77.4126},
        {"state": "Rajasthan", "district": "Jaipur", "lat": 26.9124, "lon": 75.7873},
        {"state": "Telangana", "district": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
        {"state": "Kerala", "district": "Ernakulam", "lat": 9.9816, "lon": 76.2999},
        {"state": "Punjab", "district": "Ludhiana", "lat": 30.9010, "lon": 75.8573}
    ]

    # Pre-generate duplicate certificate template file to test SHA-256 collisions
    shared_cert_path = str(DOCUMENTS_DIR / "shared_trust_certificate.jpg")
    generate_document_image(
        shared_cert_path,
        "SOCIETY REGISTRATION CERTIFICATE",
        "OFFICE OF REGISTRAR OF SOCIETIES & CHITS",
        {
            "registration_no": "SOC/MH/2012/4412",
            "society_name": "Sahyadri Pratishthan Educational Society",
            "registration_date": "2012-08-19",
            "valid_upto": "2032-08-18"
        },
        "TRUST_DEED",
        is_tampered=False
    )
    shared_cert_hash = get_file_sha256(shared_cert_path)

    # -------------------------------------------------------------
    # 1. Clean Reference Application: Apex Institute of Engineering & Technology
    # -------------------------------------------------------------
    apex_clean_id = "AICTE-2026-APEX-CLEAN"
    apex_clean_docs = []

    # Trust deed
    t_clean_path = str(DOCUMENTS_DIR / f"{apex_clean_id}_trust_deed.jpg")
    generate_document_image(
        t_clean_path,
        "REGISTERED TRUST DEED & MOA",
        "SUB-REGISTRAR OFFICE (LUCKNOW SADAR)",
        {
            "trust_name": "Apex Educational & Charitable Trust",
            "registration_no": "SOC/UP/2014/8839",
            "registration_date": "2014-04-12",
            "valid_upto": "2034-04-11",
            "chairman": "Dr. Ramesh Chandra Verma"
        },
        "TRUST_DEED"
    )
    apex_clean_docs.append({
        "id": f"DOC-{apex_clean_id}-TRUST",
        "application_id": apex_clean_id,
        "doc_type": "TRUST_DEED",
        "filename": "Apex_Registered_Trust_Deed.jpg",
        "file_path": t_clean_path,
        "file_hash": get_file_sha256(t_clean_path),
        "file_size": os.path.getsize(t_clean_path),
        "upload_timestamp": "2026-05-10T10:15:00Z",
        "extracted_fields": {
            "trust_name": "Apex Educational & Charitable Trust",
            "registration_no": "SOC/UP/2014/8839",
            "registration_date": "2014-04-12",
            "valid_upto": "2034-04-11"
        },
        "bounding_boxes": {},
        "metadata": {"creator": "Canon Flatbed Scanner DR-C225", "created_date": "2026-05-09"}
    })

    # Land deed
    l_clean_path = str(DOCUMENTS_DIR / f"{apex_clean_id}_land_deed.jpg")
    generate_document_image(
        l_clean_path,
        "SALE DEED & TITLE CONVEYANCE",
        "REVENUE & REGISTRATION DEPARTMENT, U.P.",
        {
            "owner_name": "Apex Educational & Charitable Trust",
            "survey_no": "SURVEY-84/2A",
            "land_area_acres": 5.25,
            "registration_date": "2015-06-14",
            "district": "Lucknow"
        },
        "LAND_DOCUMENT"
    )
    apex_clean_docs.append({
        "id": f"DOC-{apex_clean_id}-LAND",
        "application_id": apex_clean_id,
        "doc_type": "LAND_DOCUMENT",
        "filename": "Apex_Land_Sale_Deed_5.25Acres.jpg",
        "file_path": l_clean_path,
        "file_hash": get_file_sha256(l_clean_path),
        "file_size": os.path.getsize(l_clean_path),
        "upload_timestamp": "2026-05-10T10:18:00Z",
        "extracted_fields": {
            "owner_name": "Apex Educational & Charitable Trust",
            "survey_no": "SURVEY-84/2A",
            "land_area_acres": 5.25,
            "registration_date": "2015-06-14"
        },
        "bounding_boxes": {},
        "metadata": {"creator": "Canon Flatbed Scanner DR-C225"}
    })

    # Building plan
    bp_clean_path = str(DOCUMENTS_DIR / f"{apex_clean_id}_building_plan.jpg")
    generate_blueprint_image(bp_clean_path, "Apex Campus Main Block", 12, 4)
    apex_clean_docs.append({
        "id": f"DOC-{apex_clean_id}-BPLAN",
        "application_id": apex_clean_id,
        "doc_type": "BUILDING_PLAN",
        "filename": "Approved_Building_Sanction_Plan.jpg",
        "file_path": bp_clean_path,
        "file_hash": get_file_sha256(bp_clean_path),
        "file_size": os.path.getsize(bp_clean_path),
        "upload_timestamp": "2026-05-10T10:20:00Z",
        "extracted_fields": {
            "approval_no": "LDA/BP/2022/719",
            "approval_date": "2022-09-15",
            "total_builtup_area_sqm": 5200
        },
        "bounding_boxes": {},
        "metadata": {"software": "AutoCAD 2024 Arch"}
    })

    # Fire NOC (Valid)
    f_clean_path = str(DOCUMENTS_DIR / f"{apex_clean_id}_fire_noc.jpg")
    generate_document_image(
        f_clean_path,
        "FIRE SAFETY NO OBJECTION CERTIFICATE",
        "DIRECTORATE OF FIRE & EMERGENCY SERVICES, U.P.",
        {
            "noc_number": "UP-FS/2025/NOC-4491",
            "institution_name": "Apex Institute of Engineering & Technology",
            "issue_date": "2025-06-10",
            "expiry_date": "2027-06-09",
            "issuing_officer": "Divisional Fire Officer, Lucknow"
        },
        "FIRE_NOC"
    )
    apex_clean_docs.append({
        "id": f"DOC-{apex_clean_id}-FIRE",
        "application_id": apex_clean_id,
        "doc_type": "FIRE_NOC",
        "filename": "Fire_Safety_Clearance_NOC_2025_27.jpg",
        "file_path": f_clean_path,
        "file_hash": get_file_sha256(f_clean_path),
        "file_size": os.path.getsize(f_clean_path),
        "upload_timestamp": "2026-05-10T10:22:00Z",
        "extracted_fields": {
            "noc_number": "UP-FS/2025/NOC-4491",
            "issue_date": "2025-06-10",
            "expiry_date": "2027-06-09"
        },
        "bounding_boxes": {},
        "metadata": {"creator": "U.P. Fire e-Vault Signer"}
    })

    # Affidavit
    aff_clean_path = str(DOCUMENTS_DIR / f"{apex_clean_id}_affidavit.jpg")
    generate_document_image(
        aff_clean_path,
        "AFFIDAVIT ON NOTARIAL STAMP PAPER (FORMAT-1)",
        "GOVERNMENT OF UTTAR PRADESH - NOTARY CELL",
        {
            "deponent_name": "Dr. Ramesh Chandra Verma",
            "notary_reg_no": "NOTARY/UP/4901",
            "date_of_swearing": "2026-05-02"
        },
        "AFFIDAVIT_1"
    )
    apex_clean_docs.append({
        "id": f"DOC-{apex_clean_id}-AFFIDAVIT",
        "application_id": apex_clean_id,
        "doc_type": "AFFIDAVIT_1",
        "filename": "AICTE_Affidavit_Format1_StampPaper.jpg",
        "file_path": aff_clean_path,
        "file_hash": get_file_sha256(aff_clean_path),
        "file_size": os.path.getsize(aff_clean_path),
        "upload_timestamp": "2026-05-10T10:25:00Z",
        "extracted_fields": {"notary_reg_no": "NOTARY/UP/4901", "deponent_name": "Dr. Ramesh Chandra Verma"},
        "bounding_boxes": {},
        "metadata": {}
    })

    # Architect Cert
    arc_clean_path = str(DOCUMENTS_DIR / f"{apex_clean_id}_architect_cert.jpg")
    generate_document_image(
        arc_clean_path,
        "COUNCIL OF ARCHITECTURE COMPLETION CERTIFICATE",
        "STATUTORY ARCHITECTURAL VERIFICATION",
        {
            "architect_name": "Ar. Vikram Singhania",
            "coa_registration_no": "CA/2008/42119",
            "total_carpet_area_sqm": 4950
        },
        "ARCHITECT_CERT"
    )
    apex_clean_docs.append({
        "id": f"DOC-{apex_clean_id}-ARCH",
        "application_id": apex_clean_id,
        "doc_type": "ARCHITECT_CERT",
        "filename": "Architect_CoA_Compliance_Certificate.jpg",
        "file_path": arc_clean_path,
        "file_hash": get_file_sha256(arc_clean_path),
        "file_size": os.path.getsize(arc_clean_path),
        "upload_timestamp": "2026-05-10T10:27:00Z",
        "extracted_fields": {
            "architect_name": "Ar. Vikram Singhania",
            "coa_registration_no": "CA/2008/42119"
        },
        "bounding_boxes": {},
        "metadata": {}
    })

    # Campus photo (valid geotag near declared campus)
    photo_clean_path = str(DOCUMENTS_DIR / f"{apex_clean_id}_campus_photo.jpg")
    generate_campus_photo(photo_clean_path, "Apex Institute of Eng & Tech", 26.8469, 80.9465)
    apex_clean_docs.append({
        "id": f"DOC-{apex_clean_id}-PHOTO",
        "application_id": apex_clean_id,
        "doc_type": "CAMPUS_PHOTO",
        "filename": "Front_Quadrangle_GeoTagged_Photo.jpg",
        "file_path": photo_clean_path,
        "file_hash": get_file_sha256(photo_clean_path),
        "file_size": os.path.getsize(photo_clean_path),
        "upload_timestamp": "2026-05-10T10:30:00Z",
        "extracted_fields": {"gps_latitude": 26.8469, "gps_longitude": 80.9465},
        "bounding_boxes": {},
        "metadata": {"spoofed_gps": (26.8469, 80.9465)}
    })

    # Floor plan
    fp_clean_path = str(DOCUMENTS_DIR / f"{apex_clean_id}_floor_plan.jpg")
    generate_blueprint_image(fp_clean_path, "Apex Academic Complex", 12, 4)
    apex_clean_docs.append({
        "id": f"DOC-{apex_clean_id}-FPLAN",
        "application_id": apex_clean_id,
        "doc_type": "FLOOR_PLAN",
        "filename": "Detailed_Instructional_Floor_Plan.jpg",
        "file_path": fp_clean_path,
        "file_hash": get_file_sha256(fp_clean_path),
        "file_size": os.path.getsize(fp_clean_path),
        "upload_timestamp": "2026-05-10T10:32:00Z",
        "extracted_fields": {"classroom_count": 12, "lab_count": 4},
        "bounding_boxes": {},
        "metadata": {}
    })

    apex_clean_app = {
        "id": apex_clean_id,
        "category": "NEW_INSTITUTION",
        "category_name": "Setting up New Technical Institution",
        "institution_name": "Apex Institute of Engineering & Technology",
        "trust_name": "Apex Educational & Charitable Trust",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "address": "Plot 14-16, Knowledge Park IV, Mohanlalganj, Lucknow",
        "gps_coordinates": {"latitude": 26.8467, "longitude": 80.9462},
        "land_area_acres": 5.25,
        "declared_classrooms": 12,
        "declared_labs": 4,
        "status": "SUBMITTED",
        "created_at": "2026-05-10T10:00:00Z",
        "submitted_at": "2026-05-10T11:00:00Z",
        "pipeline_step": 6,
        "risk_score": 0,
        "risk_band": "LOW",
        "risk_breakdown": [],
        "flags": [],
        "verification_results": [],
        "documents": apex_clean_docs,
        "infrastructure_check": {},
        "is_tampered_demo": False,
        "audit_chain": []
    }
    applications.append(apex_clean_app)
    ground_truth.append({
        "application_id": apex_clean_id,
        "is_clean": True,
        "expected_risk_band": "LOW",
        "injected_defects": []
    })

    # -------------------------------------------------------------
    # 2. Tampered Twin: Apex Institute (Tampered Twin for Demo Mode)
    # Injected Defects:
    # 1. Fire NOC: Date altered from 2024 to 2027 (high ELA anomaly + registry mismatch)
    # 2. Swapped Trust Name on Land Deed ("Apex Charitable Society")
    # 3. Duplicate Document File Hash (SHA-256 collision from another college)
    # 4. Geotag photo taken 480 km away in New Delhi instead of Lucknow
    # -------------------------------------------------------------
    apex_tampered_id = "AICTE-2026-APEX-TAMPERED"
    apex_tampered_docs = []

    # Tampered Doc 1: Reused Society Certificate (Exact SHA-256 collision with shared cert)
    apex_tampered_docs.append({
        "id": f"DOC-{apex_tampered_id}-TRUST",
        "application_id": apex_tampered_id,
        "doc_type": "TRUST_DEED",
        "filename": "Apex_Reused_Trust_Certificate.jpg",
        "file_path": shared_cert_path,
        "file_hash": shared_cert_hash,
        "file_size": os.path.getsize(shared_cert_path),
        "upload_timestamp": "2026-05-12T14:10:00Z",
        "extracted_fields": {
            "trust_name": "Sahyadri Pratishthan Educational Society",
            "registration_no": "SOC/MH/2012/4412",
            "registration_date": "2012-08-19"
        },
        "bounding_boxes": {},
        "metadata": {}
    })

    # Tampered Doc 2: Land Deed with Swapped Entity Name
    l_tamp_path = str(DOCUMENTS_DIR / f"{apex_tampered_id}_land_deed.jpg")
    generate_document_image(
        l_tamp_path,
        "SALE DEED & TITLE CONVEYANCE",
        "REVENUE & REGISTRATION DEPARTMENT, U.P.",
        {
            "owner_name": "Apex Charitable Society", # Mismatched entity name!
            "survey_no": "SURVEY-84/2A",
            "land_area_acres": 3.80, # Deficit!
            "registration_date": "2015-06-14",
            "district": "Lucknow"
        },
        "LAND_DOCUMENT"
    )
    apex_tampered_docs.append({
        "id": f"DOC-{apex_tampered_id}-LAND",
        "application_id": apex_tampered_id,
        "doc_type": "LAND_DOCUMENT",
        "filename": "Apex_Land_Sale_Deed_3.8Acres.jpg",
        "file_path": l_tamp_path,
        "file_hash": get_file_sha256(l_tamp_path),
        "file_size": os.path.getsize(l_tamp_path),
        "upload_timestamp": "2026-05-12T14:12:00Z",
        "extracted_fields": {
            "owner_name": "Apex Charitable Society",
            "survey_no": "SURVEY-84/2A",
            "land_area_acres": 3.80
        },
        "bounding_boxes": {},
        "metadata": {}
    })

    # Tampered Doc 3: Altered Fire NOC Date (with simulated ELA high-contrast tampering)
    f_tamp_path = str(DOCUMENTS_DIR / f"{apex_tampered_id}_fire_noc.jpg")
    generate_document_image(
        f_tamp_path,
        "FIRE SAFETY NO OBJECTION CERTIFICATE",
        "DIRECTORATE OF FIRE & EMERGENCY SERVICES, U.P.",
        {
            "noc_number": "UP-FS/2025/NOC-4491",
            "institution_name": "Apex Institute of Engineering & Technology",
            "issue_date": "2024-03-01",
            "expiry_date": "2027-06-09", # Altered on paper, but government registry says expired!
            "issuing_officer": "Divisional Fire Officer, Lucknow"
        },
        "FIRE_NOC",
        is_tampered=True
    )
    # Precompute ELA
    ela_res = perform_error_level_analysis(f_tamp_path)
    apex_tampered_docs.append({
        "id": f"DOC-{apex_tampered_id}-FIRE",
        "application_id": apex_tampered_id,
        "doc_type": "FIRE_NOC",
        "filename": "Fire_Safety_NOC_Altered_Date.jpg",
        "file_path": f_tamp_path,
        "file_hash": get_file_sha256(f_tamp_path),
        "file_size": os.path.getsize(f_tamp_path),
        "upload_timestamp": "2026-05-12T14:15:00Z",
        "extracted_fields": {
            "noc_number": "UP-FS/2025/NOC-4491",
            "issue_date": "2024-03-01",
            "expiry_date": "2027-06-09"
        },
        "bounding_boxes": {},
        "tamper_signals": {
            "is_tampered": True,
            "anomaly_score": 88.5,
            "disparity_ratio": 5.4,
            "suspicious_box": {"x": 38.0, "y": 28.5, "width": 18.0, "height": 3.2},
            "ela_visual_path": ela_res.get("ela_visual_path")
        },
        "metadata": {
            "suspicious_software": ["Adobe Photoshop 2024 (Windows)", "Canva Design Platform"]
        }
    })

    # Tampered Doc 4: Campus Photo with Geotag 480km away in New Delhi
    photo_tamp_path = str(DOCUMENTS_DIR / f"{apex_tampered_id}_campus_photo.jpg")
    generate_campus_photo(photo_tamp_path, "Apex Campus (Remote)", 28.6139, 77.2090) # Delhi coords!
    apex_tampered_docs.append({
        "id": f"DOC-{apex_tampered_id}-PHOTO",
        "application_id": apex_tampered_id,
        "doc_type": "CAMPUS_PHOTO",
        "filename": "Campus_Photo_Spoofed_Location.jpg",
        "file_path": photo_tamp_path,
        "file_hash": get_file_sha256(photo_tamp_path),
        "file_size": os.path.getsize(photo_tamp_path),
        "upload_timestamp": "2026-05-12T14:20:00Z",
        "extracted_fields": {"gps_latitude": 28.6139, "gps_longitude": 77.2090},
        "bounding_boxes": {},
        "metadata": {"spoofed_gps": (28.6139, 77.2090)}
    })

    # Building plan & floor plan
    apex_tampered_docs.append(apex_clean_docs[2]) # building plan
    apex_tampered_docs.append(apex_clean_docs[4]) # affidavit
    apex_tampered_docs.append(apex_clean_docs[5]) # architect cert
    apex_tampered_docs.append(apex_clean_docs[7]) # floor plan

    apex_tampered_app = {
        "id": apex_tampered_id,
        "category": "NEW_INSTITUTION",
        "category_name": "Setting up New Technical Institution",
        "institution_name": "Apex Institute of Engineering & Technology (Tampered Twin)",
        "trust_name": "Apex Educational & Charitable Trust",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "address": "Plot 14-16, Knowledge Park IV, Mohanlalganj, Lucknow",
        "gps_coordinates": {"latitude": 26.8467, "longitude": 80.9462},
        "land_area_acres": 5.25, # Declares 5.25, but deed says 3.8!
        "declared_classrooms": 12,
        "declared_labs": 4,
        "status": "SUBMITTED",
        "created_at": "2026-05-12T14:00:00Z",
        "submitted_at": "2026-05-12T14:30:00Z",
        "pipeline_step": 6,
        "risk_score": 0,
        "risk_band": "HIGH",
        "risk_breakdown": [],
        "flags": [],
        "verification_results": [],
        "documents": apex_tampered_docs,
        "infrastructure_check": {},
        "is_tampered_demo": True,
        "audit_chain": []
    }
    applications.append(apex_tampered_app)
    ground_truth.append({
        "application_id": apex_tampered_id,
        "is_clean": False,
        "expected_risk_band": "HIGH",
        "injected_defects": [
            "DEFECT_DUPLICATE_FILE_HASH",
            "DEFECT_NAME_MISMATCH",
            "DEFECT_LAND_AREA_DEFICIT",
            "DEFECT_IMAGE_TAMPERING_ELA",
            "DEFECT_GEOTAG_MISMATCH"
        ]
    })

    # -------------------------------------------------------------
    # 3. Generate 28 more realistic applications across categories
    # -------------------------------------------------------------
    institution_names = [
        ("Sahyadri College of Engineering & Technology", "Sahyadri Pratishthan Educational Society", "Maharashtra", "Pune"),
        ("Vidyavardhaka Institute of Technology", "Vidyavardhaka Sangha Trust", "Karnataka", "Bengaluru Rural"),
        ("Karpagam Institute of Technology & Sciences", "Karpagam Academy Educational Trust", "Tamil Nadu", "Coimbatore"),
        ("Shree Somnath Institute of Engineering", "Somnath Education & Research Trust", "Gujarat", "Ahmedabad"),
        ("Malwa Institute of Science & Technology", "Malwa Shiksha Samiti", "Madhya Pradesh", "Bhopal"),
        ("Rajputana College of Engineering", "Maharana Pratap Educational Society", "Rajasthan", "Jaipur"),
        ("Kakatiya Institute of Technical Sciences", "Kakatiya Academy Foundation", "Telangana", "Hyderabad"),
        ("Mar Thoma College of Engineering & Tech", "Mar Thoma Educational Society", "Kerala", "Ernakulam"),
        ("Guru Nanak Dev Institute of Higher Tech", "Guru Nanak Dev Mission Trust", "Punjab", "Ludhiana"),
        ("Aryabhatta Institute of Technology", "Aryabhatta Shodh Sansthan", "Uttar Pradesh", "Varanasi"),
        ("Sinhgad Academy of Engineering", "Sinhgad Technical Education Society", "Maharashtra", "Nashik"),
        ("Basaveshwara College of Engineering", "Basaveshwara Vidyaniketan", "Karnataka", "Mysuru"),
        ("Kongu Engineering College & Research", "Kongu Vellalar Institute Trust", "Tamil Nadu", "Erode"),
        ("Sardar Patel Institute of Modern Tech", "Sardar Vallabhbhai Memorial Society", "Gujarat", "Surat"),
        ("Bhojpal Institute of Applied Sciences", "Bhojpal Technical Society", "Madhya Pradesh", "Indore"),
        ("Mewar Institute of Engineering & Tech", "Mewar Foundation Trust", "Rajasthan", "Udaipur"),
        ("Telangana Institute of Emerging Tech", "Telangana Pragathi Trust", "Telangana", "Warangal"),
        ("Travancore Institute of Technology", "Travancore Charitable Trust", "Kerala", "Thiruvananthapuram"),
        ("Baba Farid College of Engineering", "Baba Farid Educational Society", "Punjab", "Bathinda"),
        ("Avadh Institute of Technology", "Avadh Shaikshanik Trust", "Uttar Pradesh", "Ayodhya"),
        ("Vidarbha Institute of Science & Tech", "Vidarbha Vikas Samiti", "Maharashtra", "Nagpur"),
        ("Cauvery Engineering Institute", "Cauvery Educational Foundation", "Karnataka", "Mangaluru"),
        ("Annamalai Applied Tech Academy", "Annamalai Trust", "Tamil Nadu", "Madurai"),
        ("Narmada Valley Institute of Technology", "Narmada Shikshan Trust", "Madhya Pradesh", "Jabalpur"),
        ("Bikaner Technical College", "Bikaner Foundation", "Rajasthan", "Bikaner"),
        ("Deccan Institute of Advanced Studies", "Deccan Education Council", "Telangana", "Nizamabad"),
        ("Kochi Institute of Engineering", "Cochin Academic Trust", "Kerala", "Kollam"),
        ("Doaba Institute of Technology", "Doaba Welfare Society", "Punjab", "Jalandhar")
    ]

    for idx, (inst_name, trust_name, state_name, dist_name) in enumerate(institution_names):
        app_num = 101 + idx
        # Assign category
        if idx < 13:
            cat = "NEW_INSTITUTION"
            cat_name = "Setting up New Technical Institution"
        elif idx < 23:
            cat = "EXTENSION_OF_APPROVAL"
            cat_name = "Extension of Approval (EoA) for Existing Institution"
        else:
            cat = "CLOSURE_VARIATION"
            cat_name = "Closure / Variation in Intake / Program Shift"

        app_id = f"AICTE-2026-{state_name[:2].upper()}-{app_num}"

        # Determine if this sample should have an injected defect
        # ~8 clean, ~20 with defects for rich demo and evaluation metrics
        has_defect = (idx % 3 != 0)
        injected = []

        # Find location coords
        loc = next((l for l in locations if l["state"] == state_name), locations[0])
        lat, lon = loc["lat"] + random.uniform(-0.02, 0.02), loc["lon"] + random.uniform(-0.02, 0.02)
        land_acres = 5.0 if cat == "NEW_INSTITUTION" else 4.5

        # Create basic application docs
        app_docs = []

        # Generate Trust Deed
        t_path = str(DOCUMENTS_DIR / f"{app_id}_trust_deed.jpg")
        generate_document_image(
            t_path,
            "SOCIETY REGISTRATION CERTIFICATE",
            "REGISTRAR OF SOCIETIES & TRUSTS",
            {
                "trust_name": trust_name,
                "registration_no": f"SOC/{state_name[:2].upper()}/2018/{1000 + idx}",
                "registration_date": "2018-03-15",
                "valid_upto": "2038-03-14"
            },
            "TRUST_DEED"
        )
        app_docs.append({
            "id": f"DOC-{app_id}-TRUST",
            "application_id": app_id,
            "doc_type": "TRUST_DEED",
            "filename": f"{trust_name[:15]}_RegCertificate.jpg",
            "file_path": t_path,
            "file_hash": get_file_sha256(t_path),
            "file_size": os.path.getsize(t_path),
            "upload_timestamp": "2026-05-14T09:00:00Z",
            "extracted_fields": {
                "trust_name": trust_name,
                "registration_no": f"SOC/{state_name[:2].upper()}/2018/{1000 + idx}",
                "registration_date": "2018-03-15"
            },
            "bounding_boxes": {},
            "metadata": {}
        })

        # Inject defects systematically
        if has_defect:
            defect_type = (idx % 6)
            if defect_type == 0:
                # Expired Fire NOC
                injected.append("DEFECT_EXPIRED_FIRE_NOC")
                f_path = str(DOCUMENTS_DIR / f"{app_id}_fire_noc.jpg")
                generate_document_image(
                    f_path,
                    "FIRE SAFETY CLEARANCE CERTIFICATE",
                    "STATE FIRE AND EMERGENCY SERVICES",
                    {
                        "noc_number": f"{state_name[:2].upper()}-FS/2024/NOC-{2000 + idx}",
                        "institution_name": inst_name,
                        "issue_date": "2024-02-10",
                        "expiry_date": "2026-02-09", # Expired!
                        "issuing_officer": "District Fire Officer"
                    },
                    "FIRE_NOC"
                )
                app_docs.append({
                    "id": f"DOC-{app_id}-FIRE",
                    "application_id": app_id,
                    "doc_type": "FIRE_NOC",
                    "filename": "Fire_Safety_NOC_Expired.jpg",
                    "file_path": f_path,
                    "file_hash": get_file_sha256(f_path),
                    "file_size": os.path.getsize(f_path),
                    "upload_timestamp": "2026-05-14T09:10:00Z",
                    "extracted_fields": {
                        "noc_number": f"{state_name[:2].upper()}-FS/2024/NOC-{2000 + idx}",
                        "expiry_date": "2026-02-09"
                    },
                    "bounding_boxes": {},
                    "metadata": {}
                })
            elif defect_type == 1:
                # Missing Land Deed
                injected.append("DEFECT_MISSING_LAND_DEED")
            elif defect_type == 2:
                # Name Mismatch
                injected.append("DEFECT_NAME_MISMATCH")
                l_path = str(DOCUMENTS_DIR / f"{app_id}_land_deed.jpg")
                generate_document_image(
                    l_path,
                    "LAND SALE DEED",
                    "SUB-REGISTRAR OFFICE",
                    {
                        "owner_name": f"{trust_name} Vikas Sanstha", # Name mismatch!
                        "survey_no": f"SURVEY-{app_num}/1",
                        "land_area_acres": land_acres,
                        "district": dist_name
                    },
                    "LAND_DOCUMENT"
                )
                app_docs.append({
                    "id": f"DOC-{app_id}-LAND",
                    "application_id": app_id,
                    "doc_type": "LAND_DOCUMENT",
                    "filename": "Land_Sale_Deed_MismatchName.jpg",
                    "file_path": l_path,
                    "file_hash": get_file_sha256(l_path),
                    "file_size": os.path.getsize(l_path),
                    "upload_timestamp": "2026-05-14T09:12:00Z",
                    "extracted_fields": {
                        "owner_name": f"{trust_name} Vikas Sanstha",
                        "survey_no": f"SURVEY-{app_num}/1",
                        "land_area_acres": land_acres
                    },
                    "bounding_boxes": {},
                    "metadata": {}
                })
            elif defect_type == 3:
                # Land area deficit
                injected.append("DEFECT_LAND_AREA_DEFICIT")
                l_path = str(DOCUMENTS_DIR / f"{app_id}_land_deed.jpg")
                generate_document_image(
                    l_path,
                    "LAND TITLE RECORD",
                    "REVENUE DEPARTMENT",
                    {
                        "owner_name": trust_name,
                        "survey_no": f"SURVEY-{app_num}/B",
                        "land_area_acres": 2.9, # Deficit!
                        "district": dist_name
                    },
                    "LAND_DOCUMENT"
                )
                app_docs.append({
                    "id": f"DOC-{app_id}-LAND",
                    "application_id": app_id,
                    "doc_type": "LAND_DOCUMENT",
                    "filename": "Land_Title_2.9Acres.jpg",
                    "file_path": l_path,
                    "file_hash": get_file_sha256(l_path),
                    "file_size": os.path.getsize(l_path),
                    "upload_timestamp": "2026-05-14T09:15:00Z",
                    "extracted_fields": {
                        "owner_name": trust_name,
                        "survey_no": f"SURVEY-{app_num}/B",
                        "land_area_acres": 2.9
                    },
                    "bounding_boxes": {},
                    "metadata": {}
                })
            elif defect_type == 4:
                # Reused Duplicate Certificate SHA-256
                injected.append("DEFECT_DUPLICATE_FILE_HASH")
                app_docs.append({
                    "id": f"DOC-{app_id}-REUSED",
                    "application_id": app_id,
                    "doc_type": "TRUST_DEED",
                    "filename": "Shared_Society_Certificate_Copy.jpg",
                    "file_path": shared_cert_path,
                    "file_hash": shared_cert_hash,
                    "file_size": os.path.getsize(shared_cert_path),
                    "upload_timestamp": "2026-05-14T09:18:00Z",
                    "extracted_fields": {
                        "trust_name": "Sahyadri Pratishthan Educational Society",
                        "registration_no": "SOC/MH/2012/4412"
                    },
                    "bounding_boxes": {},
                    "metadata": {}
                })
            else:
                # Spoofed photo geotag
                injected.append("DEFECT_GEOTAG_MISMATCH")
                p_path = str(DOCUMENTS_DIR / f"{app_id}_campus_photo.jpg")
                generate_campus_photo(p_path, inst_name, lat + 4.5, lon + 3.2) # ~400km away
                app_docs.append({
                    "id": f"DOC-{app_id}-PHOTO",
                    "application_id": app_id,
                    "doc_type": "CAMPUS_PHOTO",
                    "filename": "Campus_Photo_Spoofed.jpg",
                    "file_path": p_path,
                    "file_hash": get_file_sha256(p_path),
                    "file_size": os.path.getsize(p_path),
                    "upload_timestamp": "2026-05-14T09:22:00Z",
                    "extracted_fields": {"gps_latitude": lat + 4.5, "gps_longitude": lon + 3.2},
                    "bounding_boxes": {},
                    "metadata": {"spoofed_gps": (lat + 4.5, lon + 3.2)}
                })
        else:
            # Clean application: provide complete valid mandatory document suite
            l_path = str(DOCUMENTS_DIR / f"{app_id}_land_deed.jpg")
            generate_document_image(
                l_path,
                "REGISTERED TITLE DEED",
                "REVENUE & REGISTRATION DEPT",
                {
                    "owner_name": trust_name,
                    "survey_no": f"SURVEY-{app_num}/1",
                    "land_area_acres": land_acres,
                    "district": dist_name
                },
                "LAND_DOCUMENT"
            )
            app_docs.append({
                "id": f"DOC-{app_id}-LAND",
                "application_id": app_id,
                "doc_type": "LAND_DOCUMENT",
                "filename": f"Land_Deed_{land_acres}Acres.jpg",
                "file_path": l_path,
                "file_hash": get_file_sha256(l_path),
                "file_size": os.path.getsize(l_path),
                "upload_timestamp": "2026-05-14T09:12:00Z",
                "extracted_fields": {
                    "owner_name": trust_name,
                    "survey_no": f"SURVEY-{app_num}/1",
                    "land_area_acres": land_acres
                },
                "bounding_boxes": {},
                "metadata": {}
            })

            f_path = str(DOCUMENTS_DIR / f"{app_id}_fire_noc.jpg")
            generate_document_image(
                f_path,
                "FIRE SAFETY CLEARANCE CERTIFICATE",
                "STATE FIRE SERVICES DIRECTORATE",
                {
                    "noc_number": f"{state_name[:2].upper()}-FS/2025/NOC-{3000 + idx}",
                    "institution_name": inst_name,
                    "issue_date": "2025-05-10",
                    "expiry_date": "2027-05-09",
                    "issuing_officer": "Divisional Fire Officer"
                },
                "FIRE_NOC"
            )
            app_docs.append({
                "id": f"DOC-{app_id}-FIRE",
                "application_id": app_id,
                "doc_type": "FIRE_NOC",
                "filename": "Fire_Safety_NOC_Valid.jpg",
                "file_path": f_path,
                "file_hash": get_file_sha256(f_path),
                "file_size": os.path.getsize(f_path),
                "upload_timestamp": "2026-05-14T09:15:00Z",
                "extracted_fields": {
                    "noc_number": f"{state_name[:2].upper()}-FS/2025/NOC-{3000 + idx}",
                    "expiry_date": "2027-05-09"
                },
                "bounding_boxes": {},
                "metadata": {}
            })

            # Add Affidavit & Architect Certificate for New Institution
            if cat == "NEW_INSTITUTION":
                app_docs.append({
                    "id": f"DOC-{app_id}-AFFIDAVIT",
                    "application_id": app_id,
                    "doc_type": "AFFIDAVIT_1",
                    "filename": "AICTE_Affidavit_Format1.jpg",
                    "file_path": aff_clean_path,
                    "file_hash": get_file_sha256(aff_clean_path),
                    "file_size": os.path.getsize(aff_clean_path),
                    "upload_timestamp": "2026-05-14T09:16:00Z",
                    "extracted_fields": {"notary_reg_no": f"NOTARY/{state_name[:2].upper()}/{5000+idx}"},
                    "bounding_boxes": {},
                    "metadata": {}
                })
                app_docs.append({
                    "id": f"DOC-{app_id}-ARCH",
                    "application_id": app_id,
                    "doc_type": "ARCHITECT_CERT",
                    "filename": "Architect_Completion_Cert.jpg",
                    "file_path": arc_clean_path,
                    "file_hash": get_file_sha256(arc_clean_path),
                    "file_size": os.path.getsize(arc_clean_path),
                    "upload_timestamp": "2026-05-14T09:17:00Z",
                    "extracted_fields": {"coa_registration_no": f"CA/2012/{30000+idx}", "architect_name": "Ar. R. K. Singhal"},
                    "bounding_boxes": {},
                    "metadata": {}
                })
                app_docs.append({
                    "id": f"DOC-{app_id}-FPLAN",
                    "application_id": app_id,
                    "doc_type": "FLOOR_PLAN",
                    "filename": "Ground_Floor_Plan.jpg",
                    "file_path": fp_clean_path,
                    "file_hash": get_file_sha256(fp_clean_path),
                    "file_size": os.path.getsize(fp_clean_path),
                    "upload_timestamp": "2026-05-14T09:18:00Z",
                    "extracted_fields": {"classroom_count": 12, "lab_count": 4},
                    "bounding_boxes": {},
                    "metadata": {}
                })


        # Add building plan & photo
        bp_path = str(DOCUMENTS_DIR / f"{app_id}_building_plan.jpg")
        generate_blueprint_image(bp_path, f"{inst_name[:20]} Campus", 12, 4)
        app_docs.append({
            "id": f"DOC-{app_id}-BPLAN",
            "application_id": app_id,
            "doc_type": "BUILDING_PLAN",
            "filename": "Approved_Building_Sanction_Plan.jpg",
            "file_path": bp_path,
            "file_hash": get_file_sha256(bp_path),
            "file_size": os.path.getsize(bp_path),
            "upload_timestamp": "2026-05-14T09:20:00Z",
            "extracted_fields": {"approval_no": f"SANCT/{app_num}/2023", "approval_date": "2023-04-10"},
            "bounding_boxes": {},
            "metadata": {}
        })

        # Campus photo if not already added
        if not any(d["doc_type"] == "CAMPUS_PHOTO" for d in app_docs):
            p_path = str(DOCUMENTS_DIR / f"{app_id}_campus_photo.jpg")
            generate_campus_photo(p_path, inst_name, lat, lon)
            app_docs.append({
                "id": f"DOC-{app_id}-PHOTO",
                "application_id": app_id,
                "doc_type": "CAMPUS_PHOTO",
                "filename": "Campus_Front_Photo.jpg",
                "file_path": p_path,
                "file_hash": get_file_sha256(p_path),
                "file_size": os.path.getsize(p_path),
                "upload_timestamp": "2026-05-14T09:25:00Z",
                "extracted_fields": {"gps_latitude": lat, "gps_longitude": lon},
                "bounding_boxes": {},
                "metadata": {"spoofed_gps": (lat, lon)}
            })

        app_item = {
            "id": app_id,
            "category": cat,
            "category_name": cat_name,
            "institution_name": inst_name,
            "trust_name": trust_name,
            "state": state_name,
            "district": dist_name,
            "address": f"Campus Road, Sector {app_num % 10 + 1}, {dist_name}, {state_name}",
            "gps_coordinates": {"latitude": round(lat, 6), "longitude": round(lon, 6)},
            "land_area_acres": land_acres,
            "declared_classrooms": 12,
            "declared_labs": 4,
            "status": "SUBMITTED",
            "created_at": "2026-05-14T08:00:00Z",
            "submitted_at": "2026-05-14T12:00:00Z",
            "pipeline_step": 6,
            "risk_score": 0,
            "risk_band": "LOW" if not has_defect else "HIGH",
            "risk_breakdown": [],
            "flags": [],
            "verification_results": [],
            "documents": app_docs,
            "infrastructure_check": {},
            "is_tampered_demo": False,
            "audit_chain": []
        }
        applications.append(app_item)
        ground_truth.append({
            "application_id": app_id,
            "is_clean": not has_defect,
            "expected_risk_band": "LOW" if not has_defect else "HIGH",
            "injected_defects": injected
        })

    # Save to disk
    db_file = DATA_DIR / "applications_db.json"
    gt_file = DATA_DIR / "ground_truth.json"

    with open(db_file, "w", encoding="utf-8") as f:
        json.dump(applications, f, indent=2)

    with open(gt_file, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)

    print(f"Successfully generated {len(applications)} applications and {len(ground_truth)} ground truth records.")
    return applications, ground_truth

if __name__ == "__main__":
    generate_synthetic_dataset()
