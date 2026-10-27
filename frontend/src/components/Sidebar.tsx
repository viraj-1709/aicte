import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  ShieldCheck, 
  Zap, 
  Network, 
  Sliders, 
  BarChart3, 
  FileText, 
  HelpCircle, 
  Activity, 
  BookOpen, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { AlertItem } from '../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpen,
  onClose,
  menuButtonRef
}) => {
  const { 
    user,
    role, 
    setIsTamperDemoOpen, 
    setIsAuditModalOpen, 
    setIsLinkGraphOpen, 
    setIsModelCardOpen, 
    setIsHealthCheckOpen,
    setIsTourOpen,
    t 
  } = useApp();

  const [alertsCount, setAlertsCount] = useState<number>(0);
  const drawerRef = useRef<HTMLElement>(null);

  // Remember collapsed state per user
  const storageKey = `aicte_sidebar_collapsed_${user?.id || user?.role || 'default'}`;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    api.getAdminAlerts()
      .then(data => setAlertsCount(data.length))
      .catch(() => {});
  }, []);

  // Trap focus inside mobile drawer and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    // Focus first focusable element inside drawer
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        menuButtonRef?.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, menuButtonRef]);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    if (isOpen) {
      onClose();
      menuButtonRef?.current?.focus();
    }
  };

  const handleActionClick = (action: () => void) => {
    action();
    if (isOpen) {
      onClose();
      menuButtonRef?.current?.focus();
    }
  };

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={() => {
            onClose();
            menuButtonRef?.current?.focus();
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Drawer Navigation */}
      <aside 
        ref={drawerRef}
        className={`
          fixed lg:sticky top-0 lg:top-[108px] bottom-0 start-0 z-50 lg:z-20
          h-full lg:h-[calc(100vh-108px)]
          bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800
          flex flex-col justify-between shrink-0
          transition-all duration-200 ease-in-out shadow-sm
          ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-72 max-w-[85vw]
        `}
        aria-label={t.common.primaryNavigation}
      >
        {/* Top Header Section inside Sidebar */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header row: Mobile Close / Desktop Role Info & Collapse Toggle */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className={`flex items-center space-x-2 truncate ${isCollapsed ? 'lg:hidden' : ''}`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                role === 'OFFICER' ? 'bg-blue-600' : role === 'ADMIN' ? 'bg-amber-600' : 'bg-emerald-600'
              }`} />
              <div className="truncate">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {role === 'OFFICER' ? t.header.officerBadge : role === 'ADMIN' ? 'Admin' : 'Applicant'}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {role === 'OFFICER' ? t.header.officerBreadcrumb : role === 'ADMIN' ? t.header.adminBreadcrumb : t.header.applicantBreadcrumb}
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => {
                onClose();
                menuButtonRef?.current?.focus();
              }}
              className="lg:hidden p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-govNavy-900"
              aria-label={t.common.close}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse / Expand Rail Toggle */}
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500"
              title={isCollapsed ? t.common.expandSidebar : t.common.collapseSidebar}
              aria-label={isCollapsed ? t.common.expandSidebar : t.common.collapseSidebar}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              ) : (
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              )}
            </button>
          </div>

          {/* Primary Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4" aria-label={t.common.primaryNavigation}>
            {/* 1. OFFICER ROLE NAVIGATION */}
            {role === 'OFFICER' && (
              <>
                {/* Section 1: Workspace & Queue */}
                <div className="space-y-1">
                  {!isCollapsed && (
                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.common.sectionWorkspace}
                    </div>
                  )}

                  <button
                    onClick={() => handleNavClick('/officer')}
                    aria-current={currentPath === '/officer' ? 'page' : undefined}
                    title={t.header.queueBreadcrumb}
                    aria-label={t.header.queueBreadcrumb}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500 ${
                      currentPath === '/officer'
                        ? 'bg-govNavy-900 text-white dark:bg-blue-600 font-bold border-s-4 border-govSaffron-500'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-start">{t.header.queueBreadcrumb}</span>
                    )}
                    {!isCollapsed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 shrink-0">
                        520+
                      </span>
                    )}
                  </button>
                </div>

                {/* Section 2: Statutory Forensic Tools */}
                <div className="space-y-1 pt-2">
                  {!isCollapsed && (
                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.common.sectionTools}
                    </div>
                  )}

                  <button
                    onClick={() => handleActionClick(() => setIsTamperDemoOpen(true))}
                    title="Tamper Forensics Demo"
                    aria-label="Tamper Forensics Demo"
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">Tamper Forensics Demo</span>}
                  </button>

                  <button
                    onClick={() => handleActionClick(() => setIsAuditModalOpen(true))}
                    title={t.officer.btnAuditTrail}
                    aria-label={t.officer.btnAuditTrail}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.officer.btnAuditTrail}</span>}
                  </button>

                  <button
                    onClick={() => handleActionClick(() => setIsLinkGraphOpen(true))}
                    title={t.officer.linkGraphTitle}
                    aria-label={t.officer.linkGraphTitle}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <Network className="w-4 h-4 text-blue-500 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.officer.linkGraphTitle}</span>}
                  </button>

                  <button
                    onClick={() => handleActionClick(() => setIsTourOpen(true))}
                    title={t.header.tour}
                    aria-label={t.header.tour}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.header.tour}</span>}
                  </button>
                </div>
              </>
            )}

            {/* 2. ADMIN ROLE NAVIGATION */}
            {role === 'ADMIN' && (
              <>
                {/* Section 1: Governance & Operations */}
                <div className="space-y-1">
                  {!isCollapsed && (
                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.common.sectionGovernance}
                    </div>
                  )}

                  <button
                    onClick={() => handleNavClick('/admin')}
                    aria-current={currentPath === '/admin' ? 'page' : undefined}
                    title={t.header.rulesBreadcrumb}
                    aria-label={t.header.rulesBreadcrumb}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500 ${
                      currentPath === '/admin'
                        ? 'bg-govNavy-900 text-white dark:bg-blue-600 font-bold border-s-4 border-govSaffron-500'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <Sliders className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.header.rulesBreadcrumb}</span>}
                  </button>

                  <button
                    onClick={() => handleNavClick('/admin/evaluation')}
                    aria-current={currentPath === '/admin/evaluation' ? 'page' : undefined}
                    title={t.header.benchmarkBreadcrumb}
                    aria-label={t.header.benchmarkBreadcrumb}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500 ${
                      currentPath === '/admin/evaluation'
                        ? 'bg-govNavy-900 text-white dark:bg-blue-600 font-bold border-s-4 border-govSaffron-500'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.header.benchmarkBreadcrumb}</span>}
                  </button>
                </div>

                {/* Section 2: Audit & Diagnostics */}
                <div className="space-y-1 pt-2">
                  {!isCollapsed && (
                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.common.sectionCompliance}
                    </div>
                  )}

                  <button
                    onClick={() => handleActionClick(() => setIsModelCardOpen(true))}
                    title={t.header.modelCard}
                    aria-label={t.header.modelCard}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.header.modelCard}</span>}
                  </button>

                  <button
                    onClick={() => handleActionClick(() => setIsHealthCheckOpen(true))}
                    title={t.header.healthCheck}
                    aria-label={t.header.healthCheck}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-start">{t.header.healthCheck}</span>
                    )}
                    {!isCollapsed && alertsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 shrink-0">
                        {alertsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleActionClick(() => setIsAuditModalOpen(true))}
                    title={t.officer.btnAuditTrail}
                    aria-label={t.officer.btnAuditTrail}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.officer.btnAuditTrail}</span>}
                  </button>
                </div>
              </>
            )}

            {/* 3. APPLICANT ROLE NAVIGATION */}
            {role === 'APPLICANT' && (
              <>
                {/* Section 1: Application Dossier */}
                <div className="space-y-1">
                  {!isCollapsed && (
                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.common.sectionWorkspace}
                    </div>
                  )}

                  <button
                    onClick={() => handleNavClick('/applicant')}
                    aria-current={currentPath === '/applicant' ? 'page' : undefined}
                    title={t.header.checklistBreadcrumb}
                    aria-label={t.header.checklistBreadcrumb}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500 ${
                      currentPath === '/applicant'
                        ? 'bg-govNavy-900 text-white dark:bg-blue-600 font-bold border-s-4 border-govSaffron-500'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.header.checklistBreadcrumb}</span>}
                  </button>
                </div>

                {/* Section 2: Applicant Resources & Guidelines */}
                <div className="space-y-1 pt-2">
                  {!isCollapsed && (
                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.common.sectionResources}
                    </div>
                  )}

                  <button
                    onClick={() => handleActionClick(() => alert('Statutory Handbook Reference: AICTE Approval Process Handbook (APH 2026-27). All uploaded certificates must be authentic, valid and unexpired.'))}
                    title={t.common.statutoryGuidelines}
                    aria-label={t.common.statutoryGuidelines}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.common.statutoryGuidelines}</span>}
                  </button>

                  <button
                    onClick={() => handleActionClick(() => alert('Technical Helpdesk: 011-29581000 / helpdesk@aicte.gov.in (Mon-Fri 09:30-17:30 IST)'))}
                    title={t.common.technicalHelpdesk}
                    aria-label={t.common.technicalHelpdesk}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2.5 px-3'} py-2.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500`}
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1 text-start">{t.common.technicalHelpdesk}</span>}
                  </button>

                  {!isCollapsed && (
                    <div className="p-3 mt-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Statutory Pre-Check</span>
                      </div>
                      <p className="text-[10px] leading-relaxed">
                        Verify uploaded certificates prior to formal AICTE scrutiny committee review.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center truncate">
          {!isCollapsed ? 'AICTE Scrutiny System v1.0' : 'v1.0'}
        </div>
      </aside>
    </>
  );
};
