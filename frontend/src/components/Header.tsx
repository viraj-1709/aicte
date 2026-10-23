import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  FileCheck2, 
  User, 
  LayoutDashboard, 
  BarChart3, 
  Bell, 
  Globe2, 
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { AlertItem } from '../types';

export const Header: React.FC = () => {
  const { 
    role, 
    setRole, 
    lang, 
    setLang, 
    t, 
    setIsTamperDemoOpen, 
    showToast 
  } = useApp();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  useEffect(() => {
    api.getAdminAlerts()
      .then(data => setAlerts(data))
      .catch(() => {});
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* 1. Mandatory Legal Product Principle Banner */}
      <div className="bg-gradient-to-r from-amber-900/90 via-orange-950/90 to-amber-900/90 border-b border-amber-600/40 px-4 py-1.5 text-xs text-amber-200/95 flex items-center justify-between shadow-inner">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
          <span className="flex items-center gap-1 font-bold text-amber-300 uppercase tracking-wider bg-amber-900/80 px-2 py-0.5 rounded border border-amber-500/30 text-[10px] shrink-0">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Decision Support System
          </span>
          <span className="truncate font-medium">
            {t.header.principle}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 via-govNavy-900 to-slate-950 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-950/50">
            <ShieldCheck className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                AICTE Validation Platform
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                SIH 2026
              </span>
              <span className="text-[10px] font-bold bg-amber-500/20 text-orange-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                CrashCoders
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Approval Process 2026-27</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Govt Regulatory Sandbox Active
              </span>
            </div>
          </div>
        </div>

        {/* Center: Role Switcher Tabs */}
        <div className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setRole('OFFICER')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'OFFICER'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.header.roleOfficer}</span>
          </button>

          <button
            onClick={() => setRole('APPLICANT')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'APPLICANT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.header.roleApplicant}</span>
          </button>

          <button
            onClick={() => setRole('ADMIN')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t.header.roleAdmin}</span>
          </button>

          <button
            onClick={() => setRole('EVALUATION')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              role === 'EVALUATION'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t.header.roleEval}</span>
          </button>
        </div>

        {/* Right Actions: Standout Tamper Demo, Alerts, Language */}
        <div className="flex items-center space-x-2.5">
          {/* STANDOUT FEATURE: Tamper Demo Mode Button */}
          <button
            onClick={() => setIsTamperDemoOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-extrabold shadow-lg shadow-orange-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all border border-orange-400/40"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>{t.header.tamperDemo}</span>
          </button>

          {/* Alerts Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors relative border border-slate-700/50"
              title={t.header.alerts}
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">Regulatory Alerts Feed</span>
                  <span className="text-[10px] text-slate-400">{alerts.length} active notifications</span>
                </div>
                <div className="space-y-2">
                  {alerts.slice(0, 6).map(al => (
                    <div 
                      key={al.id} 
                      className={`p-2 rounded-lg text-xs border ${
                        al.level === 'CRITICAL' 
                          ? 'bg-red-950/40 border-red-800/60 text-red-200' 
                          : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-100 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" />
                        <span className="truncate">{al.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{al.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Toggle: EN / हिन्दी */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50 text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded font-semibold transition-all ${
                lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded font-semibold transition-all ${
                lang === 'hi' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
