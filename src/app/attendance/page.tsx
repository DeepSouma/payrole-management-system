'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  UserX,
} from 'lucide-react';
import { useAttendance, useSaveAttendance } from '@/hooks/use-payroll-data';
import { useAuth } from '@/lib/auth-context';
import { getMonthName } from '@/lib/utils';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function AttendancePage() {
  const { canManagePayroll } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [selectedYear, setSelectedYear] = useState(2026);

  const { data, isLoading } = useAttendance(selectedMonth, selectedYear);
  const saveMutation = useSaveAttendance();

  const [records, setRecords] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (data?.records) {
      setRecords(data.records);
    }
  }, [data]);

  const handleUpdateField = (employeeId: string, field: string, value: any) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.employeeId === employeeId) {
          const updated = { ...rec, [field]: value };
          if (field === 'presentDays' || field === 'unpaidLeaves') {
            const total = Number(updated.totalWorkingDays) || 30;
            const pres = Number(updated.presentDays) || 0;
            const paid = Number(updated.paidLeaves) || 0;
            updated.absentDays = Math.max(0, total - pres - paid);
          }
          return updated;
        }
        return rec;
      })
    );
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
        records,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    }
  };

  const totalPresent = records.reduce((acc, r) => acc + (Number(r.presentDays) || 0), 0);
  const totalLOP = records.reduce((acc, r) => acc + (Number(r.unpaidLeaves) || 0), 0);
  const totalOT = records.reduce((acc, r) => acc + (Number(r.overtimeHours) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Time & Attendance Tracking</span>
            <SandboxBeacon
              title="Attendance & Loss-of-Pay Engine"
              description="Unpaid absences directly feed into the payroll calculation engine to compute pro-rata Loss of Pay (LOP) salary deductions."
              category="formula"
              formula="LOP Deduction = (Basic + DA) / Total Working Days * Unpaid Absent Days"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            Monthly Attendance & LOP Input
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Record working days, unpaid leaves (Loss of Pay), and overtime hours feeding into the payroll calculation engine.
          </p>
        </div>

        {/* Period Selector & Save Button */}
        <div className="flex flex-wrap items-center gap-3">
          <GuideTooltip
            title="Attendance Billing Period"
            description="Select the payroll cycle month and year to inspect or edit attendance registers."
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
              title="Save & Synchronize Attendance"
              description="Persists attendance inputs and makes them immediately available for the 4-step payroll calculation engine."
              category="action"
              tip="Try changing an employee's Unpaid Leaves (LOP) to 2 and click Save, then run Payroll to see the deduction."
              position="bottom"
            >
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span>{saveMutation.isPending ? 'Saving...' : 'Save & Sync Attendance'}</span>
              </button>
            </GuideTooltip>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Attendance records for {getMonthName(selectedMonth)} {selectedYear} successfully saved to database!</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <GuideTooltip
          title="Total Workforce Present Days"
          description="Cumulative count of days staff were on-duty or on approved paid leave during the period."
          category="stat"
          position="top"
          wrapperClassName="w-full"
        >
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between h-full cursor-help">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Present Days</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{totalPresent} Days</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
        </GuideTooltip>

        <GuideTooltip
          title="Total Loss-of-Pay (Unpaid Days)"
          description="Total unpaid absence days logged. The payroll calculation engine automatically deducts salary pro-rata for these days."
          category="formula"
          formula="LOP = (Basic + DA) / 30 * Unpaid Days"
          position="top"
          wrapperClassName="w-full"
        >
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between h-full cursor-help">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unpaid Leaves (LOP)</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{totalLOP} Days</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
          </div>
        </GuideTooltip>

        <GuideTooltip
          title="Total Overtime Hours"
          description="Approved overtime work hours added to the employee earnings register at statutory overtime multipliers."
          category="formula"
          position="top"
          wrapperClassName="w-full"
        >
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between h-full cursor-help">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Overtime Logged</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">{totalOT} Hours</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </GuideTooltip>
      </div>

      {/* Attendance Interactive Grid Table */}
      <div id="tour-attendance-table" className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-4">Employee</th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Working Days</span>
                    <SandboxBeacon
                      title="Month Working Days"
                      description="Total billable days in the payroll cycle (default: 30 days)."
                      category="workflow"
                    />
                  </div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Present Days</span>
                    <SandboxBeacon
                      title="Actual Days Worked"
                      description="Number of days employee attended or took approved paid time-off."
                      category="workflow"
                    />
                  </div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Unpaid (LOP)</span>
                    <SandboxBeacon
                      title="Loss of Pay (Unpaid Absence)"
                      description="Days where salary is withheld pro-rata."
                      category="formula"
                    />
                  </div>
                </th>
                <th className="px-4 py-4 text-center">Overtime (Hrs)</th>
                <th className="px-5 py-4">Remarks / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Loading attendance records...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((rec) => (
                  <tr key={rec.employeeId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-100">{rec.employeeName}</div>
                      <div className="text-xs text-slate-400">
                        <span className="font-mono text-indigo-400">{rec.employeeCode}</span> • {rec.department}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="number"
                        disabled={!canManagePayroll}
                        value={rec.totalWorkingDays}
                        onChange={(e) =>
                          handleUpdateField(rec.employeeId, 'totalWorkingDays', Number(e.target.value))
                        }
                        className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-slate-200 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="number"
                        disabled={!canManagePayroll}
                        value={rec.presentDays}
                        onChange={(e) =>
                          handleUpdateField(rec.employeeId, 'presentDays', Number(e.target.value))
                        }
                        className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-emerald-400 font-bold focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="number"
                        disabled={!canManagePayroll}
                        value={rec.unpaidLeaves}
                        onChange={(e) =>
                          handleUpdateField(rec.employeeId, 'unpaidLeaves', Number(e.target.value))
                        }
                        className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-rose-400 font-bold focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        disabled={!canManagePayroll}
                        value={rec.overtimeHours}
                        onChange={(e) =>
                          handleUpdateField(rec.employeeId, 'overtimeHours', Number(e.target.value))
                        }
                        className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-purple-400 font-bold focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        type="text"
                        disabled={!canManagePayroll}
                        value={rec.remarks || ''}
                        onChange={(e) => handleUpdateField(rec.employeeId, 'remarks', e.target.value)}
                        placeholder="e.g. Regular month, 2 days medical LOP"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-300 focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                    No active employee records found for attendance.
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
