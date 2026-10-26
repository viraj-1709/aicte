import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  FileCheck2,
  Eye,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';

export const TamperDemoModal: React.FC = () => {
  const { 
    isTamperDemoOpen, 
    setIsTamperDemoOpen, 
    setSelectedAppId, 
    setRole, 
    showToast,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'COMPARISON' | 'ELA_INSPECTOR'>('COMPARISON');
  const [resetting, setResetting] = useState(false);

  if (!isTamperDemoOpen) return null;

  const loadDossier = (appId: string, label: string) => {
    setSelectedAppId(appId);
    setRole('OFFICER');
    setIsTamperDemoOpen(false);
    showToast(`Loaded ${label} into Officer Scrutiny Workspace.`);
  };

  const handleResetDemoData = async () => {
    setResetting(true);
    await api.resetDemoData();
    setTimeout(() => {
      setResetting(false);
      showToast('All demo datasets, simulated applications, and audit logs reset to baseline.');
    }, 400);
  };

  const anomalyMatrix = [
    {
      feature: 'Digital Date Alteration',
      method: 'Exif Metadata Inconsistency & Typography Bounding Box',
      clean: 'Creation date matches registrar notary seal (14-Jan-2025).',
      tampered: 'Digital PDF modification date is 4 months after statutory notary seal.',
      status: 'DETECTED',
      risk: '+20 pts'
    },
    {
      feature: 'Name Transliteration Mismatch',
      method: 'Cross-document Fuzzy Levenshtein across Latin & Devanagari',
      clean: 'Shree Krishna Educational Trust consistent across all 6 deeds.',
      tampered: 'Trust name on land deed altered to "Shri Krishna Memorial Trust".',
      status: 'DETECTED',
      risk: '+25 pts'
    },
    {
      feature: 'Exact Document Duplicate (SHA-256)',
      method: 'SHA-256 Collision Filter across National Application Repository',
      clean: 'Unique fire safety certificate hash not found in any other case.',
      tampered: 'Identical SHA-256 certificate submitted by application AICTE/2026/NI/000482 in Maharashtra.',
      status: 'DETECTED',
      risk: '+20 pts'
    },
    {
      feature: 'Re-saved / Cropped Duplicate (pHash)',
      method: 'Perceptual Hash (dHash / pHash) Hamming Distance Analysis',
      clean: 'Perceptual hash unique (< 35% similarity with existing catalog).',
      tampered: '94.2% perceptual similarity with re-scanned floor plan blueprint from Punjab institute.',
      status: 'DETECTED',
      risk: '+15 pts'
    },
    {
      feature: 'Error Level Analysis (ELA)',
      method: 'JPEG Compression Artifact Difference Map (CV module)',
      clean: 'Uniform compression noise across entire document canvas.',
      tampered: 'High compression error gradient around registered land area digits (3.80 vs 5.00 acres).',
      status: 'DETECTED',
      risk: '+20 pts'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={() => setIsTamperDemoOpen(false)}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md w-full max-w-4xl shadow-xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tamper Forensics & Duplicate Detection Demonstration
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Live Verification
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated detection of digital alterations, SHA-256 duplicate reuse, and perceptual-hash cropped scans
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetDemoData}
              disabled={resetting}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-1.5"
              title="Restores all initial simulated records"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
            </button>
            <button
              onClick={() => setIsTamperDemoOpen(false)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-5 py-2.5 border-b-2 transition-colors ${
              activeTab === 'COMPARISON'
                ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Clean vs Tampered Twin Comparison
          </button>
          <button
            onClick={() => setActiveTab('ELA_INSPECTOR')}
            className={`px-5 py-2.5 border-b-2 transition-colors ${
              activeTab === 'ELA_INSPECTOR'
                ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Error Level Analysis (ELA) Heatmap
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto text-xs">
          {activeTab === 'COMPARISON' ? (
            <>
              {/* Twin Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Clean Baseline Box */}
                <div className="border border-emerald-300 dark:border-emerald-800/60 rounded bg-emerald-50/40 dark:bg-emerald-950/20 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase text-[11px]">
                        <ShieldCheck className="w-4 h-4" />
                        Baseline Application (Clean)
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Risk Score: 0 / 100
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Apex Institute of Technology & Research (Reference)
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      All 8 statutory documents verified, contiguous 5.25 acres confirmed via state land records, fire safety NOC active, zero duplicate hash matches across repository.
                    </p>
                  </div>

                  <button
                    onClick={() => loadDossier('AICTE/2026/NI/000124', 'Clean Baseline Dossier')}
                    className="mt-4 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Load Clean Dossier in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tampered Twin Box */}
                <div className="border border-red-300 dark:border-red-800/60 rounded bg-red-50/40 dark:bg-red-950/20 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5 uppercase text-[11px]">
                        <AlertTriangle className="w-4 h-4" />
                        Tampered Twin (Injected Flaws)
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                        Risk Score: 85 / 100
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Apex Institute of Technology & Research (Showcase Case)
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      5 distinct automated flags triggered: digital alteration detected by ELA, 3.80 acres shortfall vs 5.00 acres rule, expired trust deed, SHA-256 duplicate certificate collision.
                    </p>
                  </div>

                  <button
                    onClick={() => loadDossier('AICTE/2026/NI/000123', 'Tampered Twin Dossier')}
                    className="mt-4 w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Load Showcase Case in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Anomaly Forensics Detection Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Forensic Verification Matrix (5 of 5 Caught in Real Time)
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                    100% Tamper Recall Rate
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded divide-y divide-slate-200 dark:divide-slate-800">
                  {anomalyMatrix.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.feature}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{item.method}]
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900">
                            {item.risk}
                          </span>
                          <span className="font-bold text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                          <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">Clean Baseline:</strong>
                          {item.clean}
                        </div>
                        <div className="p-2 rounded bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200">
                          <strong className="text-red-700 dark:text-red-400 block mb-0.5">Showcase Finding:</strong>
                          {item.tampered}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ELA Inspector View */
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
                <strong>Error Level Analysis (ELA):</strong> Highlights intentional pixel modifications by re-saving the document at a known 95% JPEG compression rate and measuring the difference map. Authentic scans show uniform error levels across the canvas; modified sections (such as pasted numbers or stamps) produce high-intensity error spikes.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900 text-center space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                    Original Submitted Revenue Deed (Document OCR Page 1)
                  </span>
                  <div className="w-full h-48 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded flex flex-col items-center justify-center p-4 font-mono text-[11px] text-slate-500">
                    <FileCheck2 className="w-8 h-8 text-slate-400 mb-2" />
                    <span>Survey No. 421/B • Khasra 89</span>
                    <span>Total Registered Area: <strong>3.80 ACRES</strong></span>
                    <span className="text-[10px] text-slate-400 mt-1">Registrar Seal Date: 12-OCT-2023</span>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded p-3 bg-white dark:bg-slate-900 text-center space-y-2">
                  <div className="flex items-center justify-center space-x-1.5">
                    <span className="font-bold text-red-600 dark:text-red-400 block text-xs">
                      ELA Compression Heatmap Difference Map
                    </span>
                  </div>
                  <div className="w-full h-48 bg-slate-950 border border-red-500/50 rounded flex flex-col items-center justify-center p-4 font-mono text-[11px] text-red-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial from-red-600/20 via-transparent to-transparent opacity-80" />
                    <span className="relative z-10 font-bold text-amber-300">High Noise Density Detected (Pixel Deviation +48.2%)</span>
                    <span className="relative z-10 text-xs text-white mt-1 border border-red-500 px-2 py-0.5 rounded bg-red-950">
                      Bounding Box [X:142, Y:388, W:94, H:28]
                    </span>
                    <span className="relative z-10 text-[10px] text-slate-400 mt-2">Area numerical field was digitally modified</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Automated Forensic Pipeline: Error Level Analysis, SHA-256 Collision, and Perceptual dHash
          </span>
          <button
            onClick={() => setIsTamperDemoOpen(false)}
            className="px-4 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-semibold"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
