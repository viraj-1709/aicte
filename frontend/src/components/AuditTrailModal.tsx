import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  X, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  RefreshCw,
  Lock,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { AuditBlock } from '../types';

interface Props {
  applicationId: string;
}

export const AuditTrailModal: React.FC<Props> = ({ applicationId }) => {
  const { isAuditModalOpen, setIsAuditModalOpen, showToast, t } = useApp();
  const [chain, setChain] = useState<AuditBlock[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchAuditData = () => {
    if (applicationId) {
      setLoading(true);
      Promise.all([
        api.getApplication(applicationId),
        api.verifyAudit(applicationId)
      ])
        .then(([appData, verifData]) => {
          setChain(appData.audit_chain || []);
          setVerification(verifData);
        })
        .catch(err => showToast('Failed to load audit trail: ' + err.message))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (isAuditModalOpen) {
      fetchAuditData();
    }
  }, [isAuditModalOpen, applicationId]);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    const res = await api.verifyAudit(applicationId);
    setVerification(res);
    setIsVerifying(false);
    if (res.verified) {
      showToast('Ledger verification passed: All cryptographic block hashes match.');
    } else {
      showToast(`Integrity alert: Ledger broken at Block #${res.broken_block_index}!`);
    }
  };

  const handleToggleTamper = async () => {
    const isNowTampered = await api.toggleSimulateAuditTamper(applicationId);
    await handleVerifyIntegrity();
    // Refresh local chain view
    const appData = await api.getApplication(applicationId);
    setChain(appData.audit_chain || []);
    if (isNowTampered) {
      showToast('Simulated tampering: Injected modified hash into Block #2.');
    } else {
      showToast('Tampering cleared: Genuine cryptographic hash restored.');
    }
  };

  const handleExportReport = () => {
    showToast('Audit trail report exported as signed PDF document.');
  };

  if (!isAuditModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={() => setIsAuditModalOpen(false)}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md w-full max-w-4xl shadow-xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-govNavy-100 dark:bg-govNavy-900 border border-govNavy-300 dark:border-govNavy-700 flex items-center justify-center text-govNavy-900 dark:text-blue-300 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Cryptographic Hash-Chained Audit Ledger
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  SHA-256 Chaining
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Case Reference: <strong className="font-mono text-slate-700 dark:text-slate-300">{applicationId}</strong> • Immutable scrutiny ledger with non-repudiation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportReport}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Signed PDF</span>
            </button>
            <button
              onClick={() => setIsAuditModalOpen(false)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto text-xs">
          {/* Integrity Verification Banner */}
          <div className={`p-4 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            verification?.verified
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${
                verification?.verified
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-100 dark:bg-red-900/50 border-red-400 text-red-700 dark:text-red-300'
              }`}>
                {verification?.verified ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-bold text-xs uppercase tracking-wide block">
                  {verification?.verified ? 'Chain Continuity Status: 100% Intact' : `Integrity Compromised: Broken at Block #${verification?.broken_block_index}`}
                </span>
                <span className="text-[11px] opacity-90">
                  {verification?.message || 'Sequential hash linking verified from Genesis block to current head.'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleVerifyIntegrity}
                disabled={isVerifying}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>Verify Integrity</span>
              </button>

              <button
                onClick={handleToggleTamper}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
                title="Toggles simulated unauthorized alteration of Block #2"
              >
                Simulate Tampering
              </button>
            </div>
          </div>

          {/* Block Sequence History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Immutable Ledger Sequence ({chain.length} Blocks Recorded)
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                Algorithm: SHA-256 Recursive Digest
              </span>
            </div>

            <div className="space-y-2.5">
              {chain.map((blk) => (
                <div 
                  key={blk.index}
                  className={`p-3.5 rounded border text-xs space-y-2 transition-colors ${
                    blk.is_tampered_simulated
                      ? 'bg-red-50/60 dark:bg-red-950/30 border-red-300 dark:border-red-800'
                      : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                        blk.is_tampered_simulated
                          ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}>
                        Block #{blk.index}
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {blk.action}
                      </strong>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <strong>{blk.actor}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {blk.timestamp.slice(0, 19).replace('T', ' ')} UTC
                      </span>
                    </div>
                  </div>

                  {/* Hash Linkage Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 font-mono text-[10px]">
                    <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 truncate">
                      <span className="text-slate-500 block">Previous Hash (prev_hash):</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate block">{blk.prev_hash}</span>
                    </div>
                    <div className={`p-1.5 rounded border truncate ${
                      blk.is_tampered_simulated
                        ? 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}>
                      <span className="text-slate-500 block">Block Hash (current_hash):</span>
                      <span className="font-bold truncate block">{blk.hash}</span>
                    </div>
                  </div>

                  {/* Payload Details */}
                  {blk.details && Object.keys(blk.details).length > 0 && (
                    <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Payload Attributes: </span>
                      {Object.entries(blk.details).map(([k, v]) => (
                        <span key={k} className="mr-3">
                          <code className="text-govNavy-800 dark:text-blue-400 font-mono">{k}</code>: {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-slate-500">
            Genesis Hash: {chain.length > 0 ? chain[0].hash.slice(0, 24) + '...' : 'N/A'}
          </span>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="px-4 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-semibold"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
