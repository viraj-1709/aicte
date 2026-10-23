from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class BoundingBox(BaseModel):
    page: int = 1
    x: float = 0.0      # percentage 0-100
    y: float = 0.0      # percentage 0-100
    width: float = 0.0  # percentage 0-100
    height: float = 0.0 # percentage 0-100
    text: Optional[str] = None
    field_name: Optional[str] = None

class DocumentItem(BaseModel):
    id: str
    application_id: str
    doc_type: str
    filename: str
    file_path: str
    file_hash: str
    file_size: int
    upload_timestamp: str
    extracted_fields: Dict[str, Any] = Field(default_factory=dict)
    bounding_boxes: Dict[str, BoundingBox] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tamper_signals: Dict[str, Any] = Field(default_factory=dict)
    qr_data: Optional[str] = None
    digital_signature: Optional[Dict[str, Any]] = None

class FlagItem(BaseModel):
    id: str
    rule_id: str
    category: str  # VALIDATION, ANOMALY, INFRASTRUCTURE, VERIFICATION
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    title: str     # What we found
    evidence: Dict[str, Any] = Field(default_factory=dict) # doc_id, doc_type, page, bbox, snippet
    reason: str    # Why it matters / Regulatory reference
    confidence: float = 0.95
    risk_points: int = 10
    officer_feedback: Optional[str] = None # CORRECT, FALSE_ALARM
    officer_remarks: Optional[str] = None

class VerificationItem(BaseModel):
    authority_name: str
    service_type: str
    identifier_checked: str
    status: str # VERIFIED, MISMATCH, SOURCE_UNAVAILABLE, MANUAL_REVIEW_REQUIRED
    latency_ms: int = 250
    details: Dict[str, Any] = Field(default_factory=dict)
    qr_verified: bool = False
    digital_signature_valid: bool = False

class AuditBlock(BaseModel):
    index: int
    timestamp: str
    application_id: str
    actor: str
    action: str
    details: Dict[str, Any] = Field(default_factory=dict)
    data_hash: str
    prev_hash: str
    hash: str

class ApplicationDetail(BaseModel):
    id: str
    category: str
    category_name: str
    institution_name: str
    trust_name: str
    state: str
    district: str
    address: str
    gps_coordinates: Dict[str, float]
    land_area_acres: float
    declared_classrooms: int = 12
    declared_labs: int = 4
    status: str = "SUBMITTED" # DRAFT, SUBMITTED, IN_SCRUTINY, ACCEPTED, REJECTED, CLARIFICATION_REQUESTED
    created_at: str
    submitted_at: Optional[str] = None
    pipeline_step: int = 6
    risk_score: int = 0
    risk_band: str = "LOW"
    risk_breakdown: List[Dict[str, Any]] = Field(default_factory=list)
    flags: List[FlagItem] = Field(default_factory=list)
    verification_results: List[VerificationItem] = Field(default_factory=list)
    documents: List[DocumentItem] = Field(default_factory=list)
    infrastructure_check: Dict[str, Any] = Field(default_factory=dict)
    is_tampered_demo: bool = False
    officer_decision: Optional[Dict[str, Any]] = None
    audit_chain: List[AuditBlock] = Field(default_factory=list)

class OfficerDecisionRequest(BaseModel):
    decision: str # ACCEPTED, REJECTED, CLARIFICATION_REQUESTED
    remarks: str
    officer_name: str = "Dr. S. K. Sharma (Regional Scrutiny Officer)"

class FeedbackRequest(BaseModel):
    flag_id: str
    feedback: str # CORRECT, FALSE_ALARM
    officer_remarks: Optional[str] = None
