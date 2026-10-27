import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
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
  Clock,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Network,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { ApplicationDetail, ApplicationSummary, FlagItem, DocumentItem } from '../types';
import { PipelineTracker } from '../components/PipelineTracker';
import { RiskScoreCard } from '../components/RiskScoreCard';
import { DocumentViewer } from '../components/DocumentViewer';
import { ExplainableFlagCard } from '../components/ExplainableFlagCard';

export const OfficerWorkspace: React.FC = () => {
  const { 
    selectedAppId, 
    setSelectedAppId, 
    setIsAuditModalOpen, 
    setIsLinkGraphOpen,
    setReasonForAccessAppId,
    showToast, 
    user,
    t 
  } = useApp();

  // Queue state (500+ bulk applications with pagination)
  const [queueItems, setQueueItems] = useState<ApplicationSummary[]>([]);
  const [totalQueueCount, setTotalQueueCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loadingQueue, setLoadingQueue] = useState<boolean>(false);

  // Filters & Sorting
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRiskBand, setFilterRiskBand] = useState<string>('');
  const [filterSla, setFilterSla] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'risk' | 'sla' | 'date'>('risk');

  // Active Dossier State
  const [currentApp, setCurrentApp] = useState<ApplicationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>();
  const [activeFlag, setActiveFlag] = useState<FlagItem | null>(null);
  const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'TIMELINE' | 'WHAT_IF'>('EVIDENCE');

  // Statutory Decision Form
  const [decisionType, setDecisionType] = useState<'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED'>('ACCEPTED');
  const [decisionRemarks, setDecisionRemarks] = useState<string>('');
  const [submittingDecision, setSubmittingDecision] = useState<boolean>(false);

  // Bulk Approval Modal State
  const [showBulkApprovalModal, setShowBulkApprovalModal] = useState<boolean>(false);
  const [bulkApprovalRemarks, setBulkApprovalRemarks] = useState<string>('Standard statutory clearance: Verified zero regulatory flags and verified land titles.');
  const [isBulkApproving, setIsBulkApproving] = useState<boolean>(false);

  // Clarification Modal State
  const [showClarificationModal, setShowClarificationModal] = useState<boolean>(false);
  const [clarificationInstructions, setClarificationInstructions] = useState<string>('');
  const [clarificationDeadlineDays, setClarificationDeadlineDays] = useState<number>(7);

  const remarksInputRef = useRef<HTMLTextAreaElement>(null);
  const bulkRemarksInputRef = useRef<HTMLTextAreaElement>(null);

  // 1. Fetch bulk applications queue
  const fetchQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const res = await api.getApplications({
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        risk_band: filterRiskBand || undefined,
        sla: filterSla || undefined,
        state: filterState || undefined,
        search: searchQuery || undefined,
        sortBy,
        page: currentPage,
        limit: pageSize
      });
      setQueueItems(res.items);
      setTotalQueueCount(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      showToast('Error fetching review queue: ' + err.message);
    } finally {
      setLoadingQueue(false);
    }
  }, [filterCategory, filterStatus, filterRiskBand, filterSla, filterState, searchQuery, sortBy, currentPage, pageSize, showToast]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // 2. Fetch active dossier details
  const fetchDetail = useCallback(async (appId: string) => {
    if (!appId) return;
    setLoadingDetail(true);
    try {
      const data = await api.getApplication(appId);
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
        setDecisionType(data.officer_decision.decision as any);
        setDecisionRemarks(data.officer_decision.remarks || '');
      } else {
        setDecisionRemarks('');
      }
    } catch (err: any) {
      showToast('Error loading application dossier: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedAppId) {
      fetchDetail(selectedAppId);
    }
  }, [selectedAppId, fetchDetail]);

  // Handle selecting an application with Reason For Access check
  const handleSelectCase = (app: ApplicationSummary) => {
    if (app.risk_band === 'HIGH') {
      const alreadyJustified = sessionStorage.getItem(`justified_${app.id}`);
      if (!alreadyJustified) {
        setReasonForAccessAppId(app.id);
      }
    }
    setSelectedAppId(app.id);
  };

  // 3. What-If Simulator Toggle
  const handleToggleWhatIf = async (flagId: string) => {
    if (!currentApp) return;
    const updated = await api.toggleWhatIfFlag(currentApp.id, flagId);
    setCurrentApp(updated);
    showToast('What-If simulation recalculation updated.');
  };

  const handleResetWhatIf = async () => {
    if (!currentApp) return;
    const updated = await api.resetWhatIfSimulation(currentApp.id);
    setCurrentApp(updated);
    showToast('What-If simulation reset to original baseline.');
  };

  // 4. Submit Officer Decision
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp) return;
    if (!decisionRemarks.trim()) {
      showToast('Mandatory: Please enter written officer remarks before recording decision.');
      remarksInputRef.current?.focus();
      return;
    }

    setSubmittingDecision(true);
    try {
      await api.recordOfficerDecision(
        currentApp.id,
        decisionType,
        decisionRemarks,
        user?.name || 'Dr. S. K. Sharma (Regional Scrutiny Officer)'
      );
      showToast(`Statutory decision (${decisionType}) recorded and sealed in audit ledger.`);
      await fetchDetail(currentApp.id);
      await fetchQueue();
    } catch (err: any) {
      showToast('Error recording decision: ' + err.message);
    } finally {
      setSubmittingDecision(false);
    }
  };

  // 5. Bulk Approval Handler
  const handleConfirmBulkApproval = async () => {
    if (!bulkApprovalRemarks.trim()) {
      showToast('Mandatory remarks required for statutory bulk approval.');
      bulkRemarksInputRef.current?.focus();
      return;
    }

    setIsBulkApproving(true);
    try {
      const res = await api.bulkApproveZeroFlagCases(
        user?.name || 'Dr. S. K. Sharma',
        bulkApprovalRemarks
      );
      setShowBulkApprovalModal(false);
      showToast(`Bulk Approval complete: ${res.approved_count} zero-flag applications cleared.`);
      await fetchQueue();
    } catch (err: any) {
      showToast('Bulk approval error: ' + err.message);
    } finally {
      setIsBulkApproving(false);
    }
  };

  // 6. Clarification Loop Handler
  const handleClarificationSubmit = async () => {
    if (!currentApp || !clarificationInstructions.trim()) {
      showToast('Please specify clarification instructions for applicant.');
      return;
    }

    try {
      await api.recordOfficerDecision(
        currentApp.id,
        'CLARIFICATION_REQUESTED',
        `Clarification Requested (Deadline: ${clarificationDeadlineDays} days): ${clarificationInstructions}`,
        user?.name || 'Dr. S. K. Sharma'
      );
      setShowClarificationModal(false);
      setClarificationInstructions('');
      showToast('Clarification task created for applicant with statutory deadline.');
      await fetchDetail(currentApp.id);
      await fetchQueue();
    } catch (err: any) {
      showToast('Error requesting clarification: ' + err.message);
    }
  };

  

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Review Queue Section (Bulk 500+ Cases Dashboard) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md shadow-xs overflow-hidden">
        {/* Queue Header & Filters Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {t.officer.queueTitle}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {totalQueueCount} Simulated Cases
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory queue with SLA deadline tracking, risk-based prioritization, and multi-factor filtering
              </p>
            </div>

            {/* Bulk Approval Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkApprovalModal(true)}
                className="px-3 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                title="Bulk Approve all zero-flag, low-risk applications"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bulk Approve Zero-Flag Cases</span>
              </button>
            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            {/* Search */}
            <div className="col-span-2 sm:col-span-1 relative">
              <input
                type="text"
                placeholder="Search ref, institute..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-govNavy-900"
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="NEW_INSTITUTION">New Institution</option>
                <option value="EXTENSION_OF_APPROVAL">Extension of Approval</option>
                <option value="CLOSURE">Closure</option>
              </select>
            </div>

            {/* Risk Band */}
            <div>
              <select
                value={filterRiskBand}
                onChange={(e) => { setFilterRiskBand(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="">All Risk Bands</option>
                <option value="HIGH">High Risk (60-100)</option>
                <option value="MEDIUM">Medium Risk (30-59)</option>
                <option value="LOW">Low Risk (0-29)</option>
              </select>
            </div>

            {/* SLA Urgency */}
            <div>
              <select
                value={filterSla}
                onChange={(e) => { setFilterSla(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="">All SLA Deadlines</option>
                <option value="CRITICAL">Critical (&le; 3 Days)</option>
                <option value="WARNING">Warning (4-7 Days)</option>
                <option value="NORMAL">Normal (&gt; 7 Days)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="risk">Sort by Risk Score &darr;</option>
                <option value="sla">Sort by SLA Deadline &uarr;</option>
                <option value="date">Sort by Date &darr;</option>
              </select>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
                setFilterRiskBand('');
                setFilterSla('');
                setFilterState('');
                setSearchQuery('');
                setSortBy('risk');
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Compact Table (Information-First Layout) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Ref Number</th>
                <th className="py-2.5 px-3">Institution / Trust</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3 text-center">Risk Score</th>
                <th className="py-2.5 px-3">SLA Days Remaining</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loadingQueue ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    Loading applications queue...
                  </td>
                </tr>
              ) : queueItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No institutional applications matched current filter criteria.
                  </td>
                </tr>
              ) : (
                queueItems.map((item) => {
                  const isSelected = item.id === selectedAppId;
                  const isCriticalSla = item.sla_urgency === 'URGENT' || item.sla_urgency === 'BREACHED';
                  const isWarningSla = item.sla_days_remaining <= 5;

                  const riskColor = item.risk_band === 'HIGH' 
                    ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                    : item.risk_band === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';

                  const slaBadge = isCriticalSla
                    ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 font-bold'
                    : isWarningSla
                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-semibold'
                    : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => handleSelectCase(item)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 font-medium' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2 px-3 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {item.reference_no}
                      </td>
                      <td className="py-2 px-3 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.institution_name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.trust_name}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                        {item.category.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                        {item.district}, {item.state}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${riskColor}`}>
                          {item.risk_score} / 100
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] border ${slaBadge}`}>
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{item.sla_days_remaining}d remaining</span>
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCase(item);
                          }}
                          className="px-2 py-1 rounded bg-govNavy-900 hover:bg-govNavy-800 text-white text-[11px] font-semibold shadow-xs"
                        >
                          Scrutinize
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalQueueCount} total records)
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-bold px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Application Dossier Scrutiny Workspace */}
      {currentApp ? (
        <div className="space-y-6">
          {/* Institutional Dossier Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="font-mono text-xs font-bold bg-govNavy-100 dark:bg-govNavy-900 text-govNavy-900 dark:text-blue-300 px-2 py-0.5 rounded border border-govNavy-300 dark:border-govNavy-700">
                  {currentApp.reference_no}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  {currentApp.category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentApp.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {currentApp.institution_name}
              </h1>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-3 flex-wrap">
                <span>Trust: <strong>{currentApp.trust_name}</strong></span>
                <span>•</span>
                <span>Location: {currentApp.address}, {currentApp.district}, {currentApp.state}</span>
                <span>•</span>
                <span>Created: {currentApp.created_at?.slice(0, 10)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsLinkGraphOpen(true)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-1.5"
              >
                <Network className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Cross-App Link Graph</span>
              </button>

              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-3 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-govSaffron-500" />
                <span>Verify Ledger</span>
              </button>
            </div>
          </div>

          {/* 6-Step Pipeline Tracker */}
          <PipelineTracker currentStep={currentApp.pipeline_step} />

          {/* Transparent Risk Score Card (0-100) */}
          <RiskScoreCard 
            score={currentApp.risk_score} 
            riskBand={currentApp.risk_band} 
            breakdown={currentApp.risk_breakdown || []} 
          />

          {/* Navigation Subtabs: Evidence / What-If Simulator / Timeline */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-md px-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('EVIDENCE')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'EVIDENCE'
                  ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Document Evidence & Flags ({currentApp.flags?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('WHAT_IF')}
              className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeTab === 'WHAT_IF'
                  ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>What-If Risk Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'TIMELINE'
                  ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Case Timeline & Ledger
            </button>
          </div>

          {/* TAB 1: EVIDENCE (Side-by-side Document Viewer + Explainable Flags) */}
          {activeTab === 'EVIDENCE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Side-by-Side Document Viewer */}
              <div className="lg:col-span-7">
                <DocumentViewer
                  documents={currentApp.documents || []}
                  activeDocId={selectedDocId}
                  onSelectDoc={(id) => setSelectedDocId(id)}
                  activeFlag={activeFlag}
                  detectedRooms={currentApp.infrastructure_check?.detected_rooms || []}
                />
              </div>

              {/* Right Column: Explainable Flag Cards & Decision Desk */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Explainable Regulatory Flags ({currentApp.flags?.length || 0})
                  </h3>
                </div>

                {currentApp.flags && currentApp.flags.length > 0 ? (
                  <div className="space-y-3">
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
                        onFeedbackUpdated={() => fetchDetail(currentApp.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300">
                    No automated flags raised for this institutional application.
                  </div>
                )}

                {/* Statutory Decision Action Desk */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-4 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Statutory Officer Decision Desk
                  </h4>

                  <form onSubmit={handleDecisionSubmit} className="space-y-3">
                    {/* Decision Selector */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDecisionType('ACCEPTED')}
                        className={`py-2 px-1 rounded text-xs font-bold border transition-colors ${
                          decisionType === 'ACCEPTED'
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Accept (A)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionType('REJECTED')}
                        className={`py-2 px-1 rounded text-xs font-bold border transition-colors ${
                          decisionType === 'REJECTED'
                            ? 'bg-red-700 text-white border-red-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Reject (R)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClarificationModal(true)}
                        className={`py-2 px-1 rounded text-xs font-bold border transition-colors ${
                          decisionType === 'CLARIFICATION_REQUESTED'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Clarify (C)
                      </button>
                    </div>

                    {/* Mandatory Remarks Field */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mandatory Statutory Remarks & Justification *
                      </label>
                      <textarea
                        ref={remarksInputRef}
                        rows={3}
                        value={decisionRemarks}
                        onChange={(e) => setDecisionRemarks(e.target.value)}
                        placeholder="Enter official remarks, statutory handbook clauses, or reason for decision..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-xs focus:outline-none focus:border-govNavy-900"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingDecision}
                      className="w-full py-2 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingDecision ? 'Committing to Ledger...' : 'Commit Statutory Decision'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHAT-IF RISK SIMULATOR */}
          {activeTab === 'WHAT_IF' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      What-If Risk Score Simulator (Exploration Mode)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Toggle individual regulatory flags off to simulate hypothetical clearance scenarios without altering official records.
                  </p>
                </div>

                <button
                  onClick={handleResetWhatIf}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Simulation</span>
                </button>
              </div>

              {/* Live Simulated Score Ring */}
              <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs uppercase font-bold text-slate-500">Live Simulated Score</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                    {currentApp.risk_score} / 100 ({currentApp.risk_band} RISK)
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    * Interactive sandbox only: Does not overwrite statutory committee verdict.
                  </span>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span>Contributing Rules: <strong>{currentApp.risk_breakdown?.filter(b => !b.is_simulated_excluded).length || 0} active</strong></span>
                </div>
              </div>

              {/* Flag Toggle List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Individual Flag Exclusions:
                </h4>
                {currentApp.risk_breakdown?.map((item) => (
                  <div 
                    key={item.flag_id}
                    className={`p-3 rounded border text-xs flex items-center justify-between transition-colors ${
                      item.is_simulated_excluded
                        ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          item.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.severity}
                        </span>
                        <span className={`font-semibold ${item.is_simulated_excluded ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Weight: +{item.points} pts
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleWhatIf(item.flag_id)}
                      className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                        item.is_simulated_excluded
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {item.is_simulated_excluded ? 'Re-enable Flag' : 'Simulate Exclusion (-' + item.points + ' pts)'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CASE TIMELINE & LEDGER */}
          {activeTab === 'TIMELINE' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Case Chronological Timeline & Audit Trail
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end historical record of document uploads, automated OCR extractions, rule validations, clarifications, officer views, and decisions.
              </p>

              <div className="border-l-2 border-slate-300 dark:border-slate-700 ml-4 pl-6 space-y-6 my-4">
                {currentApp.audit_chain?.map((block) => (
                  <div key={block.index} className="relative space-y-1 text-xs">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-govNavy-900 dark:bg-blue-500 border-2 border-white dark:border-slate-900" />
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-500">Block #{block.index}</span>
                      <strong className="text-slate-800 dark:text-slate-200">{block.action}</strong>
                      <span className="text-[11px] text-slate-400">({block.timestamp.slice(0, 19).replace('T', ' ')})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Actor: <strong>{block.actor}</strong>
                    </div>
                    {block.details && (
                      <div className="text-[11px] font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        {JSON.stringify(block.details)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* 3. Bulk Approval Confirmation Modal */}
      {showBulkApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md w-full max-w-lg shadow-xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Statutory Bulk Approval Confirmation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This statutory action will approve all applications in the national queue that possess <strong>zero automated flags</strong> and a <strong>risk score &lt; 30</strong>. An immutable cryptographic audit block will be recorded for every cleared case.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Officer Remark for Bulk Clearance *
              </label>
              <textarea
                ref={bulkRemarksInputRef}
                rows={3}
                value={bulkApprovalRemarks}
                onChange={(e) => setBulkApprovalRemarks(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-xs focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowBulkApprovalModal(false)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                disabled={isBulkApproving}
                onClick={handleConfirmBulkApproval}
                className="px-4 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                {isBulkApproving ? 'Approving...' : 'Confirm Bulk Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Clarification Request Modal */}
      {showClarificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md w-full max-w-lg shadow-xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Request Statutory Clarification from Institution
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Creates a formal rectification task in the Applicant Portal. When the applicant re-uploads documents, the automated validation pipeline will re-evaluate only the affected rules.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rectification Instructions & Missing Evidentiary Items *
              </label>
              <textarea
                rows={3}
                value={clarificationInstructions}
                onChange={(e) => setClarificationInstructions(e.target.value)}
                placeholder="e.g. Upload registered revenue deed confirming contiguity of Survey No. 421/B..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2 text-xs focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Statutory Response Deadline (Days)
              </label>
              <select
                value={clarificationDeadlineDays}
                onChange={(e) => setClarificationDeadlineDays(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value={7}>7 Calendar Days (Standard)</option>
                <option value={14}>14 Calendar Days (Extended)</option>
                <option value={3}>3 Calendar Days (Urgent)</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowClarificationModal(false)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClarificationSubmit}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs"
              >
                Dispatch Clarification Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
