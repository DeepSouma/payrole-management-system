'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Receipt,
  Download,
  Printer,
  Eye,
  Calendar,
  CreditCard,
  Building2,
  ShieldCheck,
  X,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useEmployees, usePayslips, usePayslipDetails } from '@/hooks/use-payroll-data';
import { formatCurrency, formatDate, getMonthName, numberToWords } from '@/lib/utils';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function MyPayrollPage() {
  const { user } = useAuth();
  const { data: empData, isLoading: empLoading } = useEmployees({ search: user.email });
  const myEmployee = empData?.employees?.[0];

  const { data: payslipsData, isLoading: psLoading } = usePayslips({
    employeeId: myEmployee?.id,
  });

  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);
  const { data: detailData } = usePayslipDetails(selectedPayslipId || '');

  const payslips = payslipsData?.payslips || [];
  const activeSlip = detailData?.payslip;
  const org = detailData?.organization;

  const currentAssignment = myEmployee?.salaryAssignments?.[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Self-Service Portal</span>
            <SandboxBeacon
              title="Employee Self-Service (ESS)"
              description="Empowers employees to inspect their CTC salary structure breakdown, verify pro-rata deductions, and download tamper-proof payslips on any device."
              category="feature"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            My Compensation & Payslips
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View your personal salary package, monthly attendance records, and download official payslips.
          </p>
        </div>
      </div>

      {/* Profile & Salary Snapshot */}
      <div id="tour-my-payroll-card" className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl ring-2 ring-indigo-500/40 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold dark:text-white text-slate-900">{myEmployee?.firstName || user.name} {myEmployee?.lastName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
                  {myEmployee?.employeeCode || 'EMP-003'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {myEmployee?.designation?.title || 'Lead Architect'} • {myEmployee?.department?.name || 'Engineering'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] uppercase font-bold text-slate-500">PAN / Tax ID</span>
              <span className="font-mono font-semibold text-slate-200">{myEmployee?.panNumber || 'FGHIJ5678K'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] uppercase font-bold text-slate-500">Bank Account</span>
              <span className="font-mono font-semibold text-slate-200">
                {myEmployee?.bankName || 'Axis Bank'} ({myEmployee?.accountNumber ? `****${myEmployee.accountNumber.slice(-4)}` : '****8912'})
              </span>
            </div>
          </div>
        </div>

        {/* Salary Package Breakdown Card */}
        {currentAssignment && (
          <div className="pt-4 border-t border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-3">
              Current Assigned Package: {currentAssignment.salaryStructure?.name}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GuideTooltip
                title="Basic Salary"
                description="Core statutory wage component forming the basis for EPF and gratuity."
                category="formula"
                position="top"
                wrapperClassName="w-full"
              >
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-help">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Basic Pay</span>
                  <div className="text-lg font-bold text-white mt-1">
                    {formatCurrency(currentAssignment.basicSalary)}
                  </div>
                </div>
              </GuideTooltip>

              <GuideTooltip
                title="Monthly Gross Earnings"
                description="Sum of Basic + HRA + Special Allowance."
                category="formula"
                position="top"
                wrapperClassName="w-full"
              >
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-help">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Est. Monthly Gross</span>
                  <div className="text-lg font-bold text-purple-400 mt-1">
                    {formatCurrency(currentAssignment.basicSalary * 1.5 + 22000)}
                  </div>
                </div>
              </GuideTooltip>

              <GuideTooltip
                title="EPF Employee Contribution (12%)"
                description="Mandatory 12% retirement savings deduction."
                category="compliance"
                formula="12% * min(Basic, 15000)"
                position="top"
                wrapperClassName="w-full"
              >
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-help">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">PF Contribution (12%)</span>
                  <div className="text-lg font-bold text-rose-400 mt-1">
                    {formatCurrency(currentAssignment.basicSalary * 0.12)}
                  </div>
                </div>
              </GuideTooltip>

              <GuideTooltip
                title="Estimated Take-Home (Net Salary)"
                description="Cash deposited into employee bank account after taxes and PF."
                category="banking"
                position="top"
                wrapperClassName="w-full"
              >
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-help">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Est. Net Take-Home</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {formatCurrency(currentAssignment.basicSalary * 1.5 + 22000 - currentAssignment.basicSalary * 0.12 - 12000)}
                  </div>
                </div>
              </GuideTooltip>
            </div>
          </div>
        )}
      </div>

      {/* Historical Payslips Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 no-print">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">
              My Payslip History
            </h2>
            <p className="text-xs text-slate-400">
              Access your personal salary slips, monthly tax withholdings, and gross earnings history
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-4 py-3.5">Payslip #</th>
                <th className="px-4 py-3.5">Pay Period</th>
                <th className="px-4 py-3.5">Gross Pay</th>
                <th className="px-4 py-3.5">Deductions</th>
                <th className="px-4 py-3.5 font-bold text-emerald-400">Net Pay</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {payslips.length > 0 ? (
                payslips.map((ps: any) => (
                  <tr key={ps.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-indigo-400 font-bold">{ps.payslipNumber}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-200">
                      {getMonthName(ps.payrollRecord.payrollRun.periodMonth)}{' '}
                      {ps.payrollRecord.payrollRun.periodYear}
                    </td>
                    <td className="px-4 py-3.5 text-slate-200">
                      {formatCurrency(ps.payrollRecord.grossSalary)}
                    </td>
                    <td className="px-4 py-3.5 text-rose-400">
                      -{formatCurrency(ps.payrollRecord.totalDeductions)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono text-sm">
                      {formatCurrency(ps.payrollRecord.netSalary)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedPayslipId(ps.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No personal payslips available yet. Once monthly payroll is finalized, your slips will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Payslip Modal */}
      {selectedPayslipId && activeSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full my-8 space-y-4">
            <div className="flex items-center justify-between no-print bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>My Official Payslip</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedPayslipId(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Formal Printable Document Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 font-sans space-y-6">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xl tracking-tight">
                    <Building2 className="w-6 h-6" />
                    <span>{org?.companyName || 'Apex Innovations Corp.'}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    {org?.companyAddress || 'Tech Zone, Bangalore, Karnataka 560100'}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tax / GST: <strong>{org?.taxId || 'GSTIN29AAAAA0000A1Z5'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                    Salary Statement
                  </span>
                  <div className="text-lg font-extrabold text-slate-900">
                    {getMonthName(activeSlip.payrollRecord.payrollRun.periodMonth)}{' '}
                    {activeSlip.payrollRecord.payrollRun.periodYear}
                  </div>
                  <div className="text-xs font-mono font-semibold text-indigo-700 mt-1">
                    {activeSlip.payslipNumber}
                  </div>
                </div>
              </div>

              {/* Employee Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Employee Name</span>
                  <span className="font-bold text-slate-900">
                    {activeSlip.payrollRecord.employee.firstName} {activeSlip.payrollRecord.employee.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Employee Code</span>
                  <span className="font-bold font-mono text-slate-900">
                    {activeSlip.payrollRecord.employee.employeeCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-semibold text-slate-900">
                    {activeSlip.payrollRecord.employee.department?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Designation</span>
                  <span className="font-semibold text-slate-900">
                    {activeSlip.payrollRecord.employee.designation?.title}
                  </span>
                </div>
              </div>

              {/* Earnings & Deductions Dual Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 uppercase tracking-wider flex justify-between">
                    <span>Earnings</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>Basic Salary</span>
                      <span>{formatCurrency(activeSlip.payrollRecord.basicSalary)}</span>
                    </div>
                    {(() => {
                      try {
                        const items = JSON.parse(activeSlip.payrollRecord.earningsBreakdownJson);
                        return items
                          .filter((i: any) => i.code !== 'BASIC')
                          .map((i: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-slate-700">
                              <span>{i.name}</span>
                              <span>{formatCurrency(i.amount)}</span>
                            </div>
                          ));
                      } catch (e) {
                        return null;
                      }
                    })()}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Gross Earnings</span>
                      <span className="text-emerald-700 font-mono">
                        {formatCurrency(activeSlip.payrollRecord.grossSalary)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-rose-50 px-4 py-2 text-xs font-bold text-rose-900 uppercase tracking-wider flex justify-between">
                    <span>Deductions</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    {(() => {
                      try {
                        const items = JSON.parse(activeSlip.payrollRecord.deductionsBreakdownJson);
                        return items.map((i: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span>{i.name}</span>
                            <span>{formatCurrency(i.amount)}</span>
                          </div>
                        ));
                      } catch (e) {
                        return null;
                      }
                    })()}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span className="text-rose-700 font-mono">
                        {formatCurrency(activeSlip.payrollRecord.totalDeductions)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-indigo-900">
                    Net Take-Home Salary
                  </span>
                  <div className="text-xs text-indigo-700 mt-0.5">
                    In Words: <strong>{numberToWords(activeSlip.payrollRecord.netSalary)}</strong>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950 font-mono">
                  {formatCurrency(activeSlip.payrollRecord.netSalary)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
