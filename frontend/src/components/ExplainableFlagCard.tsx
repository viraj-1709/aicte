import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ShieldAlert, 
  BookOpen, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';
import { FlagItem } from '../types';
import { api } from '../services/api';

interface Props {
  flag: FlagItem;
  applicationId: string;
  isActive: boolean;
  onFocusEvidence: () => void;
  onFeedbackUpdated: () => void;
}

export const ExplainableFlagCard: React.FC<Props> = ({
  flag,
  applicationId,
  isActive,
  onFocusEvidence,
  onFeedbackUpdated
}) => {
  const { t, showToast } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const handleFeedback = async (type: 'CORRECT' | 'FALSE_ALARM') => {
    setSubmitting(true);
    try {
      await api.submitFeedback(applicationId, flag.id, type);
      showToast(type === 'CORRECT' ? 'Feedback recorded: Flag confirmed as real regulatory issue.' : 'Feedback recorded: Flag marked as False Alarm. Points deducted.');
      onFeedbackUpdated();
    } catch (e: any) {
      showToast('Error recording feedback: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isCritical = flag.severity === 'CRITICAL';
  const isHigh = flag.severity === 'HIGH';

  const cardBorder = isActive 
    ? 'border-blue-500 ring-2 ring-blue-500/30' 
    : isCritical 
    ? 'border-red-900/60' 
    : isHigh 
    ? 'border-amber-900/60' 
    : 'border-slate-800';

  const sevColor = isCritical ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                   isHigh ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' :
                   'bg-slate-700 text-slate-300 border-slate-600';

  return (
    <div className={`bg-slate-900/90 rounded-xl border ${cardBorder} p-3.5 shadow-sm transition-all hover:border-slate-700`}>
      {/* Top Header: Severity, Category, Risk Points */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${sevColor}`}>
            {flag.severity}
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold border border-slate-700">
            {flag.category}
          </span>
          <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
            {Math.round(flag.confidence * 100)}% Confidence
          </span>
        </div>

        <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
          +{flag.risk_points} pts
        </span>
      </div>

      {/* 1. What We Found */}
      <div className="mb-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>{t.officer.whatFound}</span>
        </div>
        <h4 className="text-xs font-bold text-slate-100 leading-snug">
          {flag.title}
        </h4>
      </div>

      {/* 2. Where (Evidence & Highlight Trigger) */}
      {flag.evidence && (
        <div className="mb-2 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>{t.officer.whereFound}</span>
            <button
              onClick={onFocusEvidence}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 normal-case font-semibold text-[11px]"
            >
              <Eye className="w-3 h-3" />
              <span>Locate on Document</span>
            </button>
          </div>
          <div className="text-[11px] text-slate-300 font-mono bg-slate-900/90 px-2 py-1 rounded border border-slate-800 break-words">
            {flag.evidence.snippet || `Source Document: ${flag.evidence.source_doc_type || 'Dossier'}`}
          </div>
        </div>
      )}

      {/* 3. Why It Matters (Regulatory Norm) */}
      <div className="mb-3 bg-amber-950/20 border border-amber-900/30 rounded-lg p-2">
        <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-0.5 flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-amber-400" />
          <span>{t.officer.whyMatters}</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {flag.reason}
        </p>
      </div>

      {/* 4. Human-in-the-Loop Feedback Controls */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t.officer.humanFeedback}:
        </span>

        {flag.officer_feedback ? (
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded border ${
              flag.officer_feedback === 'CORRECT'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {flag.officer_feedback === 'CORRECT' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>{flag.officer_feedback === 'CORRECT' ? 'Confirmed by Officer' : 'Marked False Alarm (Discounted)'}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5">
            <button
              disabled={submitting}
              onClick={() => handleFeedback('CORRECT')}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition-colors"
            >
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{t.officer.markCorrect}</span>
            </button>
            <button
              disabled={submitting}
              onClick={() => handleFeedback('FALSE_ALARM')}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            >
              <XCircle className="w-3 h-3 text-red-400" />
              <span>{t.officer.markFalseAlarm}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
