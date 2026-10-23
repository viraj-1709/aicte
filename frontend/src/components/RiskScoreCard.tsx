import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, CheckCircle, ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';
import { RiskBreakdownItem } from '../types';

interface Props {
  score: number;
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH';
  breakdown: RiskBreakdownItem[];
}

export const RiskScoreCard: React.FC<Props> = ({ score, riskBand, breakdown }) => {
  const { t } = useApp();
  const [showBreakdown, setShowBreakdown] = useState(true);

  // Band styling
  const isLow = score < 30;
  const isMed = score >= 30 && score < 60;
  const isHigh = score >= 60;

  const bandBg = isLow ? 'bg-emerald-950/40 border-emerald-800/60' : isMed ? 'bg-amber-950/40 border-amber-800/60' : 'bg-red-950/50 border-red-800/70';
  const scoreColor = isLow ? 'text-emerald-400' : isMed ? 'text-amber-400' : 'text-red-400';
  const badgeColor = isLow ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : isMed ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40';

  const bandText = isLow 
    ? 'Low Risk (Accelerated Clearance Eligible)' 
    : isMed 
    ? 'Medium Risk (Standard Scrutiny Required)' 
    : 'High Risk (Mandatory Committee Hearing & Inspection)';

  return (
    <div className={`rounded-xl border ${bandBg} p-4 shadow-sm mb-6 transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Score & Badge */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={201}
                strokeDashoffset={201 - (201 * score) / 100}
                strokeLinecap="round"
                className={`${scoreColor} transition-all duration-700`}
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-2xl font-black ${scoreColor}`}>{score}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${badgeColor}`}>
                {riskBand} RISK DOSSIER
              </span>
              <span className="text-xs text-slate-400">
                AICTE Rule-Weighted Index
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-200 mt-1">{bandText}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated from validation rules, anomaly forensics, issuer checks and CV analysis.
            </p>
          </div>
        </div>

        {/* Toggle Breakdown Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>{showBreakdown ? 'Hide Breakdown' : 'Show Transparent Breakdown'}</span>
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Transparent Itemized Breakdown (NO BLACK BOX) */}
      {showBreakdown && (
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Transparent Risk Formula (No Black Box)
            </span>
            <span className="text-[11px] text-slate-400">
              Base Points Sum = {score} pts (Max 100)
            </span>
          </div>

          {breakdown.length === 0 ? (
            <div className="bg-slate-950/40 p-3 rounded-lg text-xs text-emerald-400 flex items-center space-x-2 border border-emerald-900/30">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Clean application! Zero penalty points incurred across all regulatory rules.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                    item.is_discounted 
                      ? 'bg-slate-950/30 border-slate-800/40 opacity-60' 
                      : 'bg-slate-950/50 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                      item.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                      item.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {item.severity}
                    </span>
                    <span className={`truncate font-medium ${item.is_discounted ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {item.title}
                    </span>
                    {item.is_discounted && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/40 shrink-0">
                        Officer Marked False Alarm
                      </span>
                    )}
                  </div>

                  <span className={`font-mono font-bold shrink-0 ${
                    item.is_discounted ? 'text-slate-500' : 'text-amber-400'
                  }`}>
                    {item.is_discounted ? '0 pts' : `+${item.points} pts`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
