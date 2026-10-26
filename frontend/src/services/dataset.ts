import { 
  ApplicationDetail, 
  ApplicationSummary, 
  AdminKPIs, 
  RuleConfigItem, 
  AlertItem, 
  GraphNode, 
  GraphLink,
  AuditBlock
} from '../types';

// Deterministic SHA-256 simulation for rapid offline client-side execution
export function sha256(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex.repeat(8);
}

// -------------------------------------------------------------
// 1. SHOWCASE APPLICATION WITH 6-7 INJECTED DEFECTS
// -------------------------------------------------------------
export const SHOWCASE_TAMPERED: ApplicationDetail = {
  id: 'AICTE-2026-APEX-TAMPERED',
  reference_no: 'AICTE/2026/NI/000123',
  category: 'NEW_INSTITUTION',
  category_name: 'New Technical Campus (Degree Engineering)',
  institution_name: 'Apex Institute of Technology & Research',
  trust_name: 'Apex Educational & Charitable Trust',
  state: 'Uttar Pradesh',
  district: 'Lucknow',
  address: 'Plot 42-B, Knowledge Park, Sarojini Nagar, Lucknow, Uttar Pradesh 226008',
  gps_coordinates: { latitude: 26.8467, longitude: 80.9462 },
  land_area_acres: 3.80,
  declared_classrooms: 24,
  declared_labs: 12,
  status: 'IN_SCRUTINY',
  created_at: '2026-05-12T10:30:00Z',
  submitted_at: '2026-05-12T14:30:00Z',
  pipeline_step: 4,
  risk_score: 78,
  risk_band: 'HIGH',
  is_tampered_demo: true,
  risk_breakdown: [
    {
      flag_id: 'FLAG-LAND-AREA',
      title: 'Land Area Deficit (3.80 vs 5.00 Acres Mandatory)',
      category: 'VALIDATION',
      severity: 'CRITICAL',
      points: 25,
      base_points: 25,
      is_discounted: false
    },
    {
      flag_id: 'FLAG-ELA-SOCIETY',
      title: 'Digital Tampering on Society Registration Deed Expiry',
      category: 'ANOMALY',
      severity: 'CRITICAL',
      points: 25,
      base_points: 25,
      is_discounted: false
    },
    {
      flag_id: 'FLAG-FIRE-EGRESS',
      title: 'Architectural Plan Missing Secondary Fire Staircase',
      category: 'INFRASTRUCTURE',
      severity: 'HIGH',
      points: 18,
      base_points: 18,
      is_discounted: false
    },
    {
      flag_id: 'FLAG-HASH-COLLISION',
      title: 'Duplicate Document Hash Collision Across Applications',
      category: 'ANOMALY',
      severity: 'CRITICAL',
      points: 25,
      base_points: 25,
      is_discounted: false
    },
    {
      flag_id: 'FLAG-PHASH-NEAR-DUP',
      title: 'Perceptual Hash Near-Duplicate Scan Detected (94% Match)',
      category: 'ANOMALY',
      severity: 'HIGH',
      points: 15,
      base_points: 15,
      is_discounted: false
    },
    {
      flag_id: 'FLAG-LEXICAL-NAME',
      title: 'Discrepancy in Registered Trust Legal Name',
      category: 'VERIFICATION',
      severity: 'MEDIUM',
      points: 10,
      base_points: 10,
      is_discounted: false
    }
  ],
  flags: [
    {
      id: 'FLAG-LAND-AREA',
      rule_id: 'RULE-LAND-01',
      category: 'VALIDATION',
      severity: 'CRITICAL',
      title: 'Land Area Deficit: 3.80 Acres Provided vs 5.00 Acres Mandatory',
      evidence: {
        source_doc_id: 'DOC-APEX-LAND',
        source_doc_type: 'LAND_DOCUMENT',
        page: 1,
        bounding_box: { page: 1, x: 26, y: 44, width: 48, height: 14, text: 'Total Area: 3.80 Acres (Khasra 214/1)' },
        snippet: 'Khasra No 214/1 admeasuring 3.80 Acres situated at Sarojini Nagar, Lucknow.'
      },
      reason: 'AICTE Approval Process Handbook Clause 4.1.2 mandates a minimum contiguous land area of 5.00 Acres in Mega/Metro and 7.50 Acres in Rural regions for a new technical engineering campus. Extracted area (3.80 Acres) falls short by 1.20 Acres.',
      confidence: 0.99,
      confidence_level: 'HIGH',
      risk_points: 25,
      officer_feedback: null
    },
    {
      id: 'FLAG-ELA-SOCIETY',
      rule_id: 'RULE-TAMPER-01',
      category: 'ANOMALY',
      severity: 'CRITICAL',
      title: 'ELA Tampering Detected: Society Registration Expiry Year Altered',
      evidence: {
        source_doc_id: 'DOC-APEX-TRUST',
        source_doc_type: 'TRUST_DEED',
        page: 1,
        bounding_box: { page: 1, x: 38, y: 62, width: 36, height: 12, text: 'Valid Upto: 2034-04-11' },
        snippet: 'High-frequency compression quantization grid disparity around year string "2034" (Original year in metadata was "2024").'
      },
      reason: 'Error Level Analysis (ELA) reveals a 94.2% compression disparity around the expiry year digits. Metadata indicates re-saving with image editor software on 2026-05-11, indicating expired society deed was artificially extended.',
      confidence: 0.96,
      confidence_level: 'HIGH',
      risk_points: 25,
      officer_feedback: null
    },
    {
      id: 'FLAG-FIRE-EGRESS',
      rule_id: 'RULE-FIRE-02',
      category: 'INFRASTRUCTURE',
      severity: 'HIGH',
      title: 'Architectural Blueprint Missing Mandatory Secondary Fire Staircase',
      evidence: {
        source_doc_id: 'DOC-APEX-PLAN',
        source_doc_type: 'FLOOR_PLAN',
        page: 1,
        bounding_box: { page: 1, x: 70, y: 20, width: 25, height: 35, text: 'Academic Wing B - Dead End Corridor' },
        snippet: 'Corridor length extends 42.5m beyond primary staircase without secondary fire exit.'
      },
      reason: 'National Building Code Part 4 requires all educational buildings exceeding 500 sqm floor plate to provide two independent fire escape staircases with maximum travel distance of 30m.',
      confidence: 0.92,
      confidence_level: 'HIGH',
      risk_points: 18,
      officer_feedback: null
    },
    {
      id: 'FLAG-HASH-COLLISION',
      rule_id: 'RULE-CROSS-04',
      category: 'ANOMALY',
      severity: 'CRITICAL',
      title: 'Document Hash Collision: Identical File Submitted by Another Entity',
      evidence: {
        source_doc_id: 'DOC-APEX-TRUST',
        source_doc_type: 'TRUST_DEED',
        page: 1,
        bounding_box: { page: 1, x: 10, y: 15, width: 80, height: 20, text: 'SHA-256 Hash Match' },
        snippet: 'SHA-256 hash e3b0c44298fc1c14 matches document filed by Sahyadri Educational Society in Maharashtra.'
      },
      reason: 'Cross-application deduplication index flagged exact identical byte sequence submitted under two distinct regional applications.',
      confidence: 1.00,
      confidence_level: 'HIGH',
      risk_points: 25,
      officer_feedback: null
    },
    {
      id: 'FLAG-PHASH-NEAR-DUP',
      rule_id: 'RULE-PHASH-02',
      category: 'ANOMALY',
      severity: 'HIGH',
      title: 'Perceptual Hash Match: Re-Scanned & Rotated Blueprint Layout (94% Similarity)',
      evidence: {
        source_doc_id: 'DOC-APEX-PLAN',
        source_doc_type: 'FLOOR_PLAN',
        page: 1,
        bounding_box: { page: 1, x: 20, y: 30, width: 60, height: 50, text: 'Perceptual Hash: a7f2c8d4e1b9' },
        snippet: 'dHash distance 3 matches blueprint submitted for an affiliated campus in 2024.'
      },
      reason: 'Perceptual image hashing detected identical structural architectural drawings re-scanned at 15 degrees rotation to evade exact cryptographic hash matching.',
      confidence: 0.94,
      confidence_level: 'HIGH',
      risk_points: 15,
      officer_feedback: null
    },
    {
      id: 'FLAG-LEXICAL-NAME',
      rule_id: 'RULE-CROSS-03',
      category: 'VERIFICATION',
      severity: 'MEDIUM',
      title: 'Discrepancy in Trust Legal Title Across Revenue Records',
      evidence: {
        source_doc_id: 'DOC-APEX-LAND',
        source_doc_type: 'LAND_DOCUMENT',
        page: 1,
        bounding_box: { page: 1, x: 15, y: 30, width: 45, height: 10, text: 'Apex Charitable & Educational Trust' },
        snippet: 'Application states "Apex Educational & Charitable Trust", revenue deed states "Apex Charitable & Educational Trust".'
      },
      reason: 'Fuzzy lexical matching across statutory records yielded 84% string similarity. Rectification deed or statutory clarification required.',
      confidence: 0.88,
      confidence_level: 'MEDIUM',
      risk_points: 10,
      officer_feedback: null
    }
  ],
  documents: [
    {
      id: 'DOC-APEX-TRUST',
      application_id: 'AICTE-2026-APEX-TAMPERED',
      doc_type: 'TRUST_DEED',
      filename: 'Registered_Trust_Deed_Certificate.pdf',
      file_path: '/documents/DOC-APEX-TRUST.pdf',
      file_hash: '3f8b91a8c0d12e4f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
      file_size: 1420580,
      upload_timestamp: '2026-05-12T14:31:00Z',
      extracted_fields: {
        trust_name: 'Apex Educational & Charitable Trust',
        registration_no: 'SOC/UP/2014/8839',
        registration_date: '2014-04-12',
        valid_upto: '2034-04-11 (Altered)',
        chairman: 'Dr. Ramesh Chandra Verma'
      },
      bounding_boxes: {
        trust_name: { page: 1, x: 15, y: 25, width: 50, height: 8 },
        valid_upto: { page: 1, x: 38, y: 62, width: 36, height: 12 }
      },
      metadata: { software: 'Adobe Photoshop 24.1 (Tampered)', device: 'OpticPro Flatbed', dpi: 300 },
      tamper_signals: {
        is_tampered: true,
        anomaly_score: 0.942,
        disparity_ratio: 4.8,
        suspicious_box: { page: 1, x: 38, y: 62, width: 36, height: 12 }
      },
      perceptual_hash: { phash: 'bf83a1d9c2e40f', duplicate_match_id: 'AICTE-2026-SAHYADRI-POLY', similarity_percent: 100 },
      quality_check: { is_blurry: false, resolution_dpi: 300, rotation_degrees: 0, cropped_warning: false },
      qr_data: 'AICTE-VERIFY:SOC-UP-2014-8839:EXPIRED-2024',
      digital_signature: { valid: false, signer: 'Unknown / Corrupted Signature', timestamp: '2026-05-11T19:22:10Z' }
    },
    {
      id: 'DOC-APEX-LAND',
      application_id: 'AICTE-2026-APEX-TAMPERED',
      doc_type: 'LAND_DOCUMENT',
      filename: 'Sarojini_Nagar_Revenue_Sale_Deed.pdf',
      file_path: '/documents/DOC-APEX-LAND.pdf',
      file_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      file_size: 2840192,
      upload_timestamp: '2026-05-12T14:32:00Z',
      extracted_fields: {
        survey_khasra_no: '214/1',
        total_area_acres: 3.80,
        village: 'Sarojini Nagar',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        encumbrance_status: 'Clear'
      },
      bounding_boxes: { area: { page: 1, x: 26, y: 44, width: 48, height: 14 } },
      metadata: { issuing_authority: 'Sub-Registrar Sadar Lucknow', book_no: '4', volume: '1120' },
      tamper_signals: { is_tampered: false, anomaly_score: 0.05 },
      quality_check: { is_blurry: false, resolution_dpi: 300, rotation_degrees: 0, cropped_warning: false },
      qr_data: 'UP-BHULEKH:KHASRA-214-1:AREA-3.80',
      digital_signature: { valid: true, signer: 'Sub-Registrar Lucknow Sadar', timestamp: '2025-11-20T12:00:00Z' }
    },
    {
      id: 'DOC-APEX-PLAN',
      application_id: 'AICTE-2026-APEX-TAMPERED',
      doc_type: 'FLOOR_PLAN',
      filename: 'Campus_Architectural_Layout_WingB.pdf',
      file_path: '/documents/DOC-APEX-PLAN.pdf',
      file_hash: '5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d',
      file_size: 3410290,
      upload_timestamp: '2026-05-12T14:33:00Z',
      extracted_fields: {
        total_builtup_area_sqm: 14200,
        carpet_area_sqm: 11800,
        floor_count: 4,
        fire_escape_count: 1
      },
      bounding_boxes: { corridor: { page: 1, x: 70, y: 20, width: 25, height: 35 } },
      metadata: { architect: 'CoA Registered Architect CA/2010/44812', drawn_date: '2026-04-18' },
      tamper_signals: { is_tampered: false, anomaly_score: 0.08 },
      perceptual_hash: { phash: 'a7f2c8d4e1b9', similarity_percent: 94 },
      quality_check: { is_blurry: false, resolution_dpi: 300, rotation_degrees: 15, cropped_warning: true }
    },
    {
      id: 'DOC-APEX-FIRE',
      application_id: 'AICTE-2026-APEX-TAMPERED',
      doc_type: 'FIRE_NOC',
      filename: 'Provisional_Fire_Safety_NOC.pdf',
      file_path: '/documents/DOC-APEX-FIRE.pdf',
      file_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      file_size: 1980320,
      upload_timestamp: '2026-05-12T14:34:00Z',
      extracted_fields: {
        noc_number: 'CFO/UP/LKO/2026/0491',
        validity: 'Provisional',
        issue_date: '2026-03-10'
      },
      bounding_boxes: {},
      metadata: { department: 'UP Fire Service Department' },
      tamper_signals: { is_tampered: false, anomaly_score: 0.12 },
      quality_check: { is_blurry: false, resolution_dpi: 300, rotation_degrees: 0, cropped_warning: false }
    }
  ],
  verification_results: [
    {
      authority_name: 'State Revenue Land Records Portal (UP Bhulekh)',
      service_type: 'Land Registry Automated Check',
      identifier_checked: 'Survey Khasra 214/1, Sarojini Nagar',
      status: 'VERIFIED',
      latency_ms: 240,
      details: {
        registered_owner: 'Apex Educational & Charitable Trust',
        record_area_acres: 3.80,
        encumbrance_status: 'FREE_AND_CLEAR',
        dispute_flag: 'NONE'
      },
      qr_verified: true,
      digital_signature_valid: true
    },
    {
      authority_name: 'Registrar of Societies & Chits UP',
      service_type: 'Society Standing Registry API',
      identifier_checked: 'Registration No. SOC/UP/2014/8839',
      status: 'MISMATCH',
      latency_ms: 185,
      details: {
        official_status: 'EXPIRED (2024-04-11)',
        database_valid_until: '2024-04-11',
        renewal_paid: false,
        note: 'Submitted certificate claims validity upto 2034, but official database shows expired in 2024.'
      },
      qr_verified: false,
      digital_signature_valid: false
    },
    {
      authority_name: 'State Fire Service Department',
      service_type: 'Fire Safety NOC Gateway',
      identifier_checked: 'NOC Ref CFO/UP/LKO/2026/0491',
      status: 'MANUAL_REVIEW_REQUIRED',
      latency_ms: 310,
      details: {
        status: 'CONDITIONAL_PROVISIONAL',
        compliance_remarks: 'Conditional NOC issued subject to construction of secondary fire escape staircase.'
      },
      qr_verified: true,
      digital_signature_valid: true
    }
  ],
  audit_chain: [
    {
      index: 1,
      timestamp: '2026-05-12T14:30:00Z',
      application_id: 'AICTE-2026-APEX-TAMPERED',
      actor: 'APPLICANT_PORTAL',
      action: 'APPLICATION_SUBMITTED',
      details: { documents_count: 4, ip_address: '103.24.112.9' },
      data_hash: sha256('BLOCK-1-APEX-SUBMITTED'),
      prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: sha256('0000000000000000000000000000000000000000000000000000000000000000' + sha256('BLOCK-1-APEX-SUBMITTED'))
    },
    {
      index: 2,
      timestamp: '2026-05-12T14:31:12Z',
      application_id: 'AICTE-2026-APEX-TAMPERED',
      actor: 'AUTOMATED_EXTRACTION_ENGINE',
      action: 'OCR_AND_FIELD_EXTRACTION_COMPLETED',
      details: { documents_parsed: 4, fields_extracted: 18, low_confidence_count: 0 },
      data_hash: sha256('BLOCK-2-OCR-FIELDS'),
      prev_hash: sha256('0000000000000000000000000000000000000000000000000000000000000000' + sha256('BLOCK-1-APEX-SUBMITTED')),
      hash: sha256(sha256('0000000000000000000000000000000000000000000000000000000000000000' + sha256('BLOCK-1-APEX-SUBMITTED')) + sha256('BLOCK-2-OCR-FIELDS'))
    },
    {
      index: 3,
      timestamp: '2026-05-12T14:31:45Z',
      application_id: 'AICTE-2026-APEX-TAMPERED',
      actor: 'FORENSICS_AND_ANOMALY_ENGINE',
      action: 'TAMPER_AND_ANOMALY_FLAGS_RECORDED',
      details: { flags_raised: 6, risk_score: 78, risk_band: 'HIGH' },
      data_hash: sha256('BLOCK-3-FLAGS-RAISED'),
      prev_hash: sha256(sha256('0000000000000000000000000000000000000000000000000000000000000000' + sha256('BLOCK-1-APEX-SUBMITTED')) + sha256('BLOCK-2-OCR-FIELDS')),
      hash: sha256(sha256(sha256('0000000000000000000000000000000000000000000000000000000000000000' + sha256('BLOCK-1-APEX-SUBMITTED')) + sha256('BLOCK-2-OCR-FIELDS')) + sha256('BLOCK-3-FLAGS-RAISED'))
    },
    {
      index: 4,
      timestamp: '2026-05-12T14:32:10Z',
      application_id: 'AICTE-2026-APEX-TAMPERED',
      actor: 'ISSUER_VERIFICATION_ADAPTER',
      action: 'REGISTRY_STATUS_DISCREPANCY_LOGGED',
      details: { authority: 'UP Registrar of Societies', returned_status: 'EXPIRED' },
      data_hash: sha256('BLOCK-4-ISSUER-STATUS'),
      prev_hash: sha256(sha256(sha256('0000000000000000000000000000000000000000000000000000000000000000' + sha256('BLOCK-1-APEX-SUBMITTED')) + sha256('BLOCK-2-OCR-FIELDS')) + sha256('BLOCK-3-FLAGS-RAISED')),
      hash: sha256(sha256(sha256(sha256('0000000000000000000000000000000000000000000000000000000000000000' + sha256('BLOCK-1-APEX-SUBMITTED')) + sha256('BLOCK-2-OCR-FIELDS')) + sha256('BLOCK-3-FLAGS-RAISED')) + sha256('BLOCK-4-ISSUER-STATUS'))
    }
  ],
  officer_decision: undefined
};

// -------------------------------------------------------------
// 2. CLEAN TWIN APPLICATION (APEX CLEAN)
// -------------------------------------------------------------
export const SHOWCASE_CLEAN: ApplicationDetail = {
  ...SHOWCASE_TAMPERED,
  id: 'AICTE-2026-APEX-CLEAN',
  reference_no: 'AICTE/2026/NI/000124',
  institution_name: 'Apex Institute of Technology & Research (Clean Submission)',
  land_area_acres: 5.25,
  risk_score: 8,
  risk_band: 'LOW',
  status: 'ACCEPTED',
  is_tampered_demo: false,
  flags: [],
  risk_breakdown: [],
  officer_decision: {
    decision: 'ACCEPTED',
    remarks: 'All statutory documents verified. Land area contiguous (5.25 acres). Fire NOC approved. Fast-track clearance granted.',
    officer_name: 'Dr. S. K. Sharma (Regional Scrutiny Officer)',
    timestamp: '2026-05-13T11:20:00Z',
    reason_for_access: 'Routine Sequential Queue Processing'
  }
};

// -------------------------------------------------------------
// 3. GENERATE 500+ BULK APPLICATION SUMMARIES (FOR QUEUE & SLA)
// -------------------------------------------------------------
export function generateBulkApplications(): ApplicationSummary[] {
  const categories = [
    { code: 'NEW_INSTITUTION', name: 'New Technical Institution' },
    { code: 'EXTENSION_OF_APPROVAL', name: 'Extension of Approval (EoA)' },
    { code: 'CLOSURE_VARIATION', name: 'Closure / Variation in Intake' }
  ];

  const states = [
    { state: 'Maharashtra', districts: ['Pune', 'Mumbai Suburban', 'Nagpur', 'Nashik'] },
    { state: 'Karnataka', districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Belagavi'] },
    { state: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'] },
    { state: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
    { state: 'Uttar Pradesh', districts: ['Lucknow', 'Kanpur Nagar', 'Gautam Buddha Nagar', 'Varanasi'] },
    { state: 'Madhya Pradesh', districts: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'] },
    { state: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
    { state: 'Kerala', districts: ['Thiruvananthapuram', 'Ernakulam', 'Kozhikode', 'Thrissur'] },
    { state: 'Punjab', districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
    { state: 'Telangana', districts: ['Hyderabad', 'Rangareddy', 'Warangal', 'Medchal'] }
  ];

  const collegePrefixes = [
    'Vidyavardhini', 'Sahyadri', 'Bharati', 'Shivaji', 'Vivekananda',
    'Kongu', 'Amrita', 'Sardar Patel', 'Malaviya', 'Tagore',
    'Netaji', 'Marathwada', 'Kakatiya', 'Osmania', 'Dnyaneshwar'
  ];

  const collegeTypes = [
    'College of Engineering & Technology',
    'Institute of Technology & Science',
    'Polytechnic & Research Centre',
    'Institute of Engineering',
    'Academy of Technical Studies'
  ];

  const list: ApplicationSummary[] = [
    {
      id: SHOWCASE_TAMPERED.id,
      reference_no: SHOWCASE_TAMPERED.reference_no,
      category: SHOWCASE_TAMPERED.category,
      category_name: SHOWCASE_TAMPERED.category_name,
      institution_name: SHOWCASE_TAMPERED.institution_name,
      trust_name: SHOWCASE_TAMPERED.trust_name,
      state: SHOWCASE_TAMPERED.state,
      district: SHOWCASE_TAMPERED.district,
      risk_score: SHOWCASE_TAMPERED.risk_score,
      risk_band: SHOWCASE_TAMPERED.risk_band,
      flags_count: SHOWCASE_TAMPERED.flags.length,
      status: SHOWCASE_TAMPERED.status,
      submission_date: '2026-05-12',
      sla_days_remaining: 2,
      sla_urgency: 'URGENT'
    },
    {
      id: SHOWCASE_CLEAN.id,
      reference_no: SHOWCASE_CLEAN.reference_no,
      category: SHOWCASE_CLEAN.category,
      category_name: SHOWCASE_CLEAN.category_name,
      institution_name: SHOWCASE_CLEAN.institution_name,
      trust_name: SHOWCASE_CLEAN.trust_name,
      state: SHOWCASE_CLEAN.state,
      district: SHOWCASE_CLEAN.district,
      risk_score: SHOWCASE_CLEAN.risk_score,
      risk_band: SHOWCASE_CLEAN.risk_band,
      flags_count: 0,
      status: SHOWCASE_CLEAN.status,
      submission_date: '2026-05-10',
      sla_days_remaining: 14,
      sla_urgency: 'NORMAL'
    }
  ];

  for (let i = 3; i <= 520; i++) {
    const stateObj = states[(i * 7) % states.length];
    const district = stateObj.districts[(i * 3) % stateObj.districts.length];
    const cat = categories[i % categories.length];
    const prefix = collegePrefixes[(i * 5) % collegePrefixes.length];
    const cType = collegeTypes[i % collegeTypes.length];
    const instName = `${prefix} ${cType}`;
    const trustName = `${prefix} Educational & Charitable Trust`;

    // Realistic risk distribution: 70% low, 20% medium, 10% high
    const rand = (i * 13) % 100;
    let score = 5 + (i % 20);
    let band: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let flagsCount = 0;
    let status: 'SUBMITTED' | 'IN_SCRUTINY' | 'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED' = 'SUBMITTED';

    if (rand > 88) {
      score = 65 + (i % 30);
      band = 'HIGH';
      flagsCount = 3 + (i % 3);
      status = 'IN_SCRUTINY';
    } else if (rand > 68) {
      score = 35 + (i % 25);
      band = 'MEDIUM';
      flagsCount = 1 + (i % 2);
      status = 'IN_SCRUTINY';
    } else {
      if (i % 3 === 0) status = 'ACCEPTED';
    }

    const slaDays = (i % 28) + 1;
    let slaUrgency: 'NORMAL' | 'URGENT' | 'BREACHED' = 'NORMAL';
    if (slaDays <= 2) slaUrgency = 'URGENT';
    if (slaDays === 1 && i % 4 === 0) slaUrgency = 'BREACHED';

    list.push({
      id: `AICTE-2026-${stateObj.state.substring(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`,
      reference_no: `AICTE/2026/${cat.code === 'NEW_INSTITUTION' ? 'NI' : 'EOA'}/${String(i).padStart(6, '0')}`,
      category: cat.code,
      category_name: cat.name,
      institution_name: instName,
      trust_name: trustName,
      state: stateObj.state,
      district,
      risk_score: score,
      risk_band: band,
      flags_count: flagsCount,
      status,
      submission_date: `2026-05-${String((i % 20) + 1).padStart(2, '0')}`,
      sla_days_remaining: slaDays,
      sla_urgency: slaUrgency
    });
  }

  return list;
}

// -------------------------------------------------------------
// 4. CROSS-APPLICATION FRAUD / LINK GRAPH DATA
// -------------------------------------------------------------
export const MOCK_GRAPH_NODES: GraphNode[] = [
  { id: 'APP-00123', label: 'Apex Institute (AICTE/2026/NI/000123)', type: 'APPLICATION', risk: 'HIGH' },
  { id: 'APP-00044', label: 'Sahyadri Polytechnic (AICTE/2026/NI/000044)', type: 'APPLICATION', risk: 'HIGH' },
  { id: 'APP-00089', label: 'Vidyavardhini Campus (AICTE/2026/NI/000089)', type: 'APPLICATION', risk: 'LOW' },
  { id: 'HASH-SHARED-CERT', label: 'SHA-256: 3f8b91a8 (Shared Deed File)', type: 'DOCUMENT_HASH', risk: 'CRITICAL' },
  { id: 'PHONE-SHARED', label: 'Mobile: +91 98220 44129', type: 'PHONE', risk: 'HIGH' },
  { id: 'TRUST-SHARED-REG', label: 'Registration: SOC/UP/2014/8839', type: 'TRUST', risk: 'CRITICAL' },
  { id: 'ADDR-SHARED', label: 'Knowledge Park Plot 42-B, Sarojini Nagar', type: 'ADDRESS', risk: 'HIGH' }
];

export const MOCK_GRAPH_LINKS: GraphLink[] = [
  { source: 'APP-00123', target: 'HASH-SHARED-CERT', label: 'Submitted Duplicate Hash' },
  { source: 'APP-00044', target: 'HASH-SHARED-CERT', label: 'Submitted Identical Hash' },
  { source: 'APP-00123', target: 'PHONE-SHARED', label: 'Contact Phone Number' },
  { source: 'APP-00044', target: 'PHONE-SHARED', label: 'Reused Contact Phone' },
  { source: 'APP-00123', target: 'TRUST-SHARED-REG', label: 'Claimed Registration No' },
  { source: 'APP-00089', target: 'ADDR-SHARED', label: 'Contiguous Survey Boundary' },
  { source: 'APP-00123', target: 'ADDR-SHARED', label: 'Overlapping Plot Address' }
];

// -------------------------------------------------------------
// 5. ADMIN RULES CONFIGURATION
// -------------------------------------------------------------
export const INITIAL_ADMIN_RULES: RuleConfigItem[] = [
  {
    id: 'RULE-LAND-01',
    name: 'Contiguous Land Area Minimum Threshold',
    category: 'LAND_REVENUE',
    severity: 'CRITICAL',
    risk_points: 25,
    enabled: true,
    description: 'Enforces minimum contiguous land area requirement (5.0 acres Metro / 7.5 acres Rural) under AICTE Approval Process Handbook Clause 4.1.',
    parameters: { min_metro_acres: 5.0, min_rural_acres: 7.5 }
  },
  {
    id: 'RULE-TAMPER-01',
    name: 'Error Level Analysis (ELA) Compression Tampering Check',
    category: 'ANOMALY',
    severity: 'CRITICAL',
    risk_points: 25,
    enabled: true,
    description: 'Computer vision analysis of JPEG/PNG compression grids to detect forged expiry dates, altered names, and spliced stamps.',
    parameters: { confidence_threshold: 0.85 }
  },
  {
    id: 'RULE-FIRE-02',
    name: 'Building Architectural Safety & Secondary Egress Verification',
    category: 'INFRASTRUCTURE',
    severity: 'HIGH',
    risk_points: 18,
    enabled: true,
    description: 'Verifies secondary emergency evacuation staircase for multi-storey educational wings under National Building Code 2016.',
    parameters: { max_corridor_travel_distance_m: 30 }
  },
  {
    id: 'RULE-SOCIETY-03',
    name: 'Registrar of Societies Active Standing & Date Validity',
    category: 'LEGAL_STATUTORY',
    severity: 'HIGH',
    risk_points: 20,
    enabled: true,
    description: 'Cross-verifies validity period of Registered Society / Trust Deed against state registrar databases.',
    parameters: { grace_period_days: 0 }
  },
  {
    id: 'RULE-CROSS-04',
    name: 'Inter-Institutional Document Hash Collision Detector',
    category: 'ANOMALY',
    severity: 'CRITICAL',
    risk_points: 25,
    enabled: true,
    description: 'Flags identical SHA-256 document hashes submitted by separate institutions across India.',
    parameters: { exact_hash_match: true }
  },
  {
    id: 'RULE-PHASH-02',
    name: 'Perceptual Hash (pHash) Near-Duplicate Scan',
    category: 'ANOMALY',
    severity: 'HIGH',
    risk_points: 15,
    enabled: true,
    description: 'Detects re-saved, rotated, or slightly cropped duplicate drawings and certificates with similarity above 90%.',
    parameters: { similarity_threshold: 0.90 }
  }
];

// -------------------------------------------------------------
// 6. ADMIN KPIS & ALERTS
// -------------------------------------------------------------
export const INITIAL_ADMIN_KPIS: AdminKPIs = {
  total_applications: 520,
  applications_processed: 486,
  applications_pending: 34,
  avg_verification_time_minutes: 0.24,
  manual_baseline_minutes: 240,
  time_saved_percent: 98.4,
  total_flags_detected: 94,
  flags_by_type: {
    VALIDATION: 38,
    ANOMALY: 31,
    INFRASTRUCTURE: 15,
    VERIFICATION: 10
  },
  officer_feedback_stats: {
    total_reviews: 82,
    confirmed_issues: 78,
    false_alarms: 4,
    false_positive_rate_percent: 4.88
  },
  risk_distribution: {
    low_risk: 364,
    medium_risk: 104,
    high_risk: 52
  }
};

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-901',
    level: 'CRITICAL',
    title: 'Digital Forgery Flagged in Dossier AICTE/2026/NI/000123',
    details: 'Computer Vision ELA identified altered expiration date digit on Society Registration Deed.',
    timestamp: '12 mins ago',
    application_id: 'AICTE-2026-APEX-TAMPERED'
  },
  {
    id: 'ALT-902',
    level: 'CRITICAL',
    title: 'Cross-Application Document Hash Collision',
    details: 'Identical SHA-256 trust deed hash submitted across UP and Maharashtra regional applications.',
    timestamp: '35 mins ago',
    application_id: 'AICTE-2026-APEX-TAMPERED'
  },
  {
    id: 'ALT-903',
    level: 'WARNING',
    title: 'SLA Urgency Alert: 4 Applications Nearing 48-Hour Deadline',
    details: 'Statutory scrutiny deadline approaching for regional queue dossiers.',
    timestamp: '1 hour ago',
    application_id: 'AICTE-2026-APEX-TAMPERED'
  },
  {
    id: 'ALT-904',
    level: 'INFO',
    title: 'State Revenue Land Records API Gateway Operational',
    details: 'UP Bhulekh Land Records adapter operating at 240ms median latency. All endpoints healthy.',
    timestamp: '2 hours ago',
    application_id: 'SYSTEM'
  }
];
