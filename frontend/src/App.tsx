import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { OfficerWorkspace } from './pages/OfficerWorkspace';
import { ApplicantPortal } from './pages/ApplicantPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { EvaluationPage } from './pages/EvaluationPage';
import { TamperDemoModal } from './components/TamperDemoModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { ShieldCheck, Info } from 'lucide-react';

export const App: React.FC = () => {
  const { role, selectedAppId, toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500/20 selection:text-orange-300">
      {/* Header with Legal Product Principle Banner */}
      <Header />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
        {role === 'OFFICER' && <OfficerWorkspace />}
        {role === 'APPLICANT' && <ApplicantPortal />}
        {role === 'ADMIN' && <AdminDashboard />}
        {role === 'EVALUATION' && <EvaluationPage />}
      </main>

      {/* Global Standout Modals */}
      <TamperDemoModal />
      <AuditTrailModal applicationId={selectedAppId} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-blue-500/80 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 animate-bounce">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Government Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800 text-slate-400 text-xs py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-slate-200 font-bold">
                All India Council for Technical Education (AICTE)
              </div>
              <div className="text-[11px] text-slate-500">
                Statutory Body under the Ministry of Education, Government of India
              </div>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400 space-y-0.5">
            <div>
              Smart India Hackathon 2026 • Problem Statement: AI-Powered Application Validation
            </div>
            <div className="text-slate-500">
              Developed by <strong className="text-slate-300">Team CrashCoders</strong> • Decision Support Architecture
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
