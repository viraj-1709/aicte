import time
import hashlib
import random
from typing import Dict, Any, Optional

class MockIssuerService:
    """
    Simulates external Government Issuing Authority APIs:
    - Registrar of Societies (MCA / State Societies)
    - State Land Records (Bhulekh / Land Revenue Portal)
    - Directorate of Fire & Emergency Services NOC Portal
    - Council of Architecture (CoA) Verification
    - Digital Signature (PKI/X.509) & QR Code Cryptographic Verification
    """

    def __init__(self):
        # Known registered ground-truth records in Government databases
        self.registry_societies = {
            "SOC/UP/2014/8839": {
                "society_name": "Apex Educational & Charitable Trust",
                "registration_date": "2014-04-12",
                "valid_upto": "2034-04-11",
                "president": "Dr. Ramesh Chandra Verma",
                "status": "ACTIVE",
                "state": "Uttar Pradesh"
            },
            "SOC/MH/2012/4412": {
                "society_name": "Sahyadri Pratishthan Educational Society",
                "registration_date": "2012-08-19",
                "valid_upto": "2032-08-18",
                "president": "Shri Vilasrao Deshmukh",
                "status": "ACTIVE",
                "state": "Maharashtra"
            },
            "SOC/KA/2018/1092": {
                "society_name": "Vidyavardhaka Sangha Trust",
                "registration_date": "2018-02-05",
                "valid_upto": "2038-02-04",
                "president": "Prof. S. R. Hegde",
                "status": "ACTIVE",
                "state": "Karnataka"
            },
            "SOC/TN/2015/7721": {
                "society_name": "Karpagam Academy Educational Trust",
                "registration_date": "2015-11-20",
                "valid_upto": "2035-11-19",
                "president": "Thiru K. Ramasamy",
                "status": "ACTIVE",
                "state": "Tamil Nadu"
            }
        }

        self.registry_land = {
            "SURVEY-84/2A": {
                "owner_name": "Apex Educational & Charitable Trust",
                "state": "Uttar Pradesh",
                "district": "Lucknow",
                "khasra_no": "84/2A",
                "area_acres": 5.25,
                "encumbrance_status": "CLEAR / UNENCUMBERED",
                "mutation_status": "VERIFIED & REGISTERED",
                "mutation_date": "2015-06-14"
            },
            "SURVEY-112/4": {
                "owner_name": "Sahyadri Pratishthan Educational Society",
                "state": "Maharashtra",
                "district": "Pune",
                "khasra_no": "112/4",
                "area_acres": 4.50,
                "encumbrance_status": "CLEAR / UNENCUMBERED",
                "mutation_status": "VERIFIED & REGISTERED",
                "mutation_date": "2013-03-22"
            },
            "SURVEY-99/1B": {
                "owner_name": "Vidyavardhaka Sangha Trust",
                "state": "Karnataka",
                "district": "Bengaluru Rural",
                "khasra_no": "99/1B",
                "area_acres": 7.80,
                "encumbrance_status": "CLEAR / UNENCUMBERED",
                "mutation_status": "VERIFIED & REGISTERED",
                "mutation_date": "2019-01-10"
            }
        }

        self.registry_fire_noc = {
            "UP-FS/2025/NOC-4491": {
                "institution_name": "Apex Institute of Engineering & Technology",
                "issue_date": "2025-06-10",
                "expiry_date": "2027-06-09",
                "status": "ACTIVE_VALID",
                "issuing_office": "Divisional Fire Headquarters, Lucknow",
                "max_floors_approved": "G+3"
            },
            "MH-FS/2025/NOC-3108": {
                "institution_name": "Sahyadri College of Engineering & Technology",
                "issue_date": "2025-07-15",
                "expiry_date": "2027-07-14",
                "status": "ACTIVE_VALID",
                "issuing_office": "Pune Metropolitan Region Fire Authority",
                "max_floors_approved": "G+4"
            },
            "KA-FS/2024/NOC-1992": {
                "institution_name": "Vidyavardhaka Institute of Technology",
                "issue_date": "2024-03-01",
                "expiry_date": "2026-02-28", # Expiring / Expired for 2026-27 session!
                "status": "EXPIRED",
                "issuing_office": "Karnataka State Fire Services, Bengaluru",
                "max_floors_approved": "G+2"
            }
        }

        # Simulated outage switch for demo testing
        self.simulate_outage_service: Optional[str] = None

    def set_simulated_outage(self, service_name: Optional[str]):
        """Allows testing SOURCE_UNAVAILABLE handling in live demos"""
        self.simulate_outage_service = service_name

    def verify_society(self, registration_no: str, claimed_name: str) -> Dict[str, Any]:
        """Verify Society / Trust Registration with Registrar of Societies"""
        latency = random.randint(180, 320)

        if self.simulate_outage_service == "REGISTRAR":
            return {
                "authority_name": "Registrar of Societies (State Portal)",
                "service_type": "REGISTRAR",
                "identifier_checked": registration_no,
                "status": "SOURCE_UNAVAILABLE",
                "latency_ms": 1200,
                "details": {
                    "error": "HTTP 503 Service Unavailable: State Registrar e-Portal timeout",
                    "advisory": "Advisory flag generated. Scrutiny officer may accept conditional upload or re-query."
                },
                "qr_verified": False,
                "digital_signature_valid": False
            }

        rec = self.registry_societies.get(registration_no.strip())
        if not rec:
            # Check if it looks like a manual review legacy case
            if "LEGACY" in registration_no or "199" in registration_no:
                return {
                    "authority_name": "Registrar of Societies (State Portal)",
                    "service_type": "REGISTRAR",
                    "identifier_checked": registration_no,
                    "status": "MANUAL_REVIEW_REQUIRED",
                    "latency_ms": latency,
                    "details": {
                        "message": "Archived pre-digitization physical record. Requires district sub-registrar gazette physical verification."
                    },
                    "qr_verified": False,
                    "digital_signature_valid": False
                }
            return {
                "authority_name": "Registrar of Societies (State Portal)",
                "service_type": "REGISTRAR",
                "identifier_checked": registration_no,
                "status": "MISMATCH",
                "latency_ms": latency,
                "details": {
                    "reason": f"Registration number '{registration_no}' not found in state active society directory."
                },
                "qr_verified": False,
                "digital_signature_valid": False
            }

        # Check name consistency
        reg_name_clean = rec["society_name"].lower().replace("&", "and").strip()
        claimed_clean = claimed_name.lower().replace("&", "and").strip()

        # If names differ significantly
        if claimed_clean not in reg_name_clean and reg_name_clean not in claimed_clean:
            return {
                "authority_name": "Registrar of Societies (State Portal)",
                "service_type": "REGISTRAR",
                "identifier_checked": registration_no,
                "status": "MISMATCH",
                "latency_ms": latency,
                "details": {
                    "registered_name": rec["society_name"],
                    "claimed_name": claimed_name,
                    "discrepancy": "Entity name on submitted deed diverges from government registry",
                    "valid_upto": rec["valid_upto"]
                },
                "qr_verified": False,
                "digital_signature_valid": False
            }

        return {
            "authority_name": "Registrar of Societies (State Portal)",
            "service_type": "REGISTRAR",
            "identifier_checked": registration_no,
            "status": "VERIFIED",
            "latency_ms": latency,
            "details": {
                "registered_name": rec["society_name"],
                "president": rec["president"],
                "registration_date": rec["registration_date"],
                "valid_upto": rec["valid_upto"],
                "registry_status": "ACTIVE_GOOD_STANDING"
            },
            "qr_verified": True,
            "digital_signature_valid": True
        }

    def verify_land_record(self, survey_no: str, district: str, state: str, claimed_area_acres: float) -> Dict[str, Any]:
        """Verify Land Title with State Land Revenue / Bhulekh Department"""
        latency = random.randint(220, 420)

        if self.simulate_outage_service == "LAND_REVENUE":
            return {
                "authority_name": "State Revenue Dept / Digital Bhulekh Land Records",
                "service_type": "LAND_REVENUE",
                "identifier_checked": survey_no,
                "status": "SOURCE_UNAVAILABLE",
                "latency_ms": 1500,
                "details": {"error": "Gateway Timeout (504): State Revenue Server Maintenance"},
                "qr_verified": False,
                "digital_signature_valid": False
            }

        rec = self.registry_land.get(survey_no.strip())
        if not rec:
            return {
                "authority_name": "State Revenue Dept / Digital Bhulekh Land Records",
                "service_type": "LAND_REVENUE",
                "identifier_checked": survey_no,
                "status": "MANUAL_REVIEW_REQUIRED",
                "latency_ms": latency,
                "details": {
                    "message": f"Survey No. '{survey_no}' requires manual revenue patwari verification; not yet indexed in state digital portal."
                },
                "qr_verified": False,
                "digital_signature_valid": False
            }

        # Check land area
        diff = abs(rec["area_acres"] - claimed_area_acres)
        if diff > 0.15: # Significant area difference
            return {
                "authority_name": "State Revenue Dept / Digital Bhulekh Land Records",
                "service_type": "LAND_REVENUE",
                "identifier_checked": survey_no,
                "status": "MISMATCH",
                "latency_ms": latency,
                "details": {
                    "registered_area_acres": rec["area_acres"],
                    "claimed_area_acres": claimed_area_acres,
                    "discrepancy": f"Revenue record has {rec['area_acres']} acres, but application claims {claimed_area_acres} acres",
                    "encumbrance": rec["encumbrance_status"]
                },
                "qr_verified": False,
                "digital_signature_valid": False
            }

        return {
            "authority_name": "State Revenue Dept / Digital Bhulekh Land Records",
            "service_type": "LAND_REVENUE",
            "identifier_checked": survey_no,
            "status": "VERIFIED",
            "latency_ms": latency,
            "details": {
                "owner_name": rec["owner_name"],
                "registered_area_acres": rec["area_acres"],
                "khasra_no": rec["khasra_no"],
                "encumbrance_status": rec["encumbrance_status"],
                "mutation_status": rec["mutation_status"]
            },
            "qr_verified": True,
            "digital_signature_valid": True
        }

    def verify_fire_noc(self, noc_number: str, institution_name: str, claimed_expiry_date: str) -> Dict[str, Any]:
        """Verify Fire Safety Clearance with State Directorate of Fire Services"""
        latency = random.randint(190, 360)

        if self.simulate_outage_service == "FIRE_NOC":
            return {
                "authority_name": "Directorate of Fire & Emergency Services",
                "service_type": "FIRE_SERVICE",
                "identifier_checked": noc_number,
                "status": "SOURCE_UNAVAILABLE",
                "latency_ms": 1100,
                "details": {"error": "Connection reset by Fire Dept central gateway"},
                "qr_verified": False,
                "digital_signature_valid": False
            }

        rec = self.registry_fire_noc.get(noc_number.strip())
        if not rec:
            return {
                "authority_name": "Directorate of Fire & Emergency Services",
                "service_type": "FIRE_SERVICE",
                "identifier_checked": noc_number,
                "status": "MISMATCH",
                "latency_ms": latency,
                "details": {
                    "reason": f"Fire NOC Certificate ID '{noc_number}' was not found in state fire registry records."
                },
                "qr_verified": False,
                "digital_signature_valid": False
            }

        # Check if date was tampered (certificate says different expiry than dispatch register)
        if claimed_expiry_date and claimed_expiry_date.strip() != rec["expiry_date"]:
            return {
                "authority_name": "Directorate of Fire & Emergency Services",
                "service_type": "FIRE_SERVICE",
                "identifier_checked": noc_number,
                "status": "MISMATCH",
                "latency_ms": latency,
                "details": {
                    "registered_expiry_date": rec["expiry_date"],
                    "claimed_expiry_date": claimed_expiry_date,
                    "discrepancy": f"CRITICAL: Central registry marks expiry as {rec['expiry_date']}, but document claims {claimed_expiry_date}. Potential document date alteration!"
                },
                "qr_verified": False,
                "digital_signature_valid": False
            }

        if rec["status"] == "EXPIRED":
            return {
                "authority_name": "Directorate of Fire & Emergency Services",
                "service_type": "FIRE_SERVICE",
                "identifier_checked": noc_number,
                "status": "MISMATCH",
                "latency_ms": latency,
                "details": {
                    "reason": f"Fire NOC expired on {rec['expiry_date']}. Renewal certificate must be obtained for academic year 2026-27.",
                    "registered_expiry_date": rec["expiry_date"]
                },
                "qr_verified": True,
                "digital_signature_valid": True
            }

        return {
            "authority_name": "Directorate of Fire & Emergency Services",
            "service_type": "FIRE_SERVICE",
            "identifier_checked": noc_number,
            "status": "VERIFIED",
            "latency_ms": latency,
            "details": {
                "issuing_office": rec["issuing_office"],
                "approved_floors": rec["max_floors_approved"],
                "valid_until": rec["expiry_date"],
                "compliance_status": "FULL_CLEARANCE"
            },
            "qr_verified": True,
            "digital_signature_valid": True
        }

    def verify_architect_license(self, coa_reg_no: str, architect_name: str) -> Dict[str, Any]:
        """Verify Council of Architecture (CoA) Registration"""
        latency = random.randint(150, 280)
        valid = coa_reg_no.startswith("CA/") and len(coa_reg_no) > 8
        if valid:
            return {
                "authority_name": "Council of Architecture (Statutory Authority)",
                "service_type": "COA",
                "identifier_checked": coa_reg_no,
                "status": "VERIFIED",
                "latency_ms": latency,
                "details": {
                    "architect_name": architect_name,
                    "license_status": "ACTIVE_REGISTERED",
                    "valid_until": "2030-12-31"
                },
                "qr_verified": True,
                "digital_signature_valid": True
            }
        else:
            return {
                "authority_name": "Council of Architecture (Statutory Authority)",
                "service_type": "COA",
                "identifier_checked": coa_reg_no,
                "status": "MANUAL_REVIEW_REQUIRED",
                "latency_ms": latency,
                "details": {
                    "reason": "CoA registration format unrecognized; check state council physical roster."
                },
                "qr_verified": False,
                "digital_signature_valid": False
            }

# Singleton instance
mock_issuer_service = MockIssuerService()
