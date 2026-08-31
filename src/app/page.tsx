'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Wallet,
  Clock,
  TrendingUp,
  ArrowRight,
  Calculator,
  PlusCircle,
  Receipt,
  Building2,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-payroll-data';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();
  const { user, canManagePayroll, canApprovePayroll } = useAuth();

  const stats = data?.stats;
  const departmentStats = data?.departmentStats || [];
  const recentRuns = data?.recentRuns || [];
  const settings = data?.settings;
  const currency = settings?.currencySymbol || '₹';

  const totalPayrollEst = departmentStats.reduce(
    (acc: number, curr: any) => acc + (curr.estimatedMonthlyCost || 0),
    0
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-900 border border-indigo-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Payroll Processing Center</span>
              <SandboxBeacon
                title="Payroll Command Center"
                description="This centralized hub connects HR attendance data, salary structure computation rules, manager approval gates, and banking disbursement APIs."
                category="workflow"
                tip="Use the action buttons on the right to simulate live payroll execution."
                variant="sparkle"
              />
            </div>
            <h1 className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Manage organization payroll calculations, verify employee attendance, handle approval workflows, and distribute automated payslips with zero discrepancies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManagePayroll && (
              <>
                <GuideTooltip
                  title="Run Payroll Engine (4-Step Pipeline)"
                  description="Launches the automated batch calculation engine. It pulls monthly attendance, applies statutory rules (PF, ESI, PT, TDS), and produces itemized pay registers."
                  category="action"
                  tip="Click here to calculate August 2026 payroll across all staff."
                  position="bottom"
                >
                  <Link
                    href="/payroll"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Run Payroll Engine</span>
                  </Link>
                </GuideTooltip>

                <GuideTooltip
                  title="Add New Employee Record"
                  description="Enrolls a new staff member with KYC documents, bank IFSC details, and assigns a customized salary structure."
                  category="feature"
                  tip="Try creating an employee with custom basic pay to see statutory deductions calculate."
                  position="bottom"
                >
                  <Link
                    href="/employees"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 border border-slate-700 transition-all"
                  >
                    <PlusCircle className="w-4 h-4 text-indigo-400" />
                    <span>Add Employee</span>
                  </Link>
                </GuideTooltip>
              </>
            )}
            {canApprovePayroll && stats?.pendingApprovalsCount > 0 && (
              <GuideTooltip
                title="Pending Manager Approvals"
                description="Payroll runs submitted by HR awaiting Maker-Checker sign-off before payouts can be disbursed."
                category="compliance"
                tip="Click to review breakdown, add audit comments, and approve or reject."
                position="bottom"
              >
                <Link
                  href="/approvals"
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
                >
                  <Clock className="w-4 h-4" />
                  <span>Pending Approvals ({stats.pendingApprovalsCount})</span>
                </Link>
              </GuideTooltip>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div id="tour-dashboard-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Employees */}
        <GuideTooltip
          title="Active Workforce Headcount"
          description="Total number of enrolled employees across all departments actively eligible for monthly payroll calculation."
          category="stat"
          tip="Employees with 'INACTIVE' status are automatically excluded from payroll runs."
          position="top"
          wrapperClassName="w-full"
        >
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Workforce
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
                {isLoading ? '...' : stats?.totalEmployees ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-emerald-400 font-medium">
                <span>{stats?.activeEmployees ?? 0} Active Staff</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">100% Enrolled</span>
              </div>
            </div>
          </div>
        </GuideTooltip>

        {/* Current Month Net Payout */}
        <GuideTooltip
          title="Net Monthly Disbursement Outflow"
          description="Actual net salary payable to employees after subtracting statutory deductions (EPF, ESI, Professional Tax, TDS) and Loss-of-Pay (LOP)."
          category="stat"
          formula="Net Pay = Gross Earnings - (EPF + ESI + PT + TDS + LOP)"
          tip="This represents the exact amount sent in the corporate bank NACH payout file."
          position="top"
          wrapperClassName="w-full"
        >
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Monthly Payout (Net)
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      stats?.latestPayroll?.totalNet || totalPayrollEst * 0.82,
                      currency
                    )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Period: {getMonthName(stats?.latestPayroll?.month || 8)}{' '}
                  {stats?.latestPayroll?.year || 2026}
                </span>
              </div>
            </div>
          </div>
        </GuideTooltip>

        {/* Gross Payroll Budget */}
        <GuideTooltip
          title="Total Gross Payroll & Statutory Deductions"
          description="Sum of all basic salaries and fixed/percentage allowances (HRA, DA, Special) before statutory and tax withholdings."
          category="formula"
          formula="Gross = Basic + HRA + DA + Allowances | Deductions = PF + ESI + PT + TDS"
          tip="Compare Gross vs Net to observe statutory withholdings across your workforce."
          position="top"
          wrapperClassName="w-full"
        >
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Gross Payroll
              </span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
                {isLoading
                  ? '...'
                  : formatCurrency(
                      stats?.latestPayroll?.totalGross || totalPayrollEst,
                      currency
                    )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span>
                  Est. Deductions:{' '}
                  <strong className="text-slate-300">
                    {formatCurrency(
                      stats?.latestPayroll?.totalDeductions || totalPayrollEst * 0.18,
                      currency
                    )}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </GuideTooltip>

        {/* Pending Approvals */}
        <GuideTooltip
          title="Approval Queue (Maker-Checker Gate)"
          description="Active payroll batches submitted by HR that require formal manager approval before finalization and bank disbursement."
          category="compliance"
          tip="Switch to Manager persona to review pending batches."
          position="top"
          wrapperClassName="w-full"
        >
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pending Approvals
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
                {isLoading ? '...' : stats?.pendingApprovalsCount ?? 0}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400 font-medium">
                <span>Runs awaiting sign-off</span>
              </div>
            </div>
          </div>
        </GuideTooltip>
      </div>

      {/* Two Column Layout: Department Distribution & Recent Payroll Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Costing Breakdown */}
        <div id="tour-dept-chart" className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
                  Department Cost Distribution
                </h2>
                <SandboxBeacon
                  title="Department Payroll Budget Breakdown"
                  description="Displays the estimated monthly compensation expense per department, proportional headcount, and share of total payroll budget."
                  category="stat"
                  tip="Use this chart to monitor department variance and ensure payroll stays within allocated fiscal limits."
                />
              </div>
              <p className="text-xs text-slate-400">
                Monthly estimated payroll budget allocation by business unit
              </p>
            </div>
            <GuideTooltip
              title="Manage Departments & Designations"
              description="Configure new business units, assign department managers, and define compensation salary bands."
              category="feature"
              position="left"
            >
              <Link
                href="/departments"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </GuideTooltip>
          </div>

          <div className="space-y-4">
            {departmentStats.map((dept: any) => {
              const percentage = totalPayrollEst > 0 ? Math.round((dept.estimatedMonthlyCost / totalPayrollEst) * 100) : 0;
              return (
                <GuideTooltip
                  key={dept.id}
                  title={`${dept.name} Department Budget`}
                  description={`Allocated estimated monthly cost: ${formatCurrency(dept.estimatedMonthlyCost, currency)} across ${dept.employeeCount} enrolled staff (${percentage}% of total payroll).`}
                  category="stat"
                  position="top"
                  wrapperClassName="w-full block"
                >
                  <div className="space-y-2 cursor-pointer p-2 rounded-xl hover:bg-slate-900/40 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{dept.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400">
                          {dept.employeeCount} Staff
                        </span>
                      </div>
                      <div className="font-semibold text-slate-200">
                        {formatCurrency(dept.estimatedMonthlyCost, currency)}{' '}
                        <span className="text-slate-400 text-[11px] font-normal">({percentage}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                  </div>
                </GuideTooltip>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & System Info */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
                Payroll Quick Actions
              </h2>
              <SandboxBeacon
                title="Operational Shortcuts"
                description="Fast-track navigation to key phases of the monthly payroll cycle: attendance capture, salary configuration, and payslip generation."
                category="workflow"
              />
            </div>
            <div className="space-y-2.5">
              <GuideTooltip
                title="Monthly Attendance & Leaves Register"
                description="Record actual days worked, approved leaves, and compute unpaid absence days that trigger automated Loss-of-Pay deductions."
                category="compliance"
                tip="Adjust an employee's unpaid leaves to see pro-rata deductions in the next run."
                position="left"
                wrapperClassName="w-full block"
              >
                <Link
                  href="/attendance"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        Attendance & Leaves
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Update working days & LOP
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Link>
              </GuideTooltip>

              <GuideTooltip
                title="Salary Structure Templates & Formulas"
                description="Create and adjust compensation packages with statutory EPF (12%), ESI (0.75%), Professional Tax slabs, and Income Tax (TDS)."
                category="formula"
                tip="Configure earnings components as fixed amounts or percentage of Basic."
                position="left"
                wrapperClassName="w-full block"
              >
                <Link
                  href="/salary-structures"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        Salary Structure Matrix
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Configure basic & allowances
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Link>
              </GuideTooltip>

              <GuideTooltip
                title="Employee Payslip Distribution Center"
                description="Preview and print official company salary slips with earnings, statutory deductions, attendance stats, and net pay in words."
                category="feature"
                tip="Generate or print any payslip for immediate validation."
                position="left"
                wrapperClassName="w-full block"
              >
                <Link
                  href="/payslips"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        Payslip Center
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Download & print employee slips
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </Link>
              </GuideTooltip>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Organization:</span>
              <span className="font-semibold text-slate-300 truncate max-w-[170px]">
                {settings?.companyName || 'Apex Corp'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Monthly PF Rate:</span>
              <span className="font-semibold text-slate-300">
                {settings?.pfPercentage ?? 12}% Statutory
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payroll Runs Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
                Recent Payroll Runs
              </h2>
              <SandboxBeacon
                title="Payroll Execution History"
                description="Audited record of batch payroll executions, including month/year period, processing state (Draft, Under Review, Approved, Finalized), and net amounts."
                category="compliance"
                tip="Click 'Details' on any row to open the complete itemized salary register."
              />
            </div>
            <p className="text-xs text-slate-400">
              Audit log of monthly batch runs, calculation status, and sign-offs
            </p>
          </div>
          <GuideTooltip
            title="Open Full Payroll Engine"
            description="Access the 4-step payroll pipeline to calculate, verify, and submit runs for new periods."
            category="action"
            position="left"
          >
            <Link
              href="/payroll"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All Runs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </GuideTooltip>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total Staff</th>
                <th className="px-4 py-3">Gross Total</th>
                <th className="px-4 py-3">Net Payout</th>
                <th className="px-4 py-3">Processed By</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentRuns.length > 0 ? (
                recentRuns.map((run: any) => (
                  <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-semibold dark:text-slate-100 text-slate-800">
                      {getMonthName(run.periodMonth)} {run.periodYear}
                    </td>
                    <td className="px-4 py-3.5">
                      <GuideTooltip
                        title={`Run Status: ${run.status}`}
                        description={
                          run.status === 'FINALIZED'
                            ? 'Run is locked and ready for bank disbursement and payslip distribution.'
                            : run.status === 'APPROVED'
                            ? 'Manager approved. Awaiting final locking by Payroll Admin.'
                            : run.status === 'UNDER_REVIEW'
                            ? 'Submitted by HR. Awaiting Manager / Finance approval.'
                            : run.status === 'REJECTED'
                            ? 'Rejected by approver. Requires adjustment and recalculation.'
                            : 'Draft state. Requires submission for review.'
                        }
                        category="compliance"
                        position="top"
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-help ${
                            run.status === 'FINALIZED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : run.status === 'APPROVED'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : run.status === 'UNDER_REVIEW'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : run.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {run.status.replace('_', ' ')}
                        </span>
                      </GuideTooltip>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{run.totalEmployees}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-200">
                      {formatCurrency(run.totalGross, currency)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400">
                      {formatCurrency(run.totalNet, currency)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {run.processedBy?.name || 'System Auto'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <GuideTooltip
                        title="View Detailed Payroll Register"
                        description="Inspect employee-by-employee breakdown with individual Basic, HRA, PF, ESI, TDS, and Net Pay."
                        category="feature"
                        position="left"
                      >
                        <Link
                          href={`/payroll?runId=${run.id}`}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors inline-block"
                        >
                          Details
                        </Link>
                      </GuideTooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No payroll runs executed yet. Click &quot;Run Payroll Engine&quot; to calculate your first month.
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
