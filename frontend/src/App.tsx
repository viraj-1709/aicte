import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { OfficerWorkspace } from './pages/OfficerWorkspace';
import { ApplicantPortal } from './pages/ApplicantPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { EvaluationPage } from './pages/EvaluationPage';
import { RequireRole } from './components/RequireRole';
import { TamperDemoModal } from './components/TamperDemoModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { LinkGraphModal } from './components/LinkGraphModal';
import { ModelCardModal } from './components/ModelCardModal';
import { HealthCheckModal } from './components/HealthCheckModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { ReasonForAccessModal } from './components/ReasonForAccessModal';
import { ShieldCheck, Info } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    user, 
    role, 
    selectedAppId, 
    toastMessage, 
    reasonForAccessAppId, 
    setReasonForAccessAppId,
    t 
  } = useApp();

  // Navigation route state synced with window.location
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && (hash.startsWith('/officer') || hash.startsWith('/admin') || hash.startsWith('/applicant'))) {
      return hash;
    }
    const path = window.location.pathname;
    if (path && (path.startsWith('/officer') || path.startsWith('/admin') || path.startsWith('/applicant'))) {
      return path;
    }
    return role ? `/${role.toLowerCase()}` : '/login';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Sync route on role login
  useEffect(() => {
    if (user && role) {
      const expectedPrefix = `/${role.toLowerCase()}`;
      if (!currentPath.startsWith(expectedPrefix)) {
        navigateTo(expectedPrefix);
      }
    }
  }, [user, role]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPath(hash);
      } else {
        setCurrentPath(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', `#${path}`);
  };

  // If user is not authenticated, render dedicated full-page Login page without sidebar
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-govNavy-100 dark:selection:bg-govNavy-800">
      {/* Skip to main content link for keyboard accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-govNavy-900 focus:text-white focus:rounded focus:shadow-lg focus:outline-hidden text-xs font-bold"
      >
        {t.common.skipToContent}
      </a>

      {/* 1. Official Header */}
      <Header 
        currentPath={currentPath} 
        onNavigate={navigateTo} 
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        menuButtonRef={menuButtonRef}
        isSidebarOpen={isSidebarOpen}
      />

      {/* 2. Main Layout with Single Vertical Sidebar & Independent Scrollable Content Area */}
      <div className="flex-1 flex w-full relative min-h-[calc(100vh-108px)]">
        {/* Role-Specific Vertical Sidebar */}
        <Sidebar 
          currentPath={currentPath} 
          onNavigate={navigateTo} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          menuButtonRef={menuButtonRef}
        />

        {/* 3. Main Body Content Area Guarded by RequireRole */}
        <div className="flex-1 flex flex-col min-w-0">
          <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 p-3 sm:p-6 focus:outline-hidden">
            {/* Officer Dashboard Routes */}
            {(currentPath === '/officer' || (!currentPath.startsWith('/admin') && !currentPath.startsWith('/applicant') && role === 'OFFICER')) && (
              <RequireRole allowedRole="OFFICER" currentPath={currentPath} onRedirect={navigateTo}>
                <OfficerWorkspace />
              </RequireRole>
            )}

            {/* Admin Dashboard Routes */}
            {(currentPath === '/admin' || (!currentPath.startsWith('/officer') && !currentPath.startsWith('/applicant') && role === 'ADMIN' && currentPath !== '/admin/evaluation')) && (
              <RequireRole allowedRole="ADMIN" currentPath={currentPath} onRedirect={navigateTo}>
                <AdminDashboard />
              </RequireRole>
            )}

            {/* Admin Evaluation Benchmark Route */}
            {currentPath === '/admin/evaluation' && (
              <RequireRole allowedRole="ADMIN" currentPath={currentPath} onRedirect={navigateTo}>
                <EvaluationPage />
              </RequireRole>
            )}

            {/* Applicant Portal Routes */}
            {(currentPath === '/applicant' || (!currentPath.startsWith('/officer') && !currentPath.startsWith('/admin') && role === 'APPLICANT')) && (
              <RequireRole allowedRole="APPLICANT" currentPath={currentPath} onRedirect={navigateTo}>
                <ApplicantPortal />
              </RequireRole>
            )}

            {/* Intercept cross-role manual navigation attempts */}
            {currentPath.startsWith('/admin') && role !== 'ADMIN' && (
              <RequireRole allowedRole="ADMIN" currentPath={currentPath} onRedirect={navigateTo}>
                <div />
              </RequireRole>
            )}

            {currentPath.startsWith('/officer') && role !== 'OFFICER' && (
              <RequireRole allowedRole="OFFICER" currentPath={currentPath} onRedirect={navigateTo}>
                <div />
              </RequireRole>
            )}

            {currentPath.startsWith('/applicant') && role !== 'APPLICANT' && (
              <RequireRole allowedRole="APPLICANT" currentPath={currentPath} onRedirect={navigateTo}>
                <div />
              </RequireRole>
            )}
          </main>

          {/* Neutral Official Government Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded bg-govNavy-900 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-3 h-3 text-govSaffron-500" />
                </div>
                <span>© AICTE Application Validation Platform</span>
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
                <a href="#accessibility" onClick={(e) => { e.preventDefault(); alert('Accessibility: Conforms to WCAG 2.1 AA standards with 8 Indian languages, RTL layout, and keyboard accessibility.'); }} className="hover:underline">
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
      </div>

      {/* 4. Global Modals & Overlays */}
      <TamperDemoModal />
      <AuditTrailModal applicationId={selectedAppId} />
      <LinkGraphModal />
      <ModelCardModal />
      <HealthCheckModal />
      <GuidedTourModal />
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
    </div>
  );
};
