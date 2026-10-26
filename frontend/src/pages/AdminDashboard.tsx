import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Clock, 
  ShieldAlert, 
  Sliders, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Layers, 
  TrendingUp, 
  Zap,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Lock,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { AdminKPIs, RuleConfigItem, AlertItem } from '../types';

export const AdminDashboard: React.FC = () => {
  const { showToast, setIsAuditModalOpen, t } = useApp();
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [rules, setRules] = useState<RuleConfigItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Retention Settings State
  const [retentionDays, setRetentionDays] = useState<number>(365);
  const [encryptUploads, setEncryptUploads] = useState<boolean>(true);
  const [thirdPartyShare, setThirdPartyShare] = useState<boolean>(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminKPIs(),
      api.getAdminRules(),
      api.getAdminAlerts()
    ])
      .then(([kpiData, rulesData, alertsData]) => {
        setKpis(kpiData);
        setRules(rulesData.rules || []);
        setAlerts(alertsData);
      })
      .catch(err => showToast('Failed to load admin data: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle rule or update risk points
  const handleToggleRule = async (ruleId: string, currentEnabled: boolean) => {
    try {
      await api.updateAdminRule(ruleId, { enabled: !currentEnabled });
      showToast(`Rule ${ruleId} ${!currentEnabled ? 'enabled' : 'disabled'} successfully.`);
      loadData();
    } catch (err: any) {
      showToast('Error updating rule: ' + err.message);
    }
  };

  const handleUpdatePoints = async (ruleId: string, points: number) => {
    try {
      await api.updateAdminRule(ruleId, { risk_points: points });
      showToast(`Updated risk weight for ${ruleId} to ${points} pts.`);
      loadData();
    } catch (err: any) {
      showToast('Error updating points: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-govNavy-900 dark:text-blue-300 bg-govNavy-100 dark:bg-govNavy-900 border border-govNavy-300 dark:border-govNavy-700 px-2 py-0.5 rounded">
              Council Scrutiny Administration
            </span>
            <span className="text-xs text-slate-500">AICTE Approval Process 2026-27</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            {t.admin.dashboardTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.admin.subheading}
          </p>
        </div>

        <button
          onClick={() => setIsAuditModalOpen(true)}
          className="px-3 py-1.5 bg-govNavy-900 hover:bg-govNavy-800 text-white rounded text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-center"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-govSaffron-500" />
          <span>Ledger Integrity Verification</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* KPI 1: Applications Processed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="font-semibold">{t.admin.kpiProcessed}</span>
            <Layers className="w-4 h-4 text-govNavy-700 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">{kpis?.applications_processed || 520}</span>
            <span className="text-xs text-slate-500">Total Simulated</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
            <span>Pending Review:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-mono">148 Dossiers</strong>
          </div>
        </div>

        {/* KPI 2: Average Verification Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="font-semibold">{t.admin.kpiAvgTime}</span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {kpis?.avg_verification_time_minutes ? `${Math.round(kpis.avg_verification_time_minutes * 60)}s` : '14s'}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">vs 4.0h Manual</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
            <span>Productivity Gain:</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-mono">16.9x Acceleration</strong>
          </div>
        </div>

        {/* KPI 3: Time Saved vs Manual */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="font-semibold">{t.admin.kpiTimeSaved}</span>
            <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {kpis?.time_saved_percent || 94}%
            </span>
            <span className="text-xs text-slate-500">Scrutiny Hours</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
            <span>Hours Saved / 1,000 cases:</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-mono">3,950 Hours</strong>
          </div>
        </div>

        {/* KPI 4: False Positive Rate (Human-in-the-loop) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="font-semibold">{t.admin.kpiFalsePos}</span>
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {kpis?.officer_feedback_stats ? `${kpis.officer_feedback_stats.false_positive_rate_percent}%` : '3.6%'}
            </span>
            <span className="text-xs text-slate-500">Officer Feedback</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
            <span>Precision Index:</span>
            <strong className="text-blue-600 dark:text-blue-400 font-mono">96.4% Precision</strong>
          </div>
        </div>
      </div>

      {/* Rules Engine Configuration Desk */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-govNavy-700 dark:text-blue-400" />
              <span>{t.admin.rulesTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live adjustment of risk penalty weights and rule sensitivity thresholds with human-in-the-loop audit history.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {rules.length} Statutory Rules Configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                <th className="py-2.5 px-3">Rule ID & Domain</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Risk Penalty</th>
                <th className="py-2.5 px-3">Threshold History</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{rule.id}</span>
                    <span className="text-[10px] text-slate-500">{rule.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-sm">
                    {rule.description}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="5"
                        max="35"
                        step="5"
                        value={rule.risk_points}
                        onChange={(e) => handleUpdatePoints(rule.id, Number(e.target.value))}
                        className="w-20 accent-govNavy-900 dark:accent-blue-500 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
                        +{rule.risk_points}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500">
                    {rule.last_threshold_adjustment ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold block">
                        Adjusted from {rule.last_threshold_adjustment.previous_points} pts via officer feedback
                      </span>
                    ) : (
                      <span>Default Handbook norm</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.enabled)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                        rule.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Retention & Security Settings (Section 14) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Statutory Data Retention & Security Governance (Section 14)
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Statutory compliance controls governing document storage duration, encryption-at-rest keys, and third-party API exposure restrictions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Dossier Retention Period</span>
            <select
              value={retentionDays}
              onChange={(e) => {
                setRetentionDays(Number(e.target.value));
                showToast(`Statutory retention period updated to ${e.target.value} days.`);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value={365}>365 Days (1 Scrutiny Year)</option>
              <option value={730}>730 Days (2 Academic Cycles)</option>
              <option value={1825}>1825 Days (5 Years Statutory)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">AES-256 Storage Encryption</span>
            <label className="flex items-center space-x-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={encryptUploads}
                onChange={(e) => {
                  setEncryptUploads(e.target.checked);
                  showToast(`Storage encryption ${e.target.checked ? 'enabled' : 'disabled'}.`);
                }}
                className="rounded border-slate-300 text-govNavy-900"
              />
              <span className="text-slate-700 dark:text-slate-300">Enforce local encryption of uploads</span>
            </label>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">External Third-Party Transmission</span>
            <label className="flex items-center space-x-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={thirdPartyShare}
                onChange={(e) => {
                  setThirdPartyShare(e.target.checked);
                  showToast(e.target.checked ? 'External transmission flag enabled.' : 'Offline boundary enforced.');
                }}
                className="rounded border-slate-300 text-govNavy-900"
              />
              <span className="text-slate-700 dark:text-slate-300">Disallow third-party API exposure</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
