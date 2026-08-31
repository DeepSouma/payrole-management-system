'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Layers,
  Sparkles,
  ShieldAlert,
  CreditCard,
  PlusCircle,
  X,
} from 'lucide-react';
import {
  useSalaryComponents,
  useSalaryStructures,
  useCreateSalaryComponent,
  useCreateSalaryStructure,
} from '@/hooks/use-payroll-data';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function SalaryStructuresPage() {
  const { canManagePayroll } = useAuth();
  const { data: compData, isLoading: compLoading } = useSalaryComponents();
  const { data: structData, isLoading: structLoading } = useSalaryStructures();

  const createCompMutation = useCreateSalaryComponent();
  const createStructMutation = useCreateSalaryStructure();

  const [activeTab, setActiveTab] = useState<'structures' | 'components'>('structures');
  const [showCompModal, setShowCompModal] = useState(false);
  const [showStructModal, setShowStructModal] = useState(false);

  // Component Form State
  const [compForm, setCompForm] = useState({
    name: '',
    code: '',
    type: 'EARNING',
    calculationType: 'FIXED',
    defaultAmount: 5000,
    percentageValue: 10,
    isTaxable: true,
    description: '',
  });

  // Structure Form State
  const [structForm, setStructForm] = useState({
    name: '',
    code: '',
    description: '',
    selectedComponents: [] as Array<{
      componentId: string;
      type: string;
      calculationType: string;
      value: number;
    }>,
  });

  const components = compData?.components || [];
  const structures = structData?.structures || [];

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompMutation.mutateAsync(compForm);
      setCompForm({
        name: '',
        code: '',
        type: 'EARNING',
        calculationType: 'FIXED',
        defaultAmount: 5000,
        percentageValue: 10,
        isTaxable: true,
        description: '',
      });
      setShowCompModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create component');
    }
  };

  const handleOpenStructModal = () => {
    const defaultItems = components.slice(0, 4).map((c: any) => ({
      componentId: c.id,
      type: c.type,
      calculationType: c.calculationType,
      value: c.calculationType === 'FIXED' ? (c.defaultAmount || 5000) : (c.percentageValue || 10),
    }));
    setStructForm({
      name: '',
      code: `GRD-${structures.length + 1}`,
      description: 'Standard compensation grade definition',
      selectedComponents: defaultItems,
    });
    setShowStructModal(true);
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStructMutation.mutateAsync({
        name: structForm.name,
        code: structForm.code,
        description: structForm.description,
        items: structForm.selectedComponents,
      });
      setShowStructModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create structure');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Compensation Configuration</span>
            <SandboxBeacon
              title="Statutory Compensation Matrix"
              description="Structures combine taxable base pay with allowances (HRA, DA, Special) and enforce automated statutory deductions (EPF 12%, ESI 0.75%, PT slabs)."
              category="formula"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            Salary Structures & Components
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure salary formulas, earnings elements, statutory deductions, and multi-tier compensation packages.
          </p>
        </div>

        {canManagePayroll && (
          <div className="flex items-center gap-3">
            <GuideTooltip
              title="Create Custom Salary Component"
              description="Define a new Earning or Deduction element with fixed amounts or dynamic % of Basic/Gross rules."
              category="action"
              tip="Add custom allowances like 'Performance Bonus' or 'Travel Allowance'."
              position="bottom"
            >
              <button
                onClick={() => setShowCompModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 border border-slate-700 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                <span>New Component</span>
              </button>
            </GuideTooltip>

            <GuideTooltip
              title="Build Complete Salary Structure Template"
              description="Bundle earnings and statutory deductions into a standardized grade template to assign across employee designations."
              category="action"
              tip="Create a grade (e.g. 'Grade A - Executive') to assign in employee profiles."
              position="bottom"
            >
              <button
                onClick={handleOpenStructModal}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create Structure</span>
              </button>
            </GuideTooltip>
          </div>
        )}
      </div>

      {/* Statutory Rules Cheat Sheet Cards */}
      <div id="tour-salary-formulas" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GuideTooltip
          title="Employees' Provident Fund (EPF)"
          description="Employee contributes 12% of Basic pay (statutory ceiling: ₹15,000 basic / ₹1,800 max deduction per month). Employer matches 12%."
          category="formula"
          formula="EPF = min(Basic, 15000) * 12%"
          position="top"
          wrapperClassName="w-full"
        >
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors h-full cursor-help">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-indigo-300">EPF (Provident Fund)</span>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-200 px-1.5 py-0.5 rounded font-bold">12%</span>
            </div>
            <p className="text-[11px] text-slate-300">12% of Basic (capped at ₹15k wage ceiling)</p>
          </div>
        </GuideTooltip>

        <GuideTooltip
          title="Employees' State Insurance (ESI)"
          description="Mandatory medical cover for employees with monthly gross wage up to ₹21,000. Employee deduction: 0.75% of Gross, Employer: 3.25%."
          category="formula"
          formula="ESI = (Gross <= 21000) ? (Gross * 0.75%) : 0"
          position="top"
          wrapperClassName="w-full"
        >
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors h-full cursor-help">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-emerald-300">ESI (Medical Cover)</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded font-bold">0.75%</span>
            </div>
            <p className="text-[11px] text-slate-300">0.75% of Gross (wage limit ≤ ₹21,000/mo)</p>
          </div>
        </GuideTooltip>

        <GuideTooltip
          title="Professional Tax (PT)"
          description="State-mandated tax on earned livelihood with slab-based brackets (typical maximum: ₹200/month or ₹2,500/year)."
          category="formula"
          formula="PT = ₹200 for Gross >= ₹15,000"
          position="top"
          wrapperClassName="w-full"
        >
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/40 transition-colors h-full cursor-help">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-purple-300">Professional Tax (PT)</span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded font-bold">Slab</span>
            </div>
            <p className="text-[11px] text-slate-300">State statutory slab rate (₹0 - ₹200/mo)</p>
          </div>
        </GuideTooltip>

        <GuideTooltip
          title="Income Tax TDS (Form 24Q)"
          description="Monthly Tax Deducted at Source based on annual income tax projections and declaration regimes."
          category="formula"
          formula="TDS = (Annual Tax Liability - Rebates) / 12"
          position="top"
          wrapperClassName="w-full"
        >
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 hover:border-amber-500/40 transition-colors h-full cursor-help">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-amber-300">Income Tax TDS</span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded font-bold">TDS</span>
            </div>
            <p className="text-[11px] text-slate-300">Withholding tax projected for Form 24Q</p>
          </div>
        </GuideTooltip>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'structures'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Salary Structures ({structures.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'components'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Components Catalog ({components.length})</span>
        </button>
      </div>

      {/* Tab 1: Salary Structures */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {structures.map((struct: any) => (
            <div
              key={struct.id}
              className="glass-panel glass-panel-hover p-6 rounded-3xl space-y-5 border border-slate-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold dark:text-white text-slate-900">{struct.name}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                      {struct.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{struct.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  {struct.assignments?.length || 0} Assigned
                </span>
              </div>

              {/* Component breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Structure Formula & Components
                </span>
                <div className="space-y-1.5">
                  {struct.items?.map((item: any) => {
                    const isEarning = item.type === 'EARNING';
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isEarning ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span className="font-semibold text-slate-200">{item.component?.name}</span>
                          <span className="text-[10px] text-slate-500">({item.component?.code})</span>
                        </div>
                        <div className="font-mono text-slate-300 font-medium">
                          {item.calculationType === 'PERCENTAGE_OF_BASIC'
                            ? `${item.value}% of Basic`
                            : item.calculationType === 'PERCENTAGE_OF_GROSS'
                            ? `${item.value}% of Gross`
                            : formatCurrency(item.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Components Catalog */}
      {activeTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {components.map((comp: any) => {
            const isEarning = comp.type === 'EARNING';
            return (
              <div
                key={comp.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-xs font-mono font-bold text-slate-300">
                    {comp.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isEarning
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {comp.type}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{comp.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{comp.description || 'Configurable component'}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Rule:{' '}
                    <strong className="text-slate-200">
                      {comp.calculationType === 'PERCENTAGE_OF_BASIC'
                        ? `${comp.percentageValue}% Basic`
                        : comp.calculationType === 'PERCENTAGE_OF_GROSS'
                        ? `${comp.percentageValue}% Gross`
                        : formatCurrency(comp.defaultAmount)}
                    </strong>
                  </span>
                  <span>{comp.isTaxable ? 'Taxable' : 'Exempt'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Component Modal */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold dark:text-white text-slate-900">Create Salary Component</h2>
              <button
                onClick={() => setShowCompModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateComponent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Component Name *</label>
                <input
                  required
                  placeholder="e.g. Internet & Device Allowance"
                  value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Code *</label>
                  <input
                    required
                    placeholder="e.g. INT_ALW"
                    value={compForm.code}
                    onChange={(e) => setCompForm({ ...compForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={compForm.type}
                    onChange={(e) => setCompForm({ ...compForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="EARNING">EARNING</option>
                    <option value="DEDUCTION">DEDUCTION</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Calculation Type</label>
                  <select
                    value={compForm.calculationType}
                    onChange={(e) => setCompForm({ ...compForm, calculationType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="FIXED">FIXED AMOUNT</option>
                    <option value="PERCENTAGE_OF_BASIC">% OF BASIC</option>
                    <option value="PERCENTAGE_OF_GROSS">% OF GROSS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Value (₹ or %)</label>
                  <input
                    type="number"
                    value={compForm.calculationType === 'FIXED' ? compForm.defaultAmount : compForm.percentageValue}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (compForm.calculationType === 'FIXED') setCompForm({ ...compForm, defaultAmount: v });
                      else setCompForm({ ...compForm, percentageValue: v });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isTaxable"
                  checked={compForm.isTaxable}
                  onChange={(e) => setCompForm({ ...compForm, isTaxable: e.target.checked })}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isTaxable" className="text-xs text-slate-300">
                  Subject to Income Tax Withholding (TDS)
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCompMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                >
                  {createCompMutation.isPending ? 'Creating...' : 'Save Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Salary Structure Modal */}
      {showStructModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold dark:text-white text-slate-900">Build Salary Structure Package</h2>
              <button
                onClick={() => setShowStructModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Structure Name *</label>
                  <input
                    required
                    placeholder="e.g. Staff Engineering Tier 1"
                    value={structForm.name}
                    onChange={(e) => setStructForm({ ...structForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Code *</label>
                  <input
                    required
                    value={structForm.code}
                    onChange={(e) => setStructForm({ ...structForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  value={structForm.description}
                  onChange={(e) => setStructForm({ ...structForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Select & Configure Attached Components
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {components.map((comp: any) => {
                    const selected = structForm.selectedComponents.find((c) => c.componentId === comp.id);
                    return (
                      <div
                        key={comp.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          selected
                            ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-100'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setStructForm({
                                  ...structForm,
                                  selectedComponents: [
                                    ...structForm.selectedComponents,
                                    {
                                      componentId: comp.id,
                                      type: comp.type,
                                      calculationType: comp.calculationType,
                                      value:
                                        comp.calculationType === 'FIXED'
                                          ? comp.defaultAmount || 5000
                                          : comp.percentageValue || 10,
                                    },
                                  ],
                                });
                              } else {
                                setStructForm({
                                  ...structForm,
                                  selectedComponents: structForm.selectedComponents.filter(
                                    (c) => c.componentId !== comp.id
                                  ),
                                });
                              }
                            }}
                            className="rounded border-slate-800 text-indigo-600"
                          />
                          <span className="font-semibold">{comp.name}</span>
                          <span className="text-[10px] text-slate-500">({comp.type})</span>
                        </div>
                        {selected && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Rule Value:</span>
                            <input
                              type="number"
                              value={selected.value}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setStructForm({
                                  ...structForm,
                                  selectedComponents: structForm.selectedComponents.map((item) =>
                                    item.componentId === comp.id ? { ...item, value: val } : item
                                  ),
                                });
                              }}
                              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStructModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStructMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                >
                  {createStructMutation.isPending ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
