import React from 'react';
import { useApp } from '../context/AppContext';
import { Keyboard, X, Command } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen, t } = useApp();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'A', action: t.officer?.btnAccept || 'Accept Application (A)', desc: 'Opens the Accept confirmation dialog and focuses mandatory remarks' },
    { key: 'R', action: t.officer?.btnReject || 'Reject Application (R)', desc: 'Opens the Reject dialog and focuses mandatory refusal grounds' },
    { key: 'C', action: t.officer?.btnClarify || 'Request Clarification (C)', desc: 'Triggers applicant clarification loop with deadline selector' },
    { key: 'N', action: t.common?.next || 'Next Case (N)', desc: 'Navigates to the next application in the current review queue' },
    { key: 'P', action: t.common?.prev || 'Previous Case (P)', desc: 'Navigates to the previous application in the current review queue' },
    { key: 'F', action: 'Focus Explainable Flags (F)', desc: 'Jumps scroll directly to explainable flags and evidence section' },
    { key: '?', action: 'Shortcuts Reference Overlay (?)', desc: 'Toggles this keyboard shortcut reference overlay' },
    { key: 'Esc', action: t.common?.close || 'Close Modal (Esc)', desc: 'Dismisses any active dialog or overlay' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={() => setIsShortcutsOpen(false)}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md w-full max-w-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Keyboard className="w-5 h-5 text-govNavy-700 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Officer Productivity Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            Accelerated statutory review hotkeys for AICTE scrutiny officers. Shortcuts do not trigger while typing inside text fields or textareas.
          </p>

          <div className="border border-slate-200 dark:border-slate-800 rounded divide-y divide-slate-200 dark:divide-slate-800">
            {shortcuts.map((sc, i) => (
              <div key={i} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="pr-4">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {sc.action}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sc.desc}
                  </span>
                </div>
                <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-xs shrink-0">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded text-[11px] text-blue-900 dark:text-blue-200">
            <strong>Officer Productivity Note:</strong> Decisions made via shortcuts (<kbd className="font-mono">A</kbd>, <kbd className="font-mono">R</kbd>, <kbd className="font-mono">C</kbd>) strictly require written officer remarks before committing to the hash-chained audit ledger.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="px-4 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-semibold"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
