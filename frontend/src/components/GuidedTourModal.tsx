import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, X, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Zap, Sliders, ListOrdered, Lock } from 'lucide-react';

export const GuidedTourModal: React.FC = () => {
  const { isTourOpen, setIsTourOpen, t, setSelectedAppId, setRole, setIsTamperDemoOpen } = useApp();
  const [step, setStep] = useState(0);

  if (!isTourOpen) return null;

  const tourSteps = [
    {
      title: '1. Role-Based Access & Scrutiny Portal',
      icon: <Lock className="w-5 h-5 text-govNavy-700 dark:text-blue-400" />,
      content: 'The platform provides strict statutory separation for Applicants (document submission & pre-checks), Scrutiny Officers (queue evaluation & risk scoring), and Council Administrators (policy rules & SLA monitoring). All views support 8 official Indian languages and right-to-left Urdu.',
      actionLabel: 'Next: Bulk Queue',
      action: () => setStep(1)
    },
    {
      title: '2. Bulk Scrutiny Queue & SLA Tracker',
      icon: <ListOrdered className="w-5 h-5 text-govNavy-700 dark:text-blue-400" />,
      content: 'The Officer Workspace manages 500+ simulated institutional applications with real-time sorting by risk score (0-100) or deadline urgency. Cases nearing SLA breach are visually highlighted, and zero-flag low-risk applications can be bulk-approved with mandatory audit remarks.',
      actionLabel: 'Next: Showcase Case',
      action: () => {
        setRole('OFFICER');
        setSelectedAppId('AICTE/2026/NI/000123');
        setStep(2);
      }
    },
    {
      title: '3. Showcase Case: 6-Step Pipeline & Explainable Flags',
      icon: <ShieldCheck className="w-5 h-5 text-govNavy-700 dark:text-blue-400" />,
      content: 'Opening case AICTE/2026/NI/000123 loads the side-by-side document viewer and 6-7 injected flaws: land area shortfall (3.80 vs 5.00 acres), expired society deed, impossible date sequencing, and shared contact phone matching another institution in the cross-application fraud graph.',
      actionLabel: 'Next: What-If Simulator',
      action: () => setStep(3)
    },
    {
      title: '4. What-If Risk Simulator & Human Feedback',
      icon: <Sliders className="w-5 h-5 text-govNavy-700 dark:text-blue-400" />,
      content: 'Officers can toggle individual flags off in the What-If Simulator to explore hypothetical outcomes without modifying stored official data. Additionally, officers can mark flags as "False Alarm", automatically adjusting rule confidence thresholds with before/after audit tracking.',
      actionLabel: 'Next: Tamper Demo',
      action: () => setStep(4)
    },
    {
      title: '5. Tamper Forensics & Cryptographic Audit Ledger',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      content: 'In Tamper Demo mode, compare a clean dossier against a tampered twin caught via Error Level Analysis (ELA) and perceptual hashing (pHash). Every check is permanently sealed into a SHA-256 hash-chained audit ledger with 1-click integrity verification.',
      actionLabel: 'Launch Tamper Demo',
      action: () => {
        setIsTourOpen(false);
        setIsTamperDemoOpen(true);
      }
    }
  ];

  const current = tourSteps[step];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={() => setIsTourOpen(false)}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md w-full max-w-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Compass className="w-5 h-5 text-govNavy-700 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Interactive Portal Walkthrough ({step + 1} of {tourSteps.length})
            </h3>
          </div>
          <button
            onClick={() => setIsTourOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Progress Indicators */}
          <div className="flex items-center space-x-1.5">
            {tourSteps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === step 
                    ? 'bg-govNavy-900 dark:bg-blue-500' 
                    : i < step 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-start space-x-3.5 pt-1">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shrink-0">
              {current.icon}
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {current.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {current.content}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIsTourOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Skip Tour
          </button>

          <div className="flex items-center space-x-2">
            {step > 0 && (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
            <button
              onClick={current.action}
              className="px-4 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
