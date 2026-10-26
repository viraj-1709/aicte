import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, CheckCircle, X } from 'lucide-react';

interface Props {
  applicationId: string | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const ReasonForAccessModal: React.FC<Props> = ({ applicationId, onConfirm, onCancel }) => {
  const { t } = useApp();
  const [selectedReason, setSelectedReason] = useState(t.officer.reasonHearing);
  const [customText, setCustomText] = useState('');

  if (!applicationId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customText.trim() ? `${selectedReason} - ${customText.trim()}` : selectedReason;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-govNavy-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-govSaffron-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {t.officer.reasonForAccessTitle}
            </h3>
          </div>
          <button onClick={onCancel} className="text-govNavy-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 leading-relaxed text-[11px]">
            {t.officer.reasonForAccessPrompt}
            <div className="mt-1 font-mono font-bold text-slate-800 dark:text-slate-100">
              Dossier Reference: {applicationId}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Statutory Scrutiny Reason
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-govNavy-900"
            >
              <option value={t.officer.reasonHearing}>{t.officer.reasonHearing}</option>
              <option value={t.officer.reasonComplaint}>{t.officer.reasonComplaint}</option>
              <option value={t.officer.reasonAudit}>{t.officer.reasonAudit}</option>
              <option value={t.officer.reasonRoutine}>{t.officer.reasonRoutine}</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Inspection / Case Notes (Optional)
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Committee file ref 2026/SCR/88..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-govNavy-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-govNavy-900 hover:bg-govNavy-800 text-white font-bold shadow-xs transition-colors"
            >
              Confirm Access & Log to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
