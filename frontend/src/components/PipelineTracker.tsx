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
  currentStep?: number;
  steps?: any;
  flagsCount?: number;
  criticalCount?: number;
}

export const PipelineTracker: React.FC<Props> = ({ 
  currentStep = 6, 
  flagsCount = 0, 
  criticalCount = 0 
}) => {
  const { t } = useApp();

  const pipelineStages = [
    { num: 1, name: t.pipeline.step1, desc: t.pipeline.step1Desc, icon: FileText },
    { num: 2, name: t.pipeline.step2, desc: t.pipeline.step2Desc, icon: ScanLine },
    { num: 3, name: t.pipeline.step3, desc: t.pipeline.step3Desc, icon: ShieldAlert },
    { num: 4, name: t.pipeline.step4, desc: t.pipeline.step4Desc, icon: AlertOctagon },
    { num: 5, name: t.pipeline.step5, desc: t.pipeline.step5Desc, icon: Landmark },
    { num: 6, name: t.pipeline.step6, desc: t.pipeline.step6Desc, icon: ClipboardCheck }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-4 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 px-1 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            End-to-End Regulatory Verification Pipeline (6 Steps)
          </span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded font-semibold">
            Statutory Scrutiny
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-500">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded">
              {criticalCount} Critical Flags Active
            </span>
          )}
          <span>
            Automated Checks Complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {pipelineStages.map((st) => {
          const Icon = st.icon;
          const isCompleted = currentStep >= st.num;
          const isCurrent = currentStep === st.num;

          return (
            <div
              key={st.num}
              className={`relative flex flex-col p-2.5 rounded border transition-colors ${
                isCurrent
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 font-medium'
                  : isCompleted
                  ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                  : 'bg-slate-100/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold ${
                  isCompleted 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.num}
                </span>
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-govNavy-900 dark:text-blue-400' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{st.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{st.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
