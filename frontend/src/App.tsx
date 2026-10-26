import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { OfficerWorkspace } from './pages/OfficerWorkspace';
import { ApplicantPortal } from './pages/ApplicantPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { EvaluationPage } from './pages/EvaluationPage';
import { TamperDemoModal } from './components/TamperDemoModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { LinkGraphModal } from './components/LinkGraphModal';
import { ModelCardModal } from './components/ModelCardModal';
import { HealthCheckModal } from './components/HealthCheckModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ReasonForAccessModal } from './components/ReasonForAccessModal';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, Layers, BarChart3, Users, Settings } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    user, 
    role, 
    selectedAppId, 
    toastMessage, 
    reasonForAccessAppId, 
    setReasonForAccessAppId,
    setRole,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'MAIN' | 'EVALUATION'>('MAIN');

  // If user is not authenticated, render dedicated full-page Login page (Section 2.1)
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-govNavy-100 dark:selection:bg-govNavy-800">
      {/* 1. Official Header */}
      <Header currentView={activeTab} setCurrentView={setActiveTab} />

      {/* 2. Secondary Navigation Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto text-xs font-semibold">
          <div className="flex items-center space-x-1 py-1">
            {role === 'OFFICER' && (
              <>
                <button
                  onClick={() => setActiveTab('MAIN')}
                  className={`py-2 px-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'MAIN'
                      ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Officer Review Queue & Dossier</span>
                </button>

                <button
                  onClick={() => setActiveTab('EVALUATION')}
                  className={`py-2 px-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'EVALUATION'
                      ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>AI Model Evaluation Benchmarks</span>
                </button>
              </>
            )}

            {role === 'APPLICANT' && (
              <button
                onClick={() => setActiveTab('MAIN')}
                className="py-2 px-3 border-b-2 border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 font-bold flex items-center space-x-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Institutional Application & Document Checklist</span>
              </button>
            )}

            {role === 'ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('MAIN')}
                  className={`py-2 px-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'MAIN'
                      ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Council Dashboard & Rules Configuration</span>
                </button>

                <button
                  onClick={() => setActiveTab('EVALUATION')}
                  className={`py-2 px-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'EVALUATION'
                      ? 'border-govNavy-900 dark:border-blue-500 text-govNavy-900 dark:text-blue-400 font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Model Performance Metrics</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Demo Role Switcher (Convenient for evaluators) */}
          <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-500 py-1">
            <span>Switch Portal View:</span>
            <button
              onClick={() => { setRole('OFFICER'); setActiveTab('MAIN'); }}
              className={`px-2 py-0.5 rounded border transition-colors ${
                role === 'OFFICER'
                  ? 'bg-govNavy-900 text-white border-govNavy-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              Officer
            </button>
            <button
              onClick={() => { setRole('APPLICANT'); setActiveTab('MAIN'); }}
              className={`px-2 py-0.5 rounded border transition-colors ${
                role === 'APPLICANT'
                  ? 'bg-govNavy-900 text-white border-govNavy-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              Applicant
            </button>
            <button
              onClick={() => { setRole('ADMIN'); setActiveTab('MAIN'); }}
              className={`px-2 py-0.5 rounded border transition-colors ${
                role === 'ADMIN'
                  ? 'bg-govNavy-900 text-white border-govNavy-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Body Content View */}
      <main className="flex-1">
        {activeTab === 'EVALUATION' ? (
          <EvaluationPage />
        ) : (
          <>
            {role === 'OFFICER' && <OfficerWorkspace />}
            {role === 'APPLICANT' && <ApplicantPortal />}
            {role === 'ADMIN' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* 4. Global Modals & Overlays */}
      <TamperDemoModal />
      <AuditTrailModal applicationId={selectedAppId} />
      <LinkGraphModal />
      <ModelCardModal />
      <HealthCheckModal />
      <GuidedTourModal />
      <KeyboardShortcutsModal />
      {reasonForAccessAppId && (
        <ReasonForAccessModal
          applicationId={reasonForAccessAppId}
          onConfirm={(r) => {
            sessionStorage.setItem(`justified_${reasonForAccessAppId}`, r);
            setReasonForAccessAppId(null);
          }}
          onCancel={() => setReasonForAccessAppId(null)}
        />
      )}

      {/* 5. Clean Government Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-700 text-xs px-4 py-3 rounded-md shadow-lg flex items-center space-x-2.5 max-w-md">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-medium leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* 6. Neutral Official Government Footer (Section 1 Branding Rule) */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded bg-govNavy-900 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-3 h-3 text-govSaffron-500" />
            </div>
            <span>© AICTE Application Validation Platform (Prototype)</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-500">
            <a href="#help" onClick={(e) => { e.preventDefault(); alert('AICTE Technical Helpdesk: 011-29581000 / helpdesk@aicte.gov.in'); }} className="hover:underline">
              Helpdesk
            </a>
            <span>•</span>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Statutory Data Privacy: Applications processed solely for official AICTE regulatory validation under the AICTE Act.'); }} className="hover:underline">
              Statutory Privacy Policy
            </a>
            <span>•</span>
            <a href="#accessibility" onClick={(e) => { e.preventDefault(); alert('Accessibility: Conforms to WCAG 2.1 AA standards with 8 Indian languages, RTL layout, and keyboard shortcuts.'); }} className="hover:underline">
              Accessibility Statement
            </a>
            <span>•</span>
            <a href="#contact" onClick={(e) => { e.preventDefault(); alert('All India Council for Technical Education, Nelson Mandela Marg, Vasant Kunj, New Delhi-110070'); }} className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
