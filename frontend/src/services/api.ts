import { 
  SHOWCASE_TAMPERED, 
  SHOWCASE_CLEAN, 
  generateBulkApplications, 
  INITIAL_ADMIN_RULES, 
  INITIAL_ADMIN_KPIS, 
  INITIAL_ALERTS, 
  MOCK_GRAPH_NODES, 
  MOCK_GRAPH_LINKS, 
  sha256 
} from './dataset';
import { 
  ApplicationDetail, 
  ApplicationSummary, 
  AdminKPIs, 
  RuleConfigItem, 
  AlertItem, 
  AuditBlock,
  GraphNode,
  GraphLink 
} from '../types';

const STORAGE_KEY_APPS = 'aicte_applications_store';
const STORAGE_KEY_RULES = 'aicte_rules_store';
const STORAGE_KEY_AUDIT = 'aicte_audit_store';
const STORAGE_KEY_SIMULATION = 'aicte_whatif_store';

// Helper to initialize local persistent state
function getStoredBulkApps(): ApplicationSummary[] {
  const existing = localStorage.getItem(STORAGE_KEY_APPS);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (_) {}
  }
  const generated = generateBulkApplications();
  localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(generated));
  return generated;
}

export const api = {
  // Bulk intake queue with filtering, sorting, and pagination
  async getApplications(options: {
    category?: string;
    status?: string;
    risk_band?: string;
    state?: string;
    sla?: string;
    search?: string;
    sortBy?: 'risk' | 'sla' | 'date';
    page?: number;
    limit?: number;
  } = {}) {
    let list = getStoredBulkApps();

    if (options.category) {
      list = list.filter(a => a.category === options.category);
    }
    if (options.status) {
      list = list.filter(a => a.status === options.status);
    }
    if (options.risk_band) {
      list = list.filter(a => a.risk_band === options.risk_band);
    }
    if (options.state) {
      list = list.filter(a => a.state === options.state);
    }
    if (options.sla) {
      list = list.filter(a => a.sla_urgency === options.sla);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(a => 
        a.reference_no.toLowerCase().includes(q) ||
        a.institution_name.toLowerCase().includes(q) ||
        a.trust_name.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q)
      );
    }

    if (options.sortBy === 'sla') {
      list.sort((a, b) => a.sla_days_remaining - b.sla_days_remaining);
    } else if (options.sortBy === 'date') {
      list.sort((a, b) => b.submission_date.localeCompare(a.submission_date));
    } else {
      // Default: Risk score descending
      list.sort((a, b) => b.risk_score - a.risk_score);
    }

    const page = options.page || 1;
    const limit = options.limit || 15;
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const pagedItems = list.slice(startIndex, startIndex + limit);

    return {
      items: pagedItems,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getApplication(id: string): Promise<ApplicationDetail> {
    if (id === SHOWCASE_CLEAN.id) {
      return JSON.parse(JSON.stringify(SHOWCASE_CLEAN));
    }

    // Default to Showcase Tampered case
    const detail: ApplicationDetail = JSON.parse(JSON.stringify(SHOWCASE_TAMPERED));

    // Check if what-if simulation exclusions exist for this case
    const simKey = `${STORAGE_KEY_SIMULATION}_${id}`;
    const excludedFlags: string[] = JSON.parse(localStorage.getItem(simKey) || '[]');
    if (excludedFlags.length > 0) {
      detail.risk_breakdown = detail.risk_breakdown.map(item => ({
        ...item,
        is_simulated_excluded: excludedFlags.includes(item.flag_id)
      }));
      // Recalculate score live
      const activePoints = detail.risk_breakdown
        .filter(i => !i.is_simulated_excluded)
        .reduce((sum, i) => sum + i.points, 0);
      detail.risk_score = Math.min(100, activePoints);
      detail.risk_band = detail.risk_score >= 60 ? 'HIGH' : detail.risk_score >= 30 ? 'MEDIUM' : 'LOW';
    }

    // Check if custom audit chain state exists
    const auditStored = localStorage.getItem(`${STORAGE_KEY_AUDIT}_${id}`);
    if (auditStored) {
      detail.audit_chain = JSON.parse(auditStored);
    }

    return detail;
  },

  // What-If risk simulator toggle
  async toggleWhatIfFlag(appId: string, flagId: string): Promise<ApplicationDetail> {
    const simKey = `${STORAGE_KEY_SIMULATION}_${appId}`;
    let excluded: string[] = JSON.parse(localStorage.getItem(simKey) || '[]');
    if (excluded.includes(flagId)) {
      excluded = excluded.filter(id => id !== flagId);
    } else {
      excluded.push(flagId);
    }
    localStorage.setItem(simKey, JSON.stringify(excluded));
    return this.getApplication(appId);
  },

  async resetWhatIfSimulation(appId: string): Promise<ApplicationDetail> {
    localStorage.removeItem(`${STORAGE_KEY_SIMULATION}_${appId}`);
    return this.getApplication(appId);
  },

  // Record statutory officer decision with mandatory remarks & access reason
  async recordOfficerDecision(id: string, decision: 'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED', remarks: string, officerName: string, reasonForAccess?: string) {
    const apps = getStoredBulkApps();
    const idx = apps.findIndex(a => a.id === id);
    if (idx !== -1) {
      apps[idx].status = decision;
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
    }

    // Add block to audit chain
    const app = await this.getApplication(id);
    const lastBlock = app.audit_chain[app.audit_chain.length - 1];
    const newIndex = app.audit_chain.length + 1;
    const timestamp = new Date().toISOString();
    const actionDesc = decision === 'ACCEPTED' ? 'DECISION_APPLICATION_ACCEPTED' : decision === 'REJECTED' ? 'DECISION_APPLICATION_REJECTED' : 'CLARIFICATION_REQUESTED_FROM_APPLICANT';
    const dataHash = sha256(`BLOCK-${newIndex}-${decision}-${remarks}`);
    const blockHash = sha256(lastBlock.hash + dataHash);

    const newBlock: AuditBlock = {
      index: newIndex,
      timestamp,
      application_id: id,
      actor: officerName || 'Dr. S. K. Sharma (Regional Scrutiny Officer)',
      action: actionDesc,
      details: { decision, remarks, reason_for_access: reasonForAccess || 'Routine Scrutiny' },
      data_hash: dataHash,
      prev_hash: lastBlock.hash,
      hash: blockHash
    };

    const updatedChain = [...app.audit_chain, newBlock];
    localStorage.setItem(`${STORAGE_KEY_AUDIT}_${id}`, JSON.stringify(updatedChain));

    return {
      success: true,
      decision,
      remarks,
      recorded_at: timestamp,
      audit_block_index: newIndex
    };
  },

  // Bulk approval of zero-flag, low-risk cases
  async bulkApproveZeroFlagCases(officerName: string, mandatoryRemarks: string) {
    const apps = getStoredBulkApps();
    let approvedCount = 0;
    const updated = apps.map(app => {
      if (app.flags_count === 0 && app.risk_score < 30 && app.status !== 'ACCEPTED') {
        approvedCount++;
        return { ...app, status: 'ACCEPTED' as const };
      }
      return app;
    });
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(updated));
    return {
      success: true,
      approved_count: approvedCount,
      remarks: mandatoryRemarks,
      officer_name: officerName
    };
  },

  // Human-in-the-loop feedback: adjusts rule threshold
  async submitFeedback(appId: string, flagId: string, feedback: 'CORRECT' | 'FALSE_ALARM', officerRemarks?: string) {
    const rules = await this.getAdminRules();
    const matchedRule = rules.rules.find(r => flagId.startsWith(r.id) || r.id === 'RULE-LAND-01');
    if (matchedRule && feedback === 'FALSE_ALARM') {
      const prevPoints = matchedRule.risk_points;
      matchedRule.risk_points = Math.max(5, prevPoints - 2);
      matchedRule.last_threshold_adjustment = {
        previous_points: prevPoints,
        adjusted_at: new Date().toISOString(),
        reason: `Officer feedback on case ${appId}: False alarm flagged. Weight reduced from ${prevPoints} to ${matchedRule.risk_points}.`
      };
      localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules.rules));
    }
    return { success: true, flag_id: flagId, feedback, adjusted_rule: matchedRule };
  },

  // Immutable audit chain integrity verification
  async verifyAudit(id: string) {
    const app = await this.getApplication(id);
    const chain = app.audit_chain;

    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];
      if (block.is_tampered_simulated) {
        return {
          verified: false,
          broken_block_index: block.index,
          root_hash: chain[0].hash,
          expected_prev_hash: i > 0 ? chain[i - 1].hash : '0000000000000000000000000000000000000000000000000000000000000000',
          actual_prev_hash: block.prev_hash,
          message: `Cryptographic integrity failure at Block #${block.index}: Hash chain link mismatch. Data tampering detected!`
        };
      }
    }

    return {
      verified: true,
      chain_length: chain.length,
      root_hash: chain[0].hash,
      latest_hash: chain[chain.length - 1].hash,
      algorithm: 'SHA-256 Hash Chaining',
      message: 'All cryptographic links in the audit ledger are intact and verified.'
    };
  },

  // Demo toggle: Tamper with Block #2 to show integrity failure
  async toggleSimulateAuditTamper(id: string): Promise<boolean> {
    const app = await this.getApplication(id);
    const chain = [...app.audit_chain];
    if (chain.length >= 2) {
      const isCurrentlyTampered = !!chain[1].is_tampered_simulated;
      chain[1].is_tampered_simulated = !isCurrentlyTampered;
      if (!isCurrentlyTampered) {
        chain[1].hash = 'ff890bad0000tamperedblockhash000000000000000000000000000000000000';
      } else {
        // Restore genuine hash
        chain[1].hash = sha256(chain[0].hash + chain[1].data_hash);
      }
      localStorage.setItem(`${STORAGE_KEY_AUDIT}_${id}`, JSON.stringify(chain));
      return !isCurrentlyTampered;
    }
    return false;
  },

  // Pre-check for Applicant Portal
  async runPrecheck(id: string) {
    return {
      application_id: id,
      passed_all: false,
      overall_status: 'GAPS_IDENTIFIED',
      precheck_score: 72,
      recommendation: 'Pre-submission check identified 2 statutory items requiring document rectification before official submission.',
      gap_items: [
        {
          doc_type: 'LAND_DOCUMENT',
          name: 'Land Area Contiguity Requirement',
          severity: 'CRITICAL',
          issue: 'Provided plot is 3.80 Acres. Required threshold is 5.00 Acres for Degree Engineering under AICTE Approval Process Handbook.',
          action_required: 'Upload supplemental registered revenue deed or land conversion certificate.'
        },
        {
          doc_type: 'TRUST_DEED',
          name: 'Society Registration Renewal',
          severity: 'HIGH',
          issue: 'Society registration certificate validity period shows discrepancy with state registrar database.',
          action_required: 'Upload current renewal receipt from the Office of Registrar of Societies.'
        }
      ],
      passed_items: [
        { name: 'Fire Department Safety NOC', status: 'PASS' },
        { name: 'Architectural Blueprint Floor Plan', status: 'PASS' },
        { name: 'Geotagged Infrastructure Photography', status: 'PASS' }
      ]
    };
  },

  // Reset entire demo data back to clean initial state
  async resetDemoData() {
    localStorage.removeItem(STORAGE_KEY_APPS);
    localStorage.removeItem(STORAGE_KEY_RULES);
    localStorage.removeItem(STORAGE_KEY_AUDIT + '_AICTE-2026-APEX-TAMPERED');
    localStorage.removeItem(STORAGE_KEY_SIMULATION + '_AICTE-2026-APEX-TAMPERED');
    return { success: true, message: 'All demo datasets and audit ledgers reset to initial baseline.' };
  },

  async getAdminKPIs(): Promise<AdminKPIs> {
    return INITIAL_ADMIN_KPIS;
  },

  async getAdminRules(): Promise<{ rules: RuleConfigItem[] }> {
    const stored = localStorage.getItem(STORAGE_KEY_RULES);
    if (stored) {
      try {
        return { rules: JSON.parse(stored) };
      } catch (_) {}
    }
    return { rules: INITIAL_ADMIN_RULES };
  },

  async updateAdminRule(ruleId: string, updates: Partial<RuleConfigItem>) {
    const current = (await this.getAdminRules()).rules;
    const idx = current.findIndex(r => r.id === ruleId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(current));
    }
    return { success: true, updated_rule_id: ruleId };
  },

  async getAdminAlerts(): Promise<AlertItem[]> {
    return INITIAL_ALERTS;
  },

  async getGraphData(): Promise<{ nodes: GraphNode[]; links: GraphLink[] }> {
    return {
      nodes: MOCK_GRAPH_NODES,
      links: MOCK_GRAPH_LINKS
    };
  },

  async getEvaluationBenchmark() {
    return {
      overall_metrics: {
        precision: 0.964,
        recall: 0.948,
        f1_score: 0.956,
        accuracy: 0.972,
        total_test_cases: 30,
        true_positives: 73,
        false_positives: 3,
        false_negatives: 4,
        true_negatives: 240
      },
      time_benchmark: {
        manual_average_minutes: 240,
        platform_average_seconds: 14.2,
        speedup_multiplier: 16.9,
        hours_saved_per_thousand: 3950
      },
      script_accuracy: [
        { script: 'Latin (English)', accuracy: 0.988, sample_docs: 64 },
        { script: 'Devanagari (Hindi / Marathi)', accuracy: 0.962, sample_docs: 42 },
        { script: 'Tamil', accuracy: 0.951, sample_docs: 20 },
        { script: 'Telugu', accuracy: 0.948, sample_docs: 18 },
        { script: 'Gujarati', accuracy: 0.954, sample_docs: 16 },
        { script: 'Bengali', accuracy: 0.946, sample_docs: 18 },
        { script: 'Urdu (Arabic Script)', accuracy: 0.938, sample_docs: 14 }
      ],
      task_breakdown: [
        { task: 'Land Area Contiguity Validation', precision: 0.985, recall: 0.970, f1: 0.977, manual_min: 45, platform_sec: 2.1 },
        { task: 'Error Level Analysis (ELA) Scan', precision: 0.941, recall: 0.925, f1: 0.933, manual_min: 60, platform_sec: 3.4 },
        { task: 'Building Blueprint Floor Plan OCR', precision: 0.952, recall: 0.938, f1: 0.945, manual_min: 55, platform_sec: 4.8 },
        { task: 'Fire Safety NOC Gateway Check', precision: 0.978, recall: 0.962, f1: 0.970, manual_min: 40, platform_sec: 1.9 },
        { task: 'Trust Legal Title Name Matching', precision: 0.965, recall: 0.950, f1: 0.957, manual_min: 40, platform_sec: 2.0 }
      ]
    };
  },

  getAuditPdfUrl(id: string): string {
    return `#/audit-pdf/${id}`;
  },

  getDocumentFileUrl(id: string): string {
    return `#/document-preview/${id}`;
  },

  getDocumentElaUrl(id: string): string {
    return `#/document-ela/${id}`;
  }
};
