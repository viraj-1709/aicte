import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  FileText, 
  ScanLine, 
  ShieldAlert, 
  AlertOctagon, 
  Landmark, 
  ClipboardCheck 
} from 'lucide-react';

interface Props {
  currentStep: number;
  flagsCount: number;
  criticalCount: number;
}

export const PipelineTracker: React.FC<Props> = ({ 
  currentStep, 
  flagsCount, 
  criticalCount 
}) => {
  const { t } = useApp();

  const steps = [
    { num: 1, name: t.pipeline.step1, desc: t.pipeline.step1Desc, icon: FileText },
    { num: 2, name: t.pipeline.step2, desc: t.pipeline.step2Desc, icon: ScanLine },
    { num: 3, name: t.pipeline.step3, desc: t.pipeline.step3Desc, icon: ShieldAlert },
    { num: 4, name: t.pipeline.step4, desc: t.pipeline.step4Desc, icon: AlertOctagon },
    { num: 5, name: t.pipeline.step5, desc: t.pipeline.step5Desc, icon: Landmark },
    { num: 6, name: t.pipeline.step6, desc: t.pipeline.step6Desc, icon: ClipboardCheck }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            End-to-End Regulatory Verification Pipeline (6 Steps)
          </span>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
            AICTE Automated Scrutiny
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-red-400 font-bold bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {criticalCount} Critical Flags Active
            </span>
          )}
          <span className="text-slate-400">
            Total Findings: <strong className="text-white">{flagsCount}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {steps.map((st) => {
          const Icon = st.icon;
          const isCompleted = currentStep >= st.num;
          const isCurrent = currentStep === st.num;

          return (
            <div
              key={st.num}
              className={`relative flex flex-col p-2.5 rounded-lg border transition-all ${
                isCurrent
                  ? 'bg-blue-950/60 border-blue-500/80 shadow-md shadow-blue-950/50 ring-1 ring-blue-500/30'
                  : isCompleted
                  ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                  : 'bg-slate-950/20 border-slate-850/50 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.num}
                </span>
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className="font-bold text-xs text-slate-200 truncate">{st.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{st.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
