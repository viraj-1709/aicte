import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Send,
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { ApplicationDetail } from '../types';

export const ApplicantPortal: React.FC = () => {
  const { selectedAppId, setSelectedAppId, showToast, t } = useApp();
  const [currentApp, setCurrentApp] = useState<ApplicationDetail | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pre-check state
  const [precheckResult, setPrecheckResult] = useState<any>(null);
  const [runningPrecheck, setRunningPrecheck] = useState(false);

  // Upload modal state
  const [uploadDocType, setUploadDocType] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadData = () => {
    setLoading(true);
    api.getApplications()
      .then(apps => {
        setApplications(apps);
        const target = apps.find((a: any) => a.id === selectedAppId) || apps[0];
        if (target) {
          return api.getApplication(target.id);
        }
      })
      .then(appDetail => {
        if (appDetail) {
          setCurrentApp(appDetail);
        }
      })
      .catch(err => showToast('Error: ' + err.message))
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
      showToast('Applicant Pre-Check executed successfully!');
    } catch (err: any) {
      showToast('Pre-check error: ' + err.message);
    } finally {
      setRunningPrecheck(false);
    }
  };

  // Upload / Rectify document
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp || !uploadDocType || !selectedFile) return;

    setUploading(true);
    try {
      await api.uploadDocument(currentApp.id, uploadDocType, selectedFile);
      showToast(`Document uploaded successfully! Cryptographic hash recalculated.`);
      setUploadDocType(null);
      setSelectedFile(null);
      // Refresh application detail
      const updated = await api.getApplication(currentApp.id);
      setCurrentApp(updated);
      // Re-run pre-check automatically
      const pre = await api.runPrecheck(currentApp.id);
      setPrecheckResult(pre);
    } catch (err: any) {
      showToast('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Mandatory checklist items for New Institution
  const checklistItems = [
    { type: 'TRUST_DEED', name: 'Society / Trust Registration Deed', category: 'Legal Statutory' },
    { type: 'LAND_DOCUMENT', name: 'Land Title / Sale Deed (Contiguous Plot)', category: 'Land Revenue' },
    { type: 'BUILDING_PLAN', name: 'Approved Building Plan (Municipal Sanction)', category: 'Infrastructure' },
    { type: 'FIRE_NOC', name: 'Fire Safety NOC Clearance', category: 'Safety & Life' },
    { type: 'AFFIDAVIT_1', name: 'AICTE Format-1 Affidavit (Stamp Paper)', category: 'Regulatory' },
    { type: 'ARCHITECT_CERT', name: 'Council of Architecture Certificate', category: 'Technical' },
    { type: 'CAMPUS_PHOTO', name: 'Geo-Tagged Front & Quadrangle Photo', category: 'Infrastructure' },
    { type: 'FLOOR_PLAN', name: 'Detailed Floor Plan (Classrooms & Labs)', category: 'Infrastructure' }
  ];

  const docsMap = (currentApp?.documents || []).reduce((acc: any, d: any) => {
    acc[d.doc_type] = d;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Application Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded">
              Applicant Dossier Management
            </span>
            <span className="text-xs text-slate-400">
              Session 2026-2027
            </span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {currentApp?.institution_name || 'Loading Institution...'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.applicant.subheading}
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center space-x-3">
          <select
            value={currentApp?.id || ''}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 max-w-xs"
          >
            {applications.map(a => (
              <option key={a.id} value={a.id}>
                {a.id} - {a.institution_name.slice(0, 30)}...
              </option>
            ))}
          </select>

          {/* STANDOUT ACTION: Applicant Pre-Check Button */}
          <button
            onClick={handleRunPrecheck}
            disabled={runningPrecheck}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-950 transition-all border border-blue-400/30 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{runningPrecheck ? 'Analyzing Dossier...' : t.applicant.btnPrecheck}</span>
          </button>
        </div>
      </div>

      {/* Pre-Check Instant Feedback Banner */}
      {precheckResult && (
        <div className={`p-4 rounded-xl border transition-all ${
          precheckResult.is_ready_for_submission
            ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
            : 'bg-red-950/40 border-red-800/80 text-red-200'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center space-x-2">
              {precheckResult.is_ready_for_submission ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
              )}
              <h3 className="font-black text-sm">
                {precheckResult.is_ready_for_submission
                  ? 'Preliminary Pre-Check Passed: Zero Critical Rejection Risks!'
                  : `Pre-Check Gaps Detected (${precheckResult.critical_deficits?.length || 0} Critical Flags)`}
              </h3>
            </div>

            <span className="text-xs font-mono font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
              Estimated Risk Score: {precheckResult.risk_score_estimate}/100
            </span>
          </div>

          <p className="text-xs opacity-90 mb-3">
            {precheckResult.message}
          </p>

          {/* List of Detected Deficits */}
          {precheckResult.critical_deficits?.length > 0 && (
            <div className="space-y-2 mt-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="font-bold uppercase tracking-wider text-red-300 text-[10px] block mb-1">
                Rectify the following compliance gaps before official scrutiny submission:
              </span>
              {precheckResult.critical_deficits.map((gap: any, i: number) => (
                <div key={i} className="flex items-start justify-between gap-2 p-2 rounded bg-slate-950/60 border border-red-900/40">
                  <div>
                    <strong className="text-red-300 block">{gap.title}</strong>
                    <p className="text-slate-300 text-[11px] mt-0.5">{gap.reason}</p>
                  </div>
                  <button
                    onClick={() => setUploadDocType(gap.evidence?.source_doc_type || 'TRUST_DEED')}
                    className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-2.5 py-1 rounded shadow"
                  >
                    Rectify & Re-Upload
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Document Checklist Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>{t.applicant.checklistProgress}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload clear scanned statutory certificates. The AI platform validates authenticity and dates immediately.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Uploaded: <strong className="text-emerald-400">{Object.keys(docsMap).length}</strong> of {checklistItems.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Document Requirement</th>
                <th className="py-2.5 px-3">Statutory Category</th>
                <th className="py-2.5 px-3">Upload Status</th>
                <th className="py-2.5 px-3">Cryptographic Digest</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {checklistItems.map((item) => {
                const doc = docsMap[item.type];
                const isUploaded = !!doc;
                const isTampered = doc?.tamper_signals?.is_tampered;

                return (
                  <tr key={item.type} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3">
                      <strong className="text-slate-100 block">{item.name}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{item.type}</span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {item.category}
                    </td>

                    <td className="py-3 px-3">
                      {isUploaded ? (
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300 font-semibold">Uploaded</span>
                          {isTampered && (
                            <span className="bg-red-500/20 text-red-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-red-500/40">
                              Anomaly Flagged
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-amber-400">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">Missing (Required)</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {doc ? doc.file_hash.slice(0, 18) + '...' : '—'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setUploadDocType(item.type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isUploaded
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                        }`}
                      >
                        {isUploaded ? 'Replace / Rectify' : 'Upload Document'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadDocType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Upload & Rectify Document</span>
              </h3>
              <button
                onClick={() => setUploadDocType(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Document Type
                </label>
                <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs font-mono text-blue-400">
                  {uploadDocType}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Select File (JPEG, PNG, PDF)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  required
                />
              </div>

              <div className="bg-blue-950/30 border border-blue-900/40 p-3 rounded-lg text-[11px] text-blue-200 space-y-1">
                <p className="font-semibold">Automated Verification on Upload:</p>
                <ul className="list-disc list-inside text-slate-300 text-[10px] space-y-0.5">
                  <li>Calculates SHA-256 fingerprint for anti-duplication</li>
                  <li>Performs Error Level Analysis (ELA) for image tampering</li>
                  <li>Extracts legal entity name, land area, and validity dates</li>
                </ul>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadDocType(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {uploading ? 'Analyzing & Uploading...' : 'Upload & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
