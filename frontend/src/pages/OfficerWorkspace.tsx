import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  Landmark, 
  Building2, 
  MapPin, 
  Calendar, 
  Send, 
  FileCheck2, 
  Download,
  Filter,
  Search,
  CheckCircle
} from 'lucide-react';
import { api } from '../services/api';
import { ApplicationDetail, FlagItem } from '../types';
import { PipelineTracker } from '../components/PipelineTracker';
import { RiskScoreCard } from '../components/RiskScoreCard';
import { DocumentViewer } from '../components/DocumentViewer';
import { ExplainableFlagCard } from '../components/ExplainableFlagCard';

export const OfficerWorkspace: React.FC = () => {
  const { 
    selectedAppId, 
    setSelectedAppId, 
    setIsAuditModalOpen, 
    showToast, 
    t 
  } = useApp();

  const [applications, setApplications] = useState<any[]>([]);
  const [currentApp, setCurrentApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>();
  const [activeFlag, setActiveFlag] = useState<FlagItem | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Officer Decision Form
  const [decision, setDecision] = useState<'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED'>('ACCEPTED');
  const [remarks, setRemarks] = useState<string>('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Load application list
  const loadQueue = () => {
    api.getApplications(filterCategory || undefined)
      .then(data => {
        setApplications(data);
        if (!selectedAppId && data.length > 0) {
          setSelectedAppId(data[0].id);
        }
      })
      .catch(err => showToast('Failed to load review queue: ' + err.message));
  };

  useEffect(() => {
    loadQueue();
  }, [filterCategory]);

  // Load active application details
  const loadAppDetail = (appId: string) => {
    if (!appId) return;
    setLoading(true);
    api.getApplication(appId)
      .then(data => {
        setCurrentApp(data);
        if (data.documents && data.documents.length > 0) {
          setSelectedDocId(data.documents[0].id);
        }
        if (data.flags && data.flags.length > 0) {
          setActiveFlag(data.flags[0]);
        } else {
          setActiveFlag(null);
        }
        if (data.officer_decision) {
          setRemarks(data.officer_decision.remarks || '');
        } else {
          setRemarks('');
        }
      })
      .catch(err => showToast('Error loading application: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppDetail(selectedAppId);
  }, [selectedAppId]);

  // Submit Officer Decision
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp) return;

    if (!remarks || remarks.trim().length < 10) {
      showToast('Mandatory remarks must be at least 10 characters long.');
      return;
    }

    setSubmittingDecision(true);
    try {
      await api.recordOfficerDecision(currentApp.id, decision, remarks);
      showToast(`Decision recorded: Application ${decision}! Hash-chained in audit ledger.`);
      loadAppDetail(currentApp.id);
      loadQueue();
    } catch (err: any) {
      showToast('Error recording decision: ' + err.message);
    } finally {
      setSubmittingDecision(false);
    }
  };

  const filteredApps = applications.filter(a => {
    const query = searchQuery.toLowerCase();
    return (
      a.id.toLowerCase().includes(query) ||
      a.institution_name.toLowerCase().includes(query) ||
      a.trust_name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Review Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>{t.officer.queueTitle}</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  {t.officer.sortedByRisk}
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                {filteredApps.length} Cases
              </span>
            </div>

            {/* Search and Category Filter */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search college, trust, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">{t.officer.allCategories}</option>
                <option value="NEW_INSTITUTION">New Technical Institution</option>
                <option value="EXTENSION_OF_APPROVAL">Extension of Approval (EoA)</option>
                <option value="CLOSURE_VARIATION">Closure / Variation in Intake</option>
              </select>
            </div>

            {/* Application List */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredApps.map((app) => {
                const isSelected = app.id === selectedAppId;
                const score = app.risk_score || 0;
                const scoreBadge = score >= 60 
                  ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                  : score >= 30 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/70 border-blue-500 shadow-md shadow-blue-950/40 ring-1 ring-blue-500/40'
                        : 'bg-slate-950/40 border-slate-850 hover:bg-slate-950/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-[10px] text-slate-400 font-bold">
                        {app.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${scoreBadge}`}>
                        Risk: {score}/100
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-100 text-xs line-clamp-1 mb-1">
                      {app.institution_name}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate">{app.district}, {app.state}</span>
                      <span className={`font-semibold ${
                        app.status === 'ACCEPTED' ? 'text-emerald-400' :
                        app.status === 'REJECTED' ? 'text-red-400' :
                        'text-amber-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Case Scrutiny Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {loading || !currentApp ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs">Loading case scrutiny dossier...</p>
            </div>
          ) : (
            <>
              {/* Dossier Header Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded">
                        {currentApp.id}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {currentApp.category_name}
                      </span>
                    </div>
                    <h1 className="text-lg font-black text-white mt-1">
                      {currentApp.institution_name}
                    </h1>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsAuditModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t.officer.btnAuditTrail}</span>
                    </button>
                    <a
                      href={api.getAuditPdfUrl(currentApp.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Dossier</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trust / Society</span>
                    <strong className="text-slate-200 truncate block">{currentApp.trust_name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Land Area</span>
                    <strong className="text-slate-200">{currentApp.land_area_acres} Acres</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Campus Location</span>
                    <strong className="text-slate-200">{currentApp.district}, {currentApp.state}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Status</span>
                    <strong className={`font-bold ${
                      currentApp.status === 'ACCEPTED' ? 'text-emerald-400' :
                      currentApp.status === 'REJECTED' ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {currentApp.status}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 6-Step Pipeline Tracker */}
              <PipelineTracker
                currentStep={currentApp.pipeline_step || 6}
                flagsCount={currentApp.flags?.length || 0}
                criticalCount={currentApp.flags?.filter(f => f.severity === 'CRITICAL').length || 0}
              />

              {/* Transparent Risk Score Card (0-100) */}
              <RiskScoreCard
                score={currentApp.risk_score}
                riskBand={currentApp.risk_band}
                breakdown={currentApp.risk_breakdown || []}
              />

              {/* Side-by-Side Document Forensics Viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>{t.officer.docViewerTitle}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Click any document or flag to cross-examine evidence
                  </span>
                </div>

                <DocumentViewer
                  documents={currentApp.documents || []}
                  activeDocId={selectedDocId}
                  onSelectDoc={(id) => setSelectedDocId(id)}
                  activeFlag={activeFlag}
                  detectedRooms={currentApp.infrastructure_check?.floorplan_analysis?.detected_rooms}
                />
              </div>

              {/* Explainable Flags Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span>{t.officer.findingsTitle}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Every flag carries plain-language explanation, exact evidence location, and regulatory clause.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded">
                    {currentApp.flags?.length || 0} Flags
                  </span>
                </div>

                {(!currentApp.flags || currentApp.flags.length === 0) ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-xs text-emerald-400 flex flex-col items-center justify-center space-y-1">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <span className="font-bold">No Compliance Anomalies Detected</span>
                    <span className="text-slate-400">Application adheres to all AICTE Approval Process Handbook norms.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentApp.flags.map((flag) => (
                      <ExplainableFlagCard
                        key={flag.id}
                        flag={flag}
                        applicationId={currentApp.id}
                        isActive={activeFlag?.id === flag.id}
                        onFocusEvidence={() => {
                          setActiveFlag(flag);
                          if (flag.evidence?.source_doc_id) {
                            setSelectedDocId(flag.evidence.source_doc_id);
                          }
                        }}
                        onFeedbackUpdated={() => loadAppDetail(currentApp.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Government Issuing Authority Verification Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-blue-400" />
                    <span>{t.officer.issuerTitle}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Direct State Gateway Verification
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                        <th className="py-2 px-2">{t.officer.authority}</th>
                        <th className="py-2 px-2">{t.officer.identifier}</th>
                        <th className="py-2 px-2">{t.officer.result}</th>
                        <th className="py-2 px-2">{t.officer.cryptoSig}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {currentApp.verification_results?.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-950/40">
                          <td className="py-2.5 px-2 font-medium text-slate-200">
                            {v.authority_name}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-[11px] text-slate-300">
                            {v.identifier_checked}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              v.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                              v.status === 'MISMATCH' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                              'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-[11px] text-slate-400">
                            {v.qr_verified ? (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Valid RSA/SHA-256
                              </span>
                            ) : (
                              <span className="text-amber-400">Manual Paper Record</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scrutiny Officer Statutory Decision Form */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-blue-900/40 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>{t.officer.decisionTitle}</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      The AI system provides decision support. The final legal decision remains exclusively with you.
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                    Scrutiny Officer: Dr. S. K. Sharma
                  </span>
                </div>

                <form onSubmit={handleDecisionSubmit} className="space-y-4">
                  {/* Action Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDecision('ACCEPTED')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                        decision === 'ACCEPTED'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50'
                          : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{t.officer.btnAccept}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('REJECTED')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                        decision === 'REJECTED'
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                          : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-red-300" />
                      <span>{t.officer.btnReject}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('CLARIFICATION_REQUESTED')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                        decision === 'CLARIFICATION_REQUESTED'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/50'
                          : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 text-amber-300" />
                      <span>{t.officer.btnClarify}</span>
                    </button>
                  </div>

                  {/* Mandatory Remarks */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      {t.officer.mandatoryRemarks}
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={t.officer.remarksPlaceholder}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Decisions are cryptographically hash-chained and cannot be repudiated.
                    </span>
                    <button
                      type="submit"
                      disabled={submittingDecision}
                      className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingDecision ? 'Sealing Decision...' : 'Commit Statutory Decision'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
