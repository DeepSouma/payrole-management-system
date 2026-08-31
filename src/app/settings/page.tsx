'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Building2, Percent, CheckCircle2, Save } from 'lucide-react';
import { useSettings, useUpdateSettings } from '@/hooks/use-payroll-data';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    taxId: '',
    currencySymbol: '₹',
    currencyCode: 'INR',
    workingDaysPerMonth: 30,
    payrollCutoffDay: 25,
    pfPercentage: 12.0,
    defaultTaxRate: 10.0,
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (data?.setting) {
      setForm(data.setting);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(form);
      setNotification('Organization settings and statutory rules successfully saved!');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Administration</span>
          <SandboxBeacon
            title="Master Entity & Statutory Configuration"
            description="Global settings that govern tax withholdings, EPF statutory contributions, month divisor days, and legal entity letterhead on payslips."
            category="compliance"
            variant="pill"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
          Organization & Compliance Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configure corporate entity credentials, statutory PF rates, tax withholdings, and pay frequencies.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {/* Company Profile */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Corporate Identity & Letterhead</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tax ID / GSTIN</label>
              <input
                required
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
              <input
                type="email"
                required
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                value={form.companyPhone}
                onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Business Address</label>
              <input
                value={form.companyAddress}
                onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Statutory Rules */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            <span>Payroll Computation & Statutory Rates</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol</label>
              <input
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="block text-xs font-semibold text-slate-300">Statutory PF Rate (%)</label>
                <SandboxBeacon
                  title="EPF Statutory Contribution Rate"
                  description="Standard statutory employee provident fund withholding rate (defaults to 12.0%)."
                  category="compliance"
                />
              </div>
              <input
                type="number"
                step="0.1"
                value={form.pfPercentage}
                onChange={(e) => setForm({ ...form, pfPercentage: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="block text-xs font-semibold text-slate-300">Baseline Tax (TDS) Rate (%)</label>
                <SandboxBeacon
                  title="Income Tax TDS Rate"
                  description="Baseline withholding tax percentage applied against taxable gross brackets."
                  category="compliance"
                />
              </div>
              <input
                type="number"
                step="0.1"
                value={form.defaultTaxRate}
                onChange={(e) => setForm({ ...form, defaultTaxRate: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="block text-xs font-semibold text-slate-300">Standard Working Days / Month</label>
                <SandboxBeacon
                  title="LOP Month Divisor"
                  description="Base working days used by the Loss of Pay deduction formula (usually 30 days)."
                  category="formula"
                />
              </div>
              <input
                type="number"
                value={form.workingDaysPerMonth}
                onChange={(e) => setForm({ ...form, workingDaysPerMonth: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Cutoff Day</label>
              <input
                type="number"
                value={form.payrollCutoffDay}
                onChange={(e) => setForm({ ...form, payrollCutoffDay: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <GuideTooltip
            title="Save Organization Settings"
            description="Updates corporate parameters across the entire system and future payroll calculation runs."
            category="action"
            position="left"
          >
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </GuideTooltip>
        </div>
      </form>
    </div>
  );
}
