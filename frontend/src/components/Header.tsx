import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AicteLogo } from './AicteLogo';
import { 
  AlertTriangle, 
  Bell, 
  Globe2, 
  Sun, 
  Moon, 
  LogOut, 
  Menu,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { AlertItem } from '../types';
import { LANGUAGE_OPTIONS } from '../locales';

interface HeaderProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onToggleSidebar?: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement>;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPath = '/officer', 
  onNavigate = () => {}, 
  onToggleSidebar = () => {},
  menuButtonRef,
  isSidebarOpen = false
}) => {
  const { 
    user,
    logout,
    role, 
    theme, 
    toggleTheme,
    lang, 
    setLang,
    t
  } = useApp();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  useEffect(() => {
    api.getAdminAlerts()
      .then(data => setAlerts(data))
      .catch(() => {});
  }, []);

  // Compute breadcrumbs strictly from logged in role and active path
  const getBreadcrumbs = () => {
    const items = [{ label: t.header.breadcrumbsHome, path: `/${role.toLowerCase()}` }];
    if (role === 'OFFICER') {
      items.push({ label: t.header.officerBreadcrumb, path: '/officer' });
      items.push({ label: t.header.queueBreadcrumb, path: '/officer' });
    } else if (role === 'ADMIN') {
      items.push({ label: t.header.adminBreadcrumb, path: '/admin' });
      if (currentPath === '/admin/evaluation') {
        items.push({ label: t.header.benchmarkBreadcrumb, path: '/admin/evaluation' });
      } else {
        items.push({ label: t.header.rulesBreadcrumb, path: '/admin' });
      }
    } else if (role === 'APPLICANT') {
      items.push({ label: t.header.applicantBreadcrumb, path: '/applicant' });
      items.push({ label: t.header.checklistBreadcrumb, path: '/applicant' });
    }
    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      {/* 1. Official National Tricolor Strip */}
      <div className="w-full flex h-1.5 shrink-0" aria-hidden="true">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* 2. Mandatory Statutory Legal Principle Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900 px-3 sm:px-6 py-1.5 text-xs text-amber-900 dark:text-amber-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 truncate">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded shrink-0">
              Decision Support Only
            </span>
            <span className="truncate text-[11px] font-medium">
              {t.header.principleBanner}
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-3 text-[11px] text-amber-800 dark:text-amber-300 shrink-0">
            <span>Statutory Scrutiny System</span>
            <span>•</span>
            <span>AICTE Approval Process 2026-27</span>
          </div>
        </div>
      </div>

      {/* 3. Main Government Header Bar with AICTE Logo */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Menu button on small screens + Official AICTE Logo + Portal Name */}
        <div className="flex items-center space-x-3">
          <button
            ref={menuButtonRef}
            onClick={onToggleSidebar}
            aria-expanded={isSidebarOpen}
            aria-label={t.common.primaryNavigation}
            className="p-1.5 rounded lg:hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* AICTE Official Logo (80-96px height, white backing, light/dark mode readable) */}
          <AicteLogo size="normal" />

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                {t.header.appTitle}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold bg-govNavy-100 dark:bg-govNavy-900 text-govNavy-900 dark:text-govNavy-200 border border-govNavy-300 dark:border-govNavy-700 px-1.5 py-0.2 rounded">
                Official
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-1">
              All India Council for Technical Education • Statutory Regulatory Scrutiny
            </div>
          </div>
        </div>

        {/* Right: Only Language selector, Light/Dark toggle, Notification bell, Profile menu with Logout */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
          {/* Notification Alerts Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500"
              title="System Alerts Feed"
              aria-label="System Alerts Feed"
              aria-haspopup="true"
              aria-expanded={showAlertsDropdown}
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-lg z-50 p-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    System Alerts & Risk Warnings
                  </span>
                  <span className="text-[10px] text-red-600 font-bold bg-red-50 dark:bg-red-950 px-1.5 py-0.2 rounded border border-red-200 dark:border-red-900">
                    {alerts.length} Active
                  </span>
                </div>
                <div className="space-y-2">
                  {alerts.map(al => (
                    <div 
                      key={al.id} 
                      className={`p-2.5 rounded text-xs border ${
                        al.level === 'CRITICAL' 
                          ? 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200' 
                          : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                        <span className="truncate">{al.title}</span>
                      </div>
                      <p className="text-[11px] opacity-85 mt-1">{al.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8-Language Switcher Dropdown */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1">
            <Globe2 className="w-3.5 h-3.5 mr-1 text-slate-500 shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-hidden cursor-pointer"
              aria-label={t.header.langLabel}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {opt.nativeName} ({opt.name})
                </option>
              ))}
            </select>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-govNavy-900 dark:focus:ring-blue-500"
            title={theme === 'dark' ? t.header.themeLight : t.header.themeDark}
            aria-label={theme === 'dark' ? t.header.themeLight : t.header.themeDark}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Logged in User Profile Menu + Logout */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block text-right">
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || 'Dr. S. K. Sharma'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {role}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 border border-slate-300 dark:border-slate-700 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors focus:outline-hidden focus:ring-2 focus:ring-red-500"
              title="Logout of Scrutiny Session"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Official Government Breadcrumbs Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-1.5 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-1.5 overflow-x-auto">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path + idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 rtl:rotate-180" />}
              <button
                onClick={() => onNavigate(crumb.path)}
                className={`truncate hover:underline ${
                  idx === breadcrumbs.length - 1
                    ? 'font-bold text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );
};
