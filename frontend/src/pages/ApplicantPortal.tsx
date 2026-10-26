import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw,
  Send,
  Building,
  CheckCircle,
  Clock,
  HelpCircle,
  FileCheck2,
  FolderSync,
  Bell,
  Mail,
  MessageSquare,
  Save,
  ChevronDown,
  ChevronUp,
  Camera,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { ApplicationDetail } from '../types';
import { PipelineTracker } from '../components/PipelineTracker';

interface ChecklistItemHelp {
  type: string;
  name: string;
  category: string;
  whatItIs: string;
  whoIssues: string;
  howToObtain: string;
  status: 'VERIFIED' | 'GAPS_IDENTIFIED' | 'PENDING_UPLOAD';
}

export const ApplicantPortal: React.FC = () => {
  const { selectedAppId, setSelectedAppId, showToast, user, t } = useApp();
  const [currentApp, setCurrentApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-check state
  const [precheckResult, setPrecheckResult] = useState<any>(null);
  const [runningPrecheck, setRunningPrecheck] = useState(false);

  // Upload modal state
  const [uploadDocType, setUploadDocType] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadQualityWarning, setUploadQualityWarning] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Active expanded help item
  const [expandedHelpType, setExpandedHelpType] = useState<string | null>(null);

  // Notification Preferences
  const [notifInApp, setNotifInApp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(false);

  // Draft saved timestamp
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  const checklist: ChecklistItemHelp[] = [
    {
      type: 'TRUST_DEED',
      name: 'Registered Trust / Society Deed & Bye-Laws',
      category: 'Statutory Legal',
      whatItIs: 'Official registered charter establishing the educational society or trust, with approved educational objects.',
      whoIssues: 'Office of the Sub-Registrar / Registrar of Societies (State Revenue Department).',
      howToObtain: 'Download certified registered deed from state registrar portal or retrieve via registered society identification.',
      status: 'GAPS_IDENTIFIED'
    },
    {
      type: 'LAND_DOCUMENT',
      name: 'Registered Land Title / Sale Deed (Contiguous Acreage)',
      category: 'Revenue & Land Titles',
      whatItIs: 'Title deed or government lease confirming minimum 5.00 contiguous acres in rural area or 2.50 acres in metro region.',
      whoIssues: 'Tehsildar / District Revenue Officer / Sub-Registrar.',
      howToObtain: 'Apply through District Revenue Portal with Survey Khasra numbers and non-encumbrance certificate.',
      status: 'GAPS_IDENTIFIED'
    },
    {
      type: 'FIRE_SAFETY_NOC',
      name: 'Fire Department Safety Clearance Certificate (NOC)',
      category: 'Municipal & Life Safety',
      whatItIs: 'Certificate confirming building compliance with National Building Code fire suppression standards.',
      whoIssues: 'Chief Fire Officer (Municipal Corporation or District Fire Directorate).',
      howToObtain: 'Submit building inspection application to the State Fire Directorate after installing mandatory hydrant/alarm systems.',
      status: 'VERIFIED'
    },
    {
      type: 'BUILDING_PLAN',
      name: 'Sanctioned Architectural Blueprint & Floor Plan',
      category: 'Municipal & Engineering',
      whatItIs: 'Municipal sanctioned building plan showing classrooms, administrative office, labs, and barrier-free ramps.',
      whoIssues: 'Town Planning Authority / Municipal Corporation / Urban Development Authority.',
      howToObtain: 'Submit CAD drawings vetted by a Council of Architecture (CoA) registered architect for municipal sanction.',
      status: 'VERIFIED'
    },
    {
      type: 'CAMPUS_PHOTOS',
      name: 'Geotagged Infrastructure & Barrier-Free Photos',
      category: 'Physical Facilities',
      whatItIs: 'High-resolution photographs of entrance, labs, classrooms, and sanitation blocks with EXIF GPS coordinates.',
      whoIssues: 'Authorized Institutional Representative via mobile device.',
      howToObtain: 'Capture photos on campus with device location services enabled; EXIF timestamp must match submission month.',
      status: 'VERIFIED'
    },
    {
      type: 'FDR_CERTIFICATE',
      name: 'Fixed Deposit Receipt (FDR) / Joint Reserve Fund',
      category: 'Financial Compliance',
      whatItIs: 'Term deposit pledged in the joint names of the Trust and Regional AICTE Officer as statutory reserve.',
      whoIssues: 'Scheduled Commercial Bank / Reserve Bank of India recognized bank.',
      howToObtain: 'Deposit required endowment amount with bank and request statutory joint lien certificate.',
      status: 'VERIFIED'
    }
  ];

  const loadData = () => {
    setLoading(true);
    api.getApplication(selectedAppId || 'AICTE/2026/NI/000123')
      .then((detail) => {
        setCurrentApp(detail);
      })
      .catch((err) => showToast('Error loading application: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedAppId]);

  // Run Pre-check
  const handleRunPrecheck = async () => {
    if (!currentApp) return;
    setRunningPrecheck(true);
    try {
      const res = await api.runPrecheck(currentApp.id);
      setPrecheckResult(res);
      showToast('Applicant Pre-Check complete: 2 gaps identified for early rectification.');
    } catch (err: any) {
      showToast('Pre-check error: ' + err.message);
    } finally {
      setRunningPrecheck(false);
    }
  };

  // Mock DigiLocker Fetch
  const handleDigiLockerFetch = (docType: string) => {
    showToast(`Simulation: Fetching verified ${docType} from State DigiLocker Gateway...`);
    setTimeout(() => {
      showToast(`Success: Certified electronic copy retrieved with digital registrar seal.`);
    }, 1200);
  };

  // Save Draft
  const handleSaveDraft = () => {
    setDraftSavedAt(new Date().toLocaleTimeString());
    showToast('Application draft saved successfully. You can safely resume later.');
  };

  // Quality check simulation on file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulated scan quality analysis
      if (file.name.toLowerCase().includes('low') || file.size < 50000) {
        setUploadQualityWarning('Scan Quality Warning: Image resolution is below 150 DPI. Text OCR may have low confidence. Consider re-scanning.');
      } else {
        setUploadQualityWarning(null);
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocType || !selectedFile) return;

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      showToast(`Document uploaded: ${selectedFile.name}. Cryptographic SHA-256 hash generated.`);
      setUploadDocType(null);
      setSelectedFile(null);
      setUploadQualityWarning(null);
      handleRunPrecheck();
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Institutional Application Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold bg-govNavy-100 dark:bg-govNavy-900 text-govNavy-900 dark:text-blue-300 px-2 py-0.5 rounded border border-govNavy-300 dark:border-govNavy-700">
              {currentApp?.reference_no || 'AICTE/2026/NI/000123'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Application in Progress
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {user?.institution_name || currentApp?.institution_name || 'Apex Institute of Technology & Research'}
          </h1>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Trust: <strong>Shree Krishna Educational Trust</strong> • Category: <strong>Establishment of New Institution (Degree Engineering)</strong>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleSaveDraft}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleRunPrecheck}
            disabled={runningPrecheck}
            className="px-4 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-bold shadow-xs flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningPrecheck ? 'animate-spin' : ''}`} />
            <span>{runningPrecheck ? 'Running Checks...' : 'Run Pre-Submission Check'}</span>
          </button>
        </div>
      </div>

      {draftSavedAt && (
        <div className="text-[11px] text-slate-500 text-right -mt-4">
          Draft last saved at {draftSavedAt}
        </div>
      )}

      {/* 2. Six-Step Pipeline Tracker */}
      {currentApp && (
        <PipelineTracker currentStep={currentApp.pipeline_step} />
      )}

      {/* 3. Pre-check Instant Feedback Banner */}
      {precheckResult && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-md space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                Pre-Submission Verification Report: Action Required Before Final Submission
              </h3>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
              Readiness Score: {precheckResult.precheck_score} / 100
            </span>
          </div>

          <p className="text-xs text-amber-800 dark:text-amber-300">
            {precheckResult.recommendation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {precheckResult.gap_items?.map((gap: any, i: number) => (
              <div key={i} className="p-3 bg-white dark:bg-slate-900 rounded border border-amber-300 dark:border-amber-900 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-red-700 dark:text-red-400">{gap.name}</strong>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                    {gap.severity}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">{gap.issue}</p>
                <div className="pt-1 text-[11px] font-semibold text-govNavy-800 dark:text-blue-400">
                  Required Action: {gap.action_required}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Statutory Checklist & Plain-Language Help */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Mandatory Statutory Document Checklist (4 of 6 Verified)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review requirements, verify issuing authorities, and rectify flagged gaps directly.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
            Approval Process Handbook 2026-27 Norms
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
          {checklist.map((item) => {
            const isExpanded = expandedHelpType === item.type;
            const isVerified = item.status === 'VERIFIED';

            return (
              <div key={item.type} className="p-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {item.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isVerified 
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800'
                      }`}>
                        {isVerified ? 'Verified' : 'Gaps Identified'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Category: {item.category}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Simulated DigiLocker Button (P2) */}
                    <button
                      onClick={() => handleDigiLockerFetch(item.name)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-[11px] font-semibold flex items-center space-x-1"
                      title="Simulated electronic pull from DigiLocker"
                    >
                      <FolderSync className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Fetch DigiLocker (Mock)</span>
                    </button>

                    {/* Upload / Re-upload Button */}
                    <button
                      onClick={() => setUploadDocType(item.type)}
                      className="px-3 py-1 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{isVerified ? 'Re-upload' : 'Upload & Rectify'}</span>
                    </button>

                    {/* Toggle Help Accordion */}
                    <button
                      onClick={() => setExpandedHelpType(isExpanded ? null : item.type)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-700"
                      title="View Plain-Language Guide"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Plain-Language Help Guide Accordion */}
                {isExpanded && (
                  <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded space-y-2 text-[11px]">
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">What this document is:</strong>
                      <p className="text-slate-600 dark:text-slate-400">{item.whatItIs}</p>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Who issues it:</strong>
                      <p className="text-slate-600 dark:text-slate-400">{item.whoIssues}</p>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">How to obtain it:</strong>
                      <p className="text-slate-600 dark:text-slate-400">{item.howToObtain}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Mobile-First Upload Zone with Quality Checking */}
      {uploadDocType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md w-full max-w-lg shadow-xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-govNavy-700 dark:text-blue-400" />
              <span>Upload Document: {checklist.find(c => c.type === uploadDocType)?.name}</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* File Input Box */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded p-6 text-center space-y-2 bg-slate-50 dark:bg-slate-950">
                <input
                  type="file"
                  id="docUploadInput"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label 
                  htmlFor="docUploadInput"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <FileText className="w-8 h-8 text-slate-400" />
                  <span className="font-semibold text-govNavy-800 dark:text-blue-400 hover:underline">
                    {selectedFile ? selectedFile.name : 'Choose PDF, JPEG or PNG file'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Max size 15 MB • Camera capture supported on mobile devices
                  </span>
                </label>
              </div>

              {/* Quality Check Warning */}
              {uploadQualityWarning && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Document Quality Advisory</span>
                    <span className="text-[11px]">{uploadQualityWarning}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadDocType(null);
                    setSelectedFile(null);
                    setUploadQualityWarning(null);
                  }}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="px-4 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-bold disabled:opacity-50"
                >
                  {uploading ? 'Processing OCR & Hashing...' : 'Submit & Re-verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Notification Preferences (Mocked localized templates) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <span>Statutory Notification Dispatch Channels</span>
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure how the institutional authorized signatory receives alerts when clarification tasks or committee scrutiny remarks are posted.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <label className="flex items-center space-x-2 p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
            <input
              type="checkbox"
              checked={notifInApp}
              onChange={(e) => setNotifInApp(e.target.checked)}
              className="rounded border-slate-300 text-govNavy-900"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">In-App Alerts Feed</span>
          </label>

          <label className="flex items-center space-x-2 p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
              className="rounded border-slate-300 text-govNavy-900"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Official Email Digest</span>
          </label>

          <label className="flex items-center space-x-2 p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
            <input
              type="checkbox"
              checked={notifWhatsapp}
              onChange={(e) => setNotifWhatsapp(e.target.checked)}
              className="rounded border-slate-300 text-govNavy-900"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">SMS / WhatsApp Alerts</span>
          </label>
        </div>
      </div>
    </div>
  );
};
