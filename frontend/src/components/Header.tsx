import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Bell, 
  Info,
  Globe2,
  Sun,
  Moon,
  Keyboard,
  Compass,
  Activity,
  Network,
  BookOpen,
  FileText,
  LogOut,
  User,
  Sliders,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { AlertItem, UserRole } from '../types';
import { LANGUAGE_OPTIONS } from '../locales';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (v: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { 
    user,
    logout,
    role, 
    setRole, 
    theme, 
    toggleTheme,
    textSize,
    toggleTextSize,
    lang, 
    setLang,
    t, 
    selectedAppId,
    setIsTamperDemoOpen,
    setIsAuditModalOpen,
    setIsLinkGraphOpen,
    setIsModelCardOpen,
    setIsHealthCheckOpen,
    setIsTourOpen,
    setIsShortcutsOpen
  } = useApp();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    api.getAdminAlerts()
      .then(data => setAlerts(data))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      {/* 1. Mandatory Legal Product Principle Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900 px-4 py-1.5 text-xs text-amber-900 dark:text-amber-200">
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
            <span>Official Scrutiny System</span>
            <span>•</span>
            <span>AICTE Approval Process 2026-27</span>
          </div>
        </div>
      </div>

      {/* 2. Main Official Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Emblem placeholder + Portal Name */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-govNavy-900 border border-govNavy-950 flex items-center justify-center text-white shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-govSaffron-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                {t.header.appTitle}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-1.5 py-0.2 rounded">
                Prototype
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              All India Council for Technical Education • Statutory Scrutiny
            </div>
          </div>
        </div>

        {/* Center/Right: Quick Action Bar */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs">
          {/* Tamper Forensics Pill Button */}
          <button
            onClick={() => setIsTamperDemoOpen(true)}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold transition-colors shadow-xs"
            title="Open Tamper Forensics Demo"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Tamper Demo</span>
          </button>

          {/* Audit Ledger Pill Button */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Inspect Hash-Chained Audit Trail"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Audit Trail</span>
          </button>

          {/* Link Graph Pill Button */}
          <button
            onClick={() => setIsLinkGraphOpen(true)}
            className="hidden lg:flex items-center space-x-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Cross-Application Fraud Link Graph"
          >
            <Network className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Link Graph</span>
          </button>

          {/* Model Card Pill Button */}
          <button
            onClick={() => setIsModelCardOpen(true)}
            className="hidden xl:flex items-center space-x-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Model Card & Fairness Statement"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Model Card</span>
          </button>

          {/* System Health Diagnostics */}
          <button
            onClick={() => setIsHealthCheckOpen(true)}
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="System Service Diagnostics"
          >
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Guided Tour */}
          <button
            onClick={() => setIsTourOpen(true)}
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Guided Tour"
          >
            <Compass className="w-4 h-4 text-govNavy-700 dark:text-blue-400" />
          </button>

          {/* Keyboard Shortcuts Help */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-mono font-bold transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Alerts Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative"
              title="System Alerts Feed"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-lg z-50 p-3 max-h-96 overflow-y-auto">
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
            <Globe2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
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
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={theme === 'dark' ? t.header.themeLight : t.header.themeDark}
            aria-label={theme === 'dark' ? t.header.themeLight : t.header.themeDark}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Text Size (A- / A+) */}
          <button
            onClick={toggleTextSize}
            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-mono font-bold text-xs"
            title="Text size scale (A- / A+)"
          >
            {textSize === 'normal' ? 'A+' : 'A-'}
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Logged in User Pill + Sign Out */}
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
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 border border-slate-300 dark:border-slate-700 text-slate-600 hover:text-red-600 transition-colors"
              title="Sign Out of Scrutiny Session"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
