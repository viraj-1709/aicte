import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, ShieldCheck, CheckCircle2, AlertTriangle, X, Scale } from 'lucide-react';

export const ModelCardModal: React.FC = () => {
  const { isModelCardOpen, setIsModelCardOpen, t } = useApp();

  if (!isModelCardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-govNavy-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-govNavy-950">
          <div className="flex items-center space-x-2.5">
            <Scale className="w-5 h-5 text-govSaffron-500" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Model Card & Fairness Statement
              </h2>
              <p className="text-[11px] text-govNavy-200">
                Ethical boundary conditions, transparency norms & responsible design
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModelCardOpen(false)}
            className="text-govNavy-300 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300 overflow-y-auto">
          {/* 1. Mandatory Fairness Statement */}
          <div className="p-4 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.auth.fairnessTitle}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {t.auth.fairnessBody}
            </p>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
              Protected Attributes Strictly Excluded: Religion, Region, Gender, Caste, Minority Status, Institution Name, Trust Net Worth.
            </div>
          </div>

          {/* 2. Core Operational Checks */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Automated Check Modules & Verified Inputs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                  1. Optical Character Recognition (OCR)
                </strong>
                <p className="text-slate-500">
                  Extracts dates, registration IDs, land areas, and surveying numbers using multi-language script models. Routes low-confidence extractions to manual review.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                  2. Error Level Analysis (ELA) Forensics
                </strong>
                <p className="text-slate-500">
                  Inspects quantization matrix compression disparities in JPEG/PNG scans to detect altered characters, forged validity dates, and spliced text.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                  3. Perceptual Hashing (pHash/dHash)
                </strong>
                <p className="text-slate-500">
                  Identifies recycled architectural blueprints, floor plans, and certificates that have been re-scanned, rotated, or slightly cropped.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
                <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-1">
                  4. State Registry Adapters
                </strong>
                <p className="text-slate-500">
                  Verifies registered society status, land revenue record encumbrance, and fire department NOCs directly with issuing authority databases.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Known Failure Cases & Mitigations (Section 10 Honesty Requirement) */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Known Boundary Conditions & Failure Modes</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <li>
                <strong>Worn Official Stamps:</strong> Notary stamps on aged parchment can occasionally trigger false-positive ELA compression anomalies. Officers can mark these as False Alarms to tune thresholds.
              </li>
              <li>
                <strong>Handwritten Notes in Regional Languages:</strong> While printed scripts in all 8 languages achieve &gt;94% accuracy, handwritten cursive endorsements require manual officer review.
              </li>
              <li>
                <strong>Spelling Transliteration Variations:</strong> Variations in Romanized Devanagari names (e.g., 'Chandra' vs 'Chander') are flagged for human confirmation rather than auto-rejected.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 flex justify-end">
          <button
            onClick={() => setIsModelCardOpen(false)}
            className="px-4 py-2 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-bold"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
