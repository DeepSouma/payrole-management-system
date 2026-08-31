'use client';

import React, { useState } from 'react';
import { History, Shield, Filter, Calendar, Eye, X } from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-payroll-data';
import { formatDate } from '@/lib/utils';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function AuditLogsPage() {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const { data, isLoading } = useAuditLogs(selectedModule || undefined);

  const [selectedLog, setSelectedLog] = useState<any>(null);

  const logs = data?.logs || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Compliance & Traceability</span>
            <SandboxBeacon
              title="Immutable Audit Ledger"
              description="Every critical event (salary modifications, payroll calculations, approvals, and disbursements) is permanently recorded with before/after state diffs for regulatory compliance."
              category="compliance"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Immutable tracking log of all salary assignments, calculation modifications, and administrative sign-offs.
          </p>
        </div>

        {/* Module Filter */}
        <GuideTooltip
          title="Filter by Subsystem Module"
          description="Narrow the audit trail to specific domain actions like salary revisions, payroll approvals, or attendance updates."
          category="workflow"
          position="bottom"
        >
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none"
            >
              <option value="" className="bg-slate-900 text-white">All System Modules</option>
              <option value="EMPLOYEE" className="bg-slate-900 text-white">Employees</option>
              <option value="PAYROLL" className="bg-slate-900 text-white">Payroll Engine</option>
              <option value="PAYROLL_APPROVAL" className="bg-slate-900 text-white">Approvals</option>
              <option value="SALARY_CONFIG" className="bg-slate-900 text-white">Salary Config</option>
              <option value="ATTENDANCE" className="bg-slate-900 text-white">Attendance</option>
              <option value="SETTINGS" className="bg-slate-900 text-white">Settings</option>
            </select>
          </div>
        </GuideTooltip>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-4 py-4">Actor</th>
                <th className="px-4 py-4">Module</th>
                <th className="px-4 py-4">Action Event</th>
                <th className="px-5 py-4">Affected Record</th>
                <th className="px-4 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{log.userName}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-indigo-300 font-mono">{log.action}</td>
                    <td className="px-5 py-3.5 text-slate-300 truncate max-w-xs">{log.recordName || '-'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <GuideTooltip
                        title="View Change Diff"
                        description="Inspect the exact JSON delta comparing previous values against updated state."
                        category="feature"
                        position="left"
                      >
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 ml-auto transition-colors"
                          title="View Change Diff"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </GuideTooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No audit logs matching selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold dark:text-white text-slate-900">Audit Event Details</h2>
                <p className="text-xs text-slate-400">{selectedLog.action} • {selectedLog.recordName}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Performed By</span>
                  <span className="font-semibold text-slate-200">{selectedLog.userName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Timestamp</span>
                  <span className="font-mono text-slate-300">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {selectedLog.previousValueJson && (
                <div className="space-y-1">
                  <span className="font-semibold text-rose-400">Previous Value State:</span>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.previousValueJson), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValueJson && (
                <div className="space-y-1">
                  <span className="font-semibold text-emerald-400">New Value State:</span>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.newValueJson), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
