import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  X, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  Flame, 
  Copy, 
  Compass, 
  FileWarning, 
  ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';

export const TamperDemoModal: React.FC = () => {
  const { 
    isTamperDemoOpen, 
    setIsTamperDemoOpen, 
    setSelectedAppId, 
    setRole, 
    showToast 
  } = useApp();

  const [demoData, setDemoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTamperDemoOpen) {
      setLoading(true);
      api.getTamperDemo()
        .then(data => setDemoData(data))
        .catch(err => showToast('Failed to load tamper demo: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [isTamperDemoOpen]);

  if (!isTamperDemoOpen) return null;

  const loadDossier = (appId: string, label: string) => {
    setSelectedAppId(appId);
    setRole('OFFICER');
    setIsTamperDemoOpen(false);
    showToast(`Loaded ${label} into Officer Scrutiny Workspace!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-amber-950 p-5 border-b border-orange-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/30">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">
                  Tamper Forensics Demonstration Mode
                </h3>
                <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full">
                  1-Click Live Test
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Side-by-side evaluation of Apex Institute (Clean) vs Apex Institute (Tampered Twin)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTamperDemoOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clean Box */}
            <div className="bg-slate-950/60 border border-emerald-800/50 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    Clean Baseline Reference
                  </span>
                  <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                    Risk Score: 0 / 100
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Apex Institute of Engineering & Technology (Clean)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  All 8 statutory documents authentic, valid dates, 5.25 acres verified with state revenue, photo geotag within 42m of campus.
                </p>
              </div>

              <button
                onClick={() => loadDossier('AICTE-2026-APEX-CLEAN', 'Clean Dossier')}
                className="mt-4 flex items-center justify-center space-x-1.5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-md shadow-emerald-950"
              >
                <span>Load Clean Dossier in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tampered Twin Box */}
            <div className="bg-slate-950/60 border border-red-800/60 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertOctagon className="w-4 h-4" />
                    Tampered Twin (5 Injected Flaws)
                  </span>
                  <span className="text-xs font-mono font-bold bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">
                    Risk Score: 100 / 100
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Apex Institute of Engineering & Technology (Tampered Twin)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesized digital date alteration, swapped trust deed name, SHA-256 duplicate collision from another college, and spoofed geotag 480km away.
                </p>
              </div>

              <button
                onClick={() => loadDossier('AICTE-2026-APEX-TAMPERED', 'Tampered Twin')}
                className="mt-4 flex items-center justify-center space-x-1.5 w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-2 rounded-lg text-xs transition-all shadow-md shadow-red-950"
              >
                <span>Load Tampered Twin in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Forensic Detection Matrix Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Anomaly Forensics Detection Matrix (5 / 5 Caught)
              </h4>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                100% Tamper Recall
              </span>
            </div>

            <div className="space-y-2">
              {demoData?.comparison_matrix?.map((row: any, i: number) => (
                <div 
                  key={i} 
                  className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs grid grid-cols-1 md:grid-cols-3 gap-3"
                >
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">
                      {row.test_domain}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Rule ID: {row.rule_id}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                      Clean Reference
                    </span>
                    <p className="text-[11px]">{row.clean_result}</p>
                  </div>

                  <div className="bg-red-950/30 p-2 rounded-lg border border-red-900/50 text-red-200">
                    <span className="text-[10px] uppercase font-bold text-red-400 block mb-0.5">
                      Tampered Twin Finding
                    </span>
                    <p className="text-[11px] font-medium">{row.tampered_result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Powered by Error Level Analysis, SHA-256 Hashing, and State Registry Verification
          </span>
          <button
            onClick={() => setIsTamperDemoOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
