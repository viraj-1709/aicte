export type UserRole = 'OFFICER' | 'APPLICANT' | 'ADMIN';
export type Lang = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'gu' | 'bn' | 'ur';
export type Theme = 'light' | 'dark';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  institution_name?: string;
  token?: string;
}

export interface BoundingBox {
  page: number;
  x: number;      // 0-100 percentage
  y: number;      // 0-100 percentage
  width: number;  // 0-100 percentage
  height: number; // 0-100 percentage
  text?: string;
  field_name?: string;
}

export interface DocumentItem {
  id: string;
  application_id: string;
  doc_type: string;
  filename: string;
  file_path: string;
  file_hash: string;
  file_size: number;
  upload_timestamp: string;
  extracted_fields: Record<string, any>;
  bounding_boxes: Record<string, BoundingBox>;
  metadata: Record<string, any>;
  tamper_signals?: {
    is_tampered?: boolean;
    anomaly_score?: number;
    disparity_ratio?: number;
    suspicious_box?: BoundingBox;
    ela_visual_path?: string;
  };
  perceptual_hash?: {
    phash: string;
    duplicate_match_id?: string;
    similarity_percent?: number;
  };
  quality_check?: {
    is_blurry: boolean;
    resolution_dpi: number;
    rotation_degrees: number;
    cropped_warning: boolean;
  };
  qr_data?: string;
  digital_signature?: {
    valid: boolean;
    signer?: string;
    timestamp?: string;
  };
}

export interface FlagItem {
  id: string;
  rule_id: string;
  category: 'VALIDATION' | 'ANOMALY' | 'INFRASTRUCTURE' | 'VERIFICATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  evidence: {
    source_doc_id?: string;
    source_doc_type?: string;
    page?: number;
    bounding_box?: BoundingBox;
    snippet?: string;
  };
  reason: string;
  confidence: number;
  confidence_level?: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_points: number;
  officer_feedback?: 'CORRECT' | 'FALSE_ALARM' | null;
  officer_remarks?: string | null;
}

export interface VerificationItem {
  authority_name: string;
  service_type: string;
  identifier_checked: string;
  status: 'VERIFIED' | 'MISMATCH' | 'SOURCE_UNAVAILABLE' | 'MANUAL_REVIEW_REQUIRED';
  latency_ms: number;
  details: Record<string, any>;
  qr_verified: boolean;
  digital_signature_valid: boolean;
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  application_id: string;
  actor: string;
  action: string;
  details: Record<string, any>;
  data_hash: string;
  prev_hash: string;
  hash: string;
  is_tampered_simulated?: boolean;
}

export interface RiskBreakdownItem {
  flag_id: string;
  title: string;
  category: string;
  severity: string;
  points: number;
  base_points: number;
  is_discounted: boolean;
  feedback?: string | null;
  is_simulated_excluded?: boolean;
}

export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'IN_SCRUTINY' | 'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';

export interface ApplicationSummary {
  id: string;
  reference_no: string;
  category: string;
  category_name: string;
  institution_name: string;
  trust_name: string;
  state: string;
  district: string;
  risk_score: number;
  risk_band: 'LOW' | 'MEDIUM' | 'HIGH';
  flags_count: number;
  status: ApplicationStatus;
  submission_date: string;
  sla_days_remaining: number;
  sla_urgency: 'NORMAL' | 'URGENT' | 'BREACHED';
}

export interface ApplicationDetail {
  id: string;
  reference_no: string;
  category: string;
  category_name: string;
  institution_name: string;
  trust_name: string;
  state: string;
  district: string;
  address: string;
  gps_coordinates: { latitude: number; longitude: number };
  land_area_acres: number;
  declared_classrooms: number;
  declared_labs: number;
  status: ApplicationStatus;
  created_at: string;
  submitted_at?: string;
  pipeline_step: number;
  risk_score: number;
  risk_band: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_breakdown: RiskBreakdownItem[];
  flags: FlagItem[];
  verification_results: VerificationItem[];
  documents: DocumentItem[];
  infrastructure_check?: {
    geotag_analysis?: any;
    floorplan_analysis?: any;
    detected_rooms?: any[];
  };
  is_tampered_demo: boolean;
  officer_decision?: {
    decision: string;
    remarks: string;
    officer_name: string;
    timestamp: string;
    reason_for_access?: string;
  };
  audit_chain: AuditBlock[];
  clarification_thread?: {
    request_message: string;
    requested_at: string;
    deadline_date: string;
    applicant_response?: string;
    reuploaded_doc_type?: string;
    status: 'PENDING_APPLICANT' | 'RE_EVALUATED';
  };
}

export interface AdminKPIs {
  total_applications: number;
  applications_processed: number;
  applications_pending: number;
  avg_verification_time_minutes: number;
  manual_baseline_minutes: number;
  time_saved_percent: number;
  total_flags_detected: number;
  flags_by_type: Record<string, number>;
  officer_feedback_stats: {
    total_reviews: number;
    confirmed_issues: number;
    false_alarms: number;
    false_positive_rate_percent: number;
  };
  risk_distribution: {
    low_risk: number;
    medium_risk: number;
    high_risk: number;
  };
}

export interface RuleConfigItem {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  risk_points: number;
  enabled: boolean;
  parameters: Record<string, any>;
  last_threshold_adjustment?: {
    previous_points: number;
    adjusted_at: string;
    reason: string;
  };
}

export interface AlertItem {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  timestamp: string;
  details: string;
  application_id: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'APPLICATION' | 'PHONE' | 'TRUST' | 'DOCUMENT_HASH' | 'ADDRESS';
  risk?: 'LOW' | 'HIGH' | 'CRITICAL';
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}
