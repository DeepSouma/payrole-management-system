'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Layers,
  PieChart,
  FileSpreadsheet,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { useReports } from '@/hooks/use-payroll-data';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('monthly-summary');
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [selectedYear, setSelectedYear] = useState(2026);

  const { data: reportData, isLoading } = useReports(reportType, selectedMonth, selectedYear);

  const handleExportCSV = () => {
    if (!reportData?.data && !reportData?.items) {
      alert('No data available to export');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    const rows = reportData.data || reportData.items;

    if (Array.isArray(rows) && rows.length > 0) {
      const headers = Object.keys(rows[0]).join(',');
      csvContent += headers + '\r\n';

      rows.forEach((row: any) => {
        const values = Object.values(row)
          .map((v) => (typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v))
          .join(',');
        csvContent += values + '\r\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `payroll_report_${reportType}_${selectedMonth}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Financial Analytics & Compliance</span>
            <SandboxBeacon
              title="Statutory Reporting Suite"
              description="Export audit-ready reports including monthly payroll registers, department expense distribution, PF ECR filings, and TDS Form 24Q records in universal CSV format."
              category="compliance"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            Payroll Intelligence & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit monthly expense allocations, statutory withholdings, and export executive registers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <GuideTooltip
            title="Report Period Filter"
            description="Select the month and year to query financial and compliance registers."
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

          <GuideTooltip
            title="Export Formatted CSV Report"
            description="Downloads all visible rows and calculated fields in standard comma-separated values format for Excel, ERP, or accounting audits."
            category="action"
            position="bottom"
          >
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </GuideTooltip>
        </div>
      </div>

      {/* Report Categories Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          {
            id: 'monthly-summary',
            label: 'Monthly Run Summary',
            icon: TrendingUp,
            desc: 'High-level run metrics: total gross, total deductions, and net payouts per batch.',
          },
          {
            id: 'department-cost',
            label: 'Department Cost Matrix',
            icon: Building2,
            desc: 'Headcount breakdown, total departmental compensation cost, and budget percentage.',
          },
          {
            id: 'tax-pf-summary',
            label: 'Statutory Tax & PF Register',
            icon: FileSpreadsheet,
            desc: 'Regulatory compliance ledger with employee Basic, EPF 12%, and TDS withholdings.',
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <GuideTooltip
              key={tab.id}
              title={tab.label}
              description={tab.desc}
              category="feature"
              position="top"
            >
              <button
                onClick={() => setReportType(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            </GuideTooltip>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Compiling financial report...</div>
        ) : reportType === 'monthly-summary' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Total Gross</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3 text-emerald-400 font-bold">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {reportData?.data?.map((run: any) => (
                  <tr key={run.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-slate-100">
                      {getMonthName(run.periodMonth)} {run.periodYear}
                    </td>
                    <td className="px-4 py-3">{run.status}</td>
                    <td className="px-4 py-3">{run.totalEmployees}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(run.totalGross)}</td>
                    <td className="px-4 py-3 text-rose-400">-{formatCurrency(run.totalDeductions)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{formatCurrency(run.totalNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'department-cost' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Headcount</th>
                  <th className="px-4 py-3">Processed</th>
                  <th className="px-4 py-3">Gross Cost</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3 text-emerald-400 font-bold">Net Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {reportData?.data?.map((dept: any) => (
                  <tr key={dept.departmentId} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-slate-100">{dept.departmentName}</td>
                    <td className="px-4 py-3">{dept.employeeCount} Staff</td>
                    <td className="px-4 py-3">{dept.processedEmployees} Staff</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(dept.totalGross)}</td>
                    <td className="px-4 py-3 text-rose-400">-{formatCurrency(dept.totalDeductions)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{formatCurrency(dept.totalNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {reportData?.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Total PF Withheld</span>
                  <div className="text-xl font-bold text-indigo-400 mt-1">
                    {formatCurrency(reportData.summary.totalPF)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Total TDS Tax Withheld</span>
                  <div className="text-xl font-bold text-rose-400 mt-1">
                    {formatCurrency(reportData.summary.totalTax)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Period Base Gross</span>
                  <div className="text-xl font-bold text-slate-100 mt-1">
                    {formatCurrency(reportData.summary.totalGross)}
                  </div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">PAN Number</th>
                    <th className="px-4 py-3">Gross Pay</th>
                    <th className="px-4 py-3 text-indigo-400">PF (12%)</th>
                    <th className="px-4 py-3 text-rose-400">TDS Withheld</th>
                    <th className="px-4 py-3 font-bold text-emerald-400">Net Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {reportData?.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">{item.employeeName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">{item.panNumber}</td>
                      <td className="px-4 py-3">{formatCurrency(item.grossSalary)}</td>
                      <td className="px-4 py-3 text-indigo-400 font-mono">{formatCurrency(item.pfDeduction)}</td>
                      <td className="px-4 py-3 text-rose-400 font-mono">{formatCurrency(item.taxDeduction)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400 font-mono">{formatCurrency(item.netSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
