const BASE_URL = '';

export const api = {
  async getApplications(category?: string, status?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const res = await fetch(`${BASE_URL}/api/applications?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async getApplication(id: string) {
    const res = await fetch(`${BASE_URL}/api/applications/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch application ${id}`);
    return res.json();
  },

  async runPrecheck(id: string) {
    const res = await fetch(`${BASE_URL}/api/applications/${id}/precheck`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run applicant pre-check');
    return res.json();
  },

  async recordOfficerDecision(id: string, decision: string, remarks: string, officerName?: string) {
    const res = await fetch(`${BASE_URL}/api/applications/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision,
        remarks,
        officer_name: officerName || 'Dr. S. K. Sharma (Regional Scrutiny Officer)'
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to record decision');
    }
    return res.json();
  },

  async submitFeedback(id: string, flagId: string, feedback: 'CORRECT' | 'FALSE_ALARM', remarks?: string) {
    const res = await fetch(`${BASE_URL}/api/applications/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flag_id: flagId,
        feedback,
        officer_remarks: remarks || ''
      })
    });
    if (!res.ok) throw new Error('Failed to submit officer feedback');
    return res.json();
  },

  async verifyAudit(id: string) {
    const res = await fetch(`${BASE_URL}/api/applications/${id}/verify-audit`);
    if (!res.ok) throw new Error('Failed to verify audit ledger');
    return res.json();
  },

  getAuditPdfUrl(id: string) {
    return `${BASE_URL}/api/applications/${id}/audit-pdf`;
  },

  getDocumentFileUrl(docId: string) {
    return `${BASE_URL}/api/documents/${docId}/file`;
  },

  getDocumentElaUrl(docId: string) {
    return `${BASE_URL}/api/documents/${docId}/ela`;
  },

  async uploadDocument(applicationId: string, docType: string, file: File) {
    const formData = new FormData();
    formData.append('application_id', applicationId);
    formData.append('doc_type', docType);
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Document upload failed');
    return res.json();
  },

  async getAdminKPIs() {
    const res = await fetch(`${BASE_URL}/api/admin/kpis`);
    if (!res.ok) throw new Error('Failed to fetch admin KPIs');
    return res.json();
  },

  async getAdminRules() {
    const res = await fetch(`${BASE_URL}/api/admin/rules`);
    if (!res.ok) throw new Error('Failed to fetch rules');
    return res.json();
  },

  async updateAdminRule(ruleId: string, updates: Record<string, any>) {
    const res = await fetch(`${BASE_URL}/api/admin/rules/${ruleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update rule');
    return res.json();
  },

  async getAdminAlerts() {
    const res = await fetch(`${BASE_URL}/api/admin/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async getTamperDemo() {
    const res = await fetch(`${BASE_URL}/api/tamper-demo`);
    if (!res.ok) throw new Error('Failed to fetch tamper demo');
    return res.json();
  },

  async getEvaluationBenchmark() {
    const res = await fetch(`${BASE_URL}/api/evaluation/benchmark`);
    if (!res.ok) throw new Error('Failed to fetch evaluation benchmark');
    return res.json();
  }
};
