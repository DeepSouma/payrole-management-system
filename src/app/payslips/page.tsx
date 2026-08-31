'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Download,
  Printer,
  Eye,
  Building2,
  Calendar,
  CreditCard,
  X,
  FileCheck,
} from 'lucide-react';
import { usePayslips, usePayslipDetails } from '@/hooks/use-payroll-data';
import { formatCurrency, formatDate, getMonthName, numberToWords } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function PayslipsPage() {
  const { data: payslipsData, isLoading } = usePayslips();
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);

  const { data: detailData, isLoading: detailLoading } = usePayslipDetails(
    selectedPayslipId || ''
  );

  const payslips = payslipsData?.payslips || [];
  const activeSlip = detailData?.payslip;
  const org = detailData?.organization;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Payroll Disbursement Repository</span>
            <SandboxBeacon
              title="Digital Payslip Repository"
              description="Official corporate payslips generated after managerial payroll finalization. Features company letterhead, tax withholdings, attendance logs, and net pay in words."
              category="feature"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            Employee Payslips
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Search, preview, and print official company payslips with complete statutory earnings and tax deductions.
          </p>
        </div>
      </div>

      {/* Payslips Table */}
      <div id="tour-payslips-table" className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-4">Payslip #</th>
                <th className="px-5 py-4">Employee</th>
                <th className="px-4 py-4">Pay Period</th>
                <th className="px-4 py-4">Gross Earnings</th>
                <th className="px-4 py-4">Deductions</th>
                <th className="px-4 py-4 font-bold text-emerald-400">Net Salary</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    Loading payslips...
                  </td>
                </tr>
              ) : payslips.length > 0 ? (
                payslips.map((ps: any) => {
                  const rec = ps.payrollRecord;
                  const emp = rec.employee;
                  const run = rec.payrollRun;

                  return (
                    <tr key={ps.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-indigo-400 font-bold">
                        {ps.payslipNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-100">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {emp.employeeCode} • {emp.department?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-200">
                        {getMonthName(run.periodMonth)} {run.periodYear}
                      </td>
                      <td className="px-4 py-3.5 text-slate-200">{formatCurrency(rec.grossSalary)}</td>
                      <td className="px-4 py-3.5 text-rose-400">-{formatCurrency(rec.totalDeductions)}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono text-sm">
                        {formatCurrency(rec.netSalary)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <GuideTooltip
                          title="View & Print Official Payslip"
                          description="Opens high-fidelity letterhead payslip document with itemized earnings, statutory tax withholdings, bank account info, and net pay in words."
                          category="feature"
                          tip="Click here to inspect printable PDF layout."
                          position="left"
                        >
                          <button
                            onClick={() => setSelectedPayslipId(ps.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View & Print</span>
                          </button>
                        </GuideTooltip>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No finalized payslips available yet. Complete and finalize a payroll run to generate payslips.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Fidelity Printable Payslip Modal */}
      {selectedPayslipId && activeSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full my-8 space-y-4">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between no-print bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Official Employee Payslip Preview</span>
              </div>
              <div className="flex items-center gap-3">
                <GuideTooltip
                  title="Print / Save PDF"
                  description="Triggers the browser print dialog formatted specifically for clean 1-page PDF export."
                  category="action"
                  position="bottom"
                >
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save PDF</span>
                  </button>
                </GuideTooltip>
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
              {/* Header Letterhead */}
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
                    GST / Tax ID: <strong>{org?.taxId || 'GSTIN29AAAAA0000A1Z5'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                    Payslip For The Month Of
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
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Employee ID</span>
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
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Bank Name</span>
                  <span className="font-semibold text-slate-900">
                    {activeSlip.payrollRecord.employee.bankName || 'HDFC Bank'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Bank Account #</span>
                  <span className="font-mono text-slate-900">
                    {activeSlip.payrollRecord.employee.accountNumber || '50100234567890'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">PAN / Tax ID</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {activeSlip.payrollRecord.employee.panNumber || 'ABCDE1234F'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Days Worked</span>
                  <span className="font-bold text-emerald-700">
                    {activeSlip.payrollRecord.presentDays} / {activeSlip.payrollRecord.workingDays} Days
                  </span>
                </div>
              </div>

              {/* Earnings & Deductions Dual Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Earnings Column */}
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

                {/* Deductions Column */}
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

              {/* Net Payable Highlight Banner */}
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

              {/* Authorized Signatures & Disclaimer */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                <div>
                  <p>This is a computer-generated payslip and does not require a physical signature.</p>
                  <p className="mt-0.5">Generated On: {formatDate(activeSlip.generatedAt)}</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1" />
                  <span className="font-semibold text-slate-700">Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
