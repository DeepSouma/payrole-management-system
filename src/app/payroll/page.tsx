'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calculator,
  Play,
  CheckCircle2,
  Send,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileCheck,
  ChevronDown,
} from 'lucide-react';
import {
  usePayrollRuns,
  usePayrollRunDetails,
  useCalculatePayroll,
  useSubmitPayroll,
} from '@/hooks/use-payroll-data';
import { formatCurrency, getMonthName, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

function PayrollProcessContent() {
  const searchParams = useSearchParams();
  const urlRunId = searchParams.get('runId');

  const { user, canManagePayroll } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeRunId, setActiveRunId] = useState<string | null>(urlRunId);

  const { data: runsData, isLoading: runsLoading } = usePayrollRuns();
  const { data: runDetailsData, isLoading: runDetailsLoading } = usePayrollRunDetails(
    activeRunId || ''
  );

  const calculateMutation = useCalculatePayroll();
  const submitMutation = useSubmitPayroll();

  const [notification, setNotification] = useState<string | null>(null);

  const payrollRuns = runsData?.runs || [];
  const currentRun = runDetailsData?.run;

  useEffect(() => {
    if (urlRunId) {
      setActiveRunId(urlRunId);
    } else if (payrollRuns.length > 0 && !activeRunId) {
      setActiveRunId(payrollRuns[0].id);
    }
  }, [urlRunId, payrollRuns, activeRunId]);

  const handleRunCalculation = async () => {
    try {
      const res = await calculateMutation.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
        processedByUserId: user.id,
      });
      if (res.payrollRun) {
        setActiveRunId(res.payrollRun.id);
        setNotification(`Payroll for ${getMonthName(selectedMonth)} ${selectedYear} calculated successfully!`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to calculate payroll');
    }
  };

  const handleSubmitForReview = async () => {
    if (!activeRunId) return;
    try {
      await submitMutation.mutateAsync(activeRunId);
      setNotification('Payroll run successfully submitted for Manager Approval!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit payroll');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FINALIZED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'APPROVED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'UNDER_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Payroll Computation Wizard</span>
            <SandboxBeacon
              title="4-Step Calculation Engine"
              description="Batch processing engine that synchronizes attendance, computes gross salary, subtracts statutory EPF/ESI/TDS/PT and Loss-of-Pay deductions, and prepares itemized ledgers."
              category="action"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            Process Monthly Payroll
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Execute batch salary calculations with attendance inputs, LOP deductions, overtime, and statutory compliance.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <GuideTooltip
            title="Payroll Period Selection"
            description="Select the month and calendar year to execute the automated batch calculation run."
            category="workflow"
            position="bottom"
          >
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </GuideTooltip>

          {canManagePayroll && (
            <GuideTooltip
              title="Execute Calculation Engine"
              description="Triggers the automated engine. Pulls latest attendance inputs, computes EPF (12%), ESI (0.75%), PT slabs, TDS withholdings, and compiles employee ledger."
              category="action"
              tip="Click here to run or re-calculate August 2026 payroll."
              position="bottom"
            >
              <button
                id="tour-payroll-calc-btn"
                onClick={handleRunCalculation}
                disabled={calculateMutation.isPending}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{calculateMutation.isPending ? 'Calculating...' : 'Run Calculation Engine'}</span>
              </button>
            </GuideTooltip>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Payroll Workflow Steps Indicator */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <GuideTooltip
            title="Step 1: Attendance & Master Inputs"
            description="HR verifies employee attendance, approved leaves, and overtime hours in the attendance register."
            category="workflow"
            position="top"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-semibold cursor-help">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Draft & Inputs</span>
            </div>
          </GuideTooltip>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <GuideTooltip
            title="Step 2: Automated Batch Calculation"
            description="Engine calculates Gross pay, computes statutory PF/ESI/PT/TDS, and applies Loss of Pay deductions."
            category="action"
            position="top"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-semibold cursor-help">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Calculate Engine</span>
            </div>
          </GuideTooltip>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <GuideTooltip
            title="Step 3: HR Review & Verification"
            description="HR checks itemized payroll variance and submits the batch for Maker-Checker managerial approval."
            category="workflow"
            position="top"
          >
            <div className="flex items-center gap-2 text-amber-400 font-semibold cursor-help">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">3</span>
              <span>Review & Submit</span>
            </div>
          </GuideTooltip>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <GuideTooltip
            title="Step 4: Maker-Checker Manager Sign-off"
            description="Department and Finance managers inspect payroll figures and provide electronic sign-off."
            category="compliance"
            position="top"
          >
            <div className="flex items-center gap-2 text-blue-400 font-semibold cursor-help">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">4</span>
              <span>Manager Sign-Off</span>
            </div>
          </GuideTooltip>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <GuideTooltip
            title="Step 5: Finalization, Bank Transfer & Payslips"
            description="Run is locked, bank transfer files (NACH) are generated, and payslips are published to the employee portal."
            category="banking"
            position="top"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-semibold cursor-help">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">5</span>
              <span>Finalize & Payout</span>
            </div>
          </GuideTooltip>
        </div>
      </div>

      {/* Active Run Selector Dropdown / Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">Selected Payroll Run:</span>
          <select
            value={activeRunId || ''}
            onChange={(e) => setActiveRunId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-100 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            {payrollRuns.map((r: any) => (
              <option key={r.id} value={r.id}>
                {getMonthName(r.periodMonth)} {r.periodYear} ({r.status}) - {r.totalEmployees} Employees
              </option>
            ))}
          </select>
        </div>

        {currentRun && (
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(currentRun.status)}`}>
              Status: {currentRun.status.replace('_', ' ')}
            </span>

            {canManagePayroll && (currentRun.status === 'CALCULATED' || currentRun.status === 'REJECTED') && (
              <GuideTooltip
                title="Submit for Manager Review"
                description="Sends this calculated payroll batch to the Manager Approvals queue for official sign-off."
                category="action"
                tip="Click to submit, then switch role to 'Manager' to test the approval gate."
                position="left"
              >
                <button
                  onClick={handleSubmitForReview}
                  disabled={submitMutation.isPending}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition-all hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitMutation.isPending ? 'Submitting...' : 'Submit for Manager Review'}</span>
                </button>
              </GuideTooltip>
            )}
          </div>
        )}
      </div>

      {/* Current Run Metrics Summary */}
      {currentRun && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <GuideTooltip
            title="Total Workforce Processed"
            description="All active employees included in this calculation batch."
            category="stat"
            position="top"
            wrapperClassName="w-full"
          >
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 h-full cursor-help">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processed Staff</span>
              <div className="text-2xl font-extrabold text-white mt-1">{currentRun.totalEmployees} Employees</div>
              <div className="text-xs text-slate-400 mt-1">Calculated 100% dynamic</div>
            </div>
          </GuideTooltip>

          <GuideTooltip
            title="Total Gross Earnings"
            description="Combined gross salary earned before statutory deductions and taxes."
            category="formula"
            formula="Gross = Sum(Basic + HRA + Allowances + Overtime)"
            position="top"
            wrapperClassName="w-full"
          >
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 h-full cursor-help">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Gross Earnings</span>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">
                {formatCurrency(currentRun.totalGross)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Basic + Allowances + OT</div>
            </div>
          </GuideTooltip>

          <GuideTooltip
            title="Total Statutory & Tax Deductions"
            description="Total withholdings including EPF (12%), ESI (0.75%), Professional Tax, and TDS."
            category="formula"
            formula="Deductions = PF + ESI + PT + TDS + LOP"
            position="top"
            wrapperClassName="w-full"
          >
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 h-full cursor-help">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Deductions</span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                {formatCurrency(currentRun.totalDeductions)}
              </div>
              <div className="text-xs text-slate-400 mt-1">PF + TDS + LOP Deductions</div>
            </div>
          </GuideTooltip>

          <GuideTooltip
            title="Net Bank Payout (Disbursement)"
            description="Exact cash outflow transferred to employee bank accounts via NACH/NEFT."
            category="banking"
            formula="Net Pay = Total Gross - Total Deductions"
            position="top"
            wrapperClassName="w-full"
          >
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 h-full cursor-help">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Disbursement</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(currentRun.totalNet)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Payable to bank accounts</div>
            </div>
          </GuideTooltip>
        </div>
      )}

      {/* Itemized Calculation Records Table */}
      <div id="tour-payroll-ledger" className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
                Itemized Salary Breakdown & Calculations
              </h2>
              <SandboxBeacon
                title="Employee Calculation Register"
                description="Live itemized pay ledger displaying basic salary, attendance proration, overtime add-on, gross earnings, statutory EPF/TDS deductions, and final net payable."
                category="formula"
                variant="sparkle"
              />
            </div>
            <p className="text-xs text-slate-400">
              Detailed component-by-component ledger for each employee in this payroll period
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-3 py-3.5">
                  <div className="flex items-center gap-1">
                    <span>Basic</span>
                    <SandboxBeacon
                      title="Base Salary"
                      description="Assigned monthly basic wage."
                      category="formula"
                    />
                  </div>
                </th>
                <th className="px-3 py-3.5">
                  <div className="flex items-center gap-1">
                    <span>Attendance / LOP</span>
                    <SandboxBeacon
                      title="Attendance & LOP Deduction"
                      description="Loss of pay deducted pro-rata for unpaid absent days."
                      category="formula"
                    />
                  </div>
                </th>
                <th className="px-3 py-3.5">Overtime Pay</th>
                <th className="px-3 py-3.5">Gross Pay</th>
                <th className="px-3 py-3.5">
                  <div className="flex items-center gap-1">
                    <span>EPF (12%)</span>
                    <SandboxBeacon
                      title="Provident Fund Deduction"
                      description="12% of Basic salary (statutory ceiling: ₹15,000)."
                      category="formula"
                    />
                  </div>
                </th>
                <th className="px-3 py-3.5">Tax (TDS)</th>
                <th className="px-3 py-3.5">Total Deductions</th>
                <th className="px-4 py-3.5 font-bold text-emerald-400 text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {runDetailsLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    Loading calculation breakdown...
                  </td>
                </tr>
              ) : currentRun?.records?.length > 0 ? (
                currentRun.records.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">
                        {rec.employee.firstName} {rec.employee.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono text-indigo-400">
                        {rec.employee.employeeCode} • {rec.employee.department.name}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono">{formatCurrency(rec.basicSalary)}</td>
                    <td className="px-3 py-3">
                      <div>{rec.presentDays} / {rec.workingDays} Days</div>
                      {rec.lopDays > 0 ? (
                        <div className="text-rose-400 font-semibold">
                          -{formatCurrency(rec.lopDeduction)} ({rec.lopDays}d LOP)
                        </div>
                      ) : (
                        <span className="text-slate-500">No LOP</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {rec.overtimeAmount > 0 ? (
                        <span className="text-purple-400 font-semibold">
                          +{formatCurrency(rec.overtimeAmount)} ({rec.overtimeHours}h)
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-200">
                      {formatCurrency(rec.grossSalary)}
                    </td>
                    <td className="px-3 py-3 text-slate-300 font-mono">
                      {formatCurrency(rec.pfDeduction)}
                    </td>
                    <td className="px-3 py-3 text-slate-300 font-mono">
                      {formatCurrency(rec.taxDeduction)}
                    </td>
                    <td className="px-3 py-3 text-rose-400 font-semibold font-mono">
                      -{formatCurrency(rec.totalDeductions)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400 font-mono text-sm">
                      {formatCurrency(rec.netSalary)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No records found for this run. Click &quot;Run Calculation Engine&quot; to calculate now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PayrollProcessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading payroll engine...</div>}>
      <PayrollProcessContent />
    </Suspense>
  );
}

