import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
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
  Zap 
} from 'lucide-react';
import { api } from '../services/api';
import { AdminKPIs, RuleConfigItem, AlertItem } from '../types';

export const AdminDashboard: React.FC = () => {
  const { showToast, t } = useApp();
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [rules, setRules] = useState<RuleConfigItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded">
            Council Administration & Policy Engine
          </span>
          <span className="text-xs text-slate-400">AICTE Approval Process 2026-27</span>
        </div>
        <h1 className="text-xl font-black text-white mt-1">
          {t.admin.dashboardTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {t.admin.subheading}
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Applications Processed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.admin.kpiProcessed}</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{kpis?.applications_processed || 0}</span>
            <span className="text-xs text-slate-400">of {kpis?.total_applications || 30} Total</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>Pending Scrutiny:</span>
            <strong className="text-amber-400">{kpis?.applications_pending || 0} Dossiers</strong>
          </div>
        </div>

        {/* KPI 2: Verification Time Saved */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.admin.kpiAvgTime}</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400">{kpis?.avg_verification_time_minutes || 1.2} min</span>
            <span className="text-xs text-slate-400 line-through">18.5 min manual</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center justify-between border-t border-slate-800 pt-2 font-semibold">
            <span>Throughput Gain:</span>
            <span>{kpis?.time_saved_percent || 93.5}% Time Saved</span>
          </div>
        </div>

        {/* KPI 3: Active Flags */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Regulatory Flags</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-orange-400">{kpis?.total_flags_detected || 0}</span>
            <span className="text-xs text-slate-400">Across Categories</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2 border-t border-slate-800 pt-2">
            <span>Val: {kpis?.flags_by_type?.VALIDATION || 0}</span>
            <span>•</span>
            <span>Anom: {kpis?.flags_by_type?.ANOMALY || 0}</span>
            <span>•</span>
            <span>Infra: {kpis?.flags_by_type?.INFRASTRUCTURE || 0}</span>
          </div>
        </div>

        {/* KPI 4: False Positive Rate from Officer Feedback */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>{t.admin.kpiFalsePos}</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-blue-400">
              {kpis?.officer_feedback_stats?.false_positive_rate_percent || 3.8}%
            </span>
            <span className="text-xs text-slate-400">Derived from Officer Votes</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>Reviews Logged:</span>
            <strong className="text-slate-200">{kpis?.officer_feedback_stats?.total_reviews || 0}</strong>
          </div>
        </div>
      </div>

      {/* Configurable Rules Engine Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>{t.admin.rulesTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Adjust risk weights and enable/disable rules dynamically. Updates take effect immediately in the scrutiny pipeline.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="py-2.5 px-3">{t.admin.ruleName}</th>
                <th className="py-2.5 px-3">{t.admin.category}</th>
                <th className="py-2.5 px-3">{t.admin.severity}</th>
                <th className="py-2.5 px-3">{t.admin.riskPoints}</th>
                <th className="py-2.5 px-3">{t.admin.status}</th>
                <th className="py-2.5 px-3 text-right">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-950/40">
                  <td className="py-3 px-3">
                    <strong className="text-slate-200 block">{rule.name}</strong>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{rule.description}</span>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-300">
                    {rule.category}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rule.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                      rule.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <input
                      type="number"
                      defaultValue={rule.risk_points}
                      onBlur={(e) => handleUpdatePoints(rule.id, parseInt(e.target.value) || rule.risk_points)}
                      className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-amber-400 text-center focus:outline-none focus:border-blue-500"
                    />
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[11px] font-bold ${rule.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.enabled)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        rule.enabled
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Regulatory Alerts Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-orange-400" />
              <span>{t.admin.alertsTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Simulated real-time email & in-app alerts dispatched for expiring certificates, hash collisions, and high-risk applications.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {alerts.length} Notifications
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                al.level === 'CRITICAL'
                  ? 'bg-red-950/30 border-red-900/50 text-red-200'
                  : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    al.level === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {al.level}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {al.timestamp.slice(0, 10)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 text-xs mb-1">
                  {al.title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {al.details}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 font-mono text-[10px] text-slate-400">
                Application: {al.application_id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
