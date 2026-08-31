'use client';

import React, { useState } from 'react';
import {
  CheckCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  MessageSquare,
  AlertTriangle,
  FileCheck,
  X,
  Send,
} from 'lucide-react';
import {
  usePayrollRuns,
  useApprovePayroll,
  useFinalizePayroll,
} from '@/hooks/use-payroll-data';
import { formatCurrency, getMonthName, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function ApprovalsPage() {
  const { user, canApprovePayroll } = useAuth();
  const { data, isLoading } = usePayrollRuns();

  const approveMutation = useApprovePayroll();
  const finalizeMutation = useFinalizePayroll();

  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [comments, setComments] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const runs = data?.runs || [];

  const handleOpenActionModal = (run: any, action: 'APPROVE' | 'REJECT') => {
    setSelectedRun(run);
    setActionType(action);
    setComments(
      action === 'APPROVE'
        ? 'Payroll verified with attendance & salary structures. Approved for disbursement.'
        : 'Discrepancies found in overtime calculations. Please correct and resubmit.'
    );
    setShowModal(true);
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRun) return;
    try {
      await approveMutation.mutateAsync({
        id: selectedRun.id,
        action: actionType,
        comments,
        approvedByUserId: user.id,
      });
      setShowModal(false);
      setNotification(
        actionType === 'APPROVE'
          ? `Payroll for ${getMonthName(selectedRun.periodMonth)} ${selectedRun.periodYear} approved successfully!`
          : `Payroll for ${getMonthName(selectedRun.periodMonth)} ${selectedRun.periodYear} rejected and sent back.`
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to process approval');
    }
  };

  const handleFinalize = async (run: any) => {
    if (!confirm(`Finalize and lock payroll for ${getMonthName(run.periodMonth)} ${run.periodYear}? This will generate official employee payslips.`)) return;
    try {
      const res = await finalizeMutation.mutateAsync(run.id);
      setNotification(res.message || 'Payroll finalized and payslips generated successfully!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to finalize payroll');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <CheckCheck className="w-4 h-4" />
          <span>Governance & Approval Center</span>
          <SandboxBeacon
            title="Maker-Checker Security Policy"
            description="Enforces separation of duties: HR creates calculations, while Department/Finance Managers review variance and authoritatively approve or reject before bank disbursement."
            category="compliance"
            variant="pill"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
          Payroll Sign-Off & Approvals
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Review processed monthly payroll registers, verify variance flags, and authorize disbursement.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Runs List */}
      <div id="tour-approvals-list" className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading payroll runs...</div>
        ) : runs.length > 0 ? (
          runs.map((run: any) => {
            const isUnderReview = run.status === 'UNDER_REVIEW';
            const isApproved = run.status === 'APPROVED';
            const isFinalized = run.status === 'FINALIZED';

            return (
              <div
                key={run.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold dark:text-white text-slate-900">
                          Period: {getMonthName(run.periodMonth)} {run.periodYear}
                        </h2>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                            isFinalized
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isApproved
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : isUnderReview
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {run.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Processed by {run.processedBy?.name || 'HR Admin'} • {run.totalEmployees} Active Employees Enrolled
                      </p>
                    </div>
                  </div>

                  {/* Actions according to status */}
                  <div className="flex items-center gap-3">
                    {canApprovePayroll && isUnderReview && (
                      <>
                        <GuideTooltip
                          title="Reject & Request Revision"
                          description="Sends the payroll run back to the HR draft stage with feedback comments detailing corrections needed."
                          category="compliance"
                          position="left"
                        >
                          <button
                            onClick={() => handleOpenActionModal(run, 'REJECT')}
                            className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject / Send Back</span>
                          </button>
                        </GuideTooltip>

                        <GuideTooltip
                          title="Authorize & Approve Run"
                          description="Signs off on attendance records, tax calculations, and unlocks finalization for bank disbursement."
                          category="action"
                          tip="Click to approve this run in sandbox and add audit sign-off remarks."
                          position="left"
                        >
                          <button
                            onClick={() => handleOpenActionModal(run, 'APPROVE')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve Payroll Run</span>
                          </button>
                        </GuideTooltip>
                      </>
                    )}

                    {isApproved && (
                      <GuideTooltip
                        title="Finalize & Generate Official Payslips"
                        description="Locks the payroll run permanently, publishes payslips to employee self-service portal, and generates bank disbursement batches."
                        category="action"
                        tip="Click to finalize and immediately generate downloadable payslips."
                        position="left"
                      >
                        <button
                          onClick={() => handleFinalize(run)}
                          disabled={finalizeMutation.isPending}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Finalize & Issue Payslips</span>
                        </button>
                      </GuideTooltip>
                    )}

                    {isFinalized && (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <FileCheck className="w-4 h-4" />
                        <span>Locked & Distributed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                  <GuideTooltip
                    title="Total Gross Wages"
                    description="Gross compensation sum before statutory withholdings."
                    category="stat"
                    position="top"
                    wrapperClassName="w-full"
                  >
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-help">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Gross Payroll</span>
                      <div className="text-lg font-bold text-slate-200 mt-0.5">{formatCurrency(run.totalGross)}</div>
                    </div>
                  </GuideTooltip>

                  <GuideTooltip
                    title="Total Deductions (EPF + ESI + TDS + PT)"
                    description="Withheld statutory and tax payments remitted to government authorities."
                    category="formula"
                    position="top"
                    wrapperClassName="w-full"
                  >
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-help">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Deductions</span>
                      <div className="text-lg font-bold text-rose-400 mt-0.5">-{formatCurrency(run.totalDeductions)}</div>
                    </div>
                  </GuideTooltip>

                  <GuideTooltip
                    title="Approved Net Cash Outflow"
                    description="Final amount authorized for corporate bank Host-to-Host transfer."
                    category="banking"
                    position="top"
                    wrapperClassName="w-full"
                  >
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 cursor-help">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Net Payout Authorized</span>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">{formatCurrency(run.totalNet)}</div>
                    </div>
                  </GuideTooltip>
                </div>

                {run.approvalComments && (
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">
                        {run.approvedBy?.name || 'Approver'} Remarks:
                      </span>{' '}
                      {run.approvalComments}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl border border-slate-800">
            No payroll runs have been generated or submitted for approval yet.
          </div>
        )}
      </div>

      {/* Review / Approval Modal */}
      {showModal && selectedRun && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl text-white ${
                    actionType === 'APPROVE' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {actionType === 'APPROVE' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold dark:text-white text-slate-900">
                    {actionType === 'APPROVE' ? 'Authorize Payroll Run' : 'Reject Payroll Run'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Period: {getMonthName(selectedRun.periodMonth)} {selectedRun.periodYear}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Manager Review Notes & Sign-off Comments *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Provide audit reason or feedback..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approveMutation.isPending}
                  className={`px-5 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {approveMutation.isPending ? 'Processing...' : `Confirm ${actionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
