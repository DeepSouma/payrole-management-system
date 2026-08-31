'use client';

import React, { useState } from 'react';
import {
  Landmark,
  CreditCard,
  Send,
  Download,
  UploadCloud,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  Building2,
  Sparkles,
  ArrowRight,
  Server,
  Layers,
  X,
} from 'lucide-react';
import {
  useBankAccounts,
  usePayrollRuns,
  usePaymentBatches,
  useH2HFiles,
  useDisbursePayroll,
  useGenerateH2HFile,
  useIngestReverseMIS,
} from '@/hooks/use-payroll-data';
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function DisbursementsPage() {
  const { canManagePayroll } = useAuth();

  const { data: bankData, isLoading: bankLoading } = useBankAccounts();
  const { data: runsData } = usePayrollRuns();
  const { data: batchesData, isLoading: batchesLoading } = usePaymentBatches();
  const { data: h2hData } = useH2HFiles();

  const disburseMutation = useDisbursePayroll();
  const generateH2HMutation = useGenerateH2HFile();
  const ingestMISMutation = useIngestReverseMIS();

  // Wizard state
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'HDFC_API' | 'ICICI_API' | 'H2H_SFTP'>('HDFC_API');
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [showH2HModal, setShowH2HModal] = useState(false);
  const [selectedH2HFormat, setSelectedH2HFormat] = useState('NACH_306_TXT');
  const [generatedFilePreview, setGeneratedFilePreview] = useState<{ fileName: string; content: string } | null>(null);

  const [showReverseMISModal, setShowReverseMISModal] = useState(false);
  const [reverseMISInput, setReverseMISInput] = useState('');

  const bankAccounts = bankData?.bankAccounts || [];
  const payrollRuns = runsData?.runs || [];
  const batches = batchesData?.batches || [];
  const h2hFiles = h2hData?.files || [];

  const approvedRuns = payrollRuns.filter(
    (r: any) => r.status === 'APPROVED' || r.status === 'FINALIZED'
  );

  const activeRun = payrollRuns.find((r: any) => r.id === selectedRunId) || approvedRuns[0];
  const activeBank = bankAccounts.find((b: any) => b.id === selectedBankId) || bankAccounts[0];

  const handleDisburse = async () => {
    if (!activeRun || !activeBank) {
      alert('Please select an approved payroll run and a disbursement bank account.');
      return;
    }

    try {
      const res = await disburseMutation.mutateAsync({
        payrollRunId: activeRun.id,
        bankAccountId: activeBank.id,
        method: selectedMethod,
      });

      setNotification(res.message || 'Disbursement executed successfully!');
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Disbursement execution failed');
    }
  };

  const handleGenerateH2H = async () => {
    if (!activeRun) {
      alert('Please select a payroll run to generate the H2H bank file.');
      return;
    }

    try {
      const res = await generateH2HMutation.mutateAsync({
        payrollRunId: activeRun.id,
        format: selectedH2HFormat,
        bankAccountId: activeBank?.id,
      });

      setGeneratedFilePreview({
        fileName: res.fileName,
        content: res.content,
      });
      setNotification(`Generated ${res.fileName} successfully!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to generate H2H file');
    }
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleIngestReverseMIS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ingestMISMutation.mutateAsync({
        fileContent: reverseMISInput,
        fileName: `BANK_REVERSE_MIS_${Date.now()}.res`,
      });
      setShowReverseMISModal(false);
      setReverseMISInput('');
      setNotification(res.message || 'Reverse MIS reconciled successfully!');
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to parse Reverse MIS');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Landmark className="w-4 h-4" />
            <span>Corporate Banking & Host-to-Host (H2H) Gateway</span>
            <SandboxBeacon
              title="Banking & Payment Clearing Gateway"
              description="Direct payout integration: generate standardized clearing files (NACH 306 TXT, HDFC ENet, ICICI CIB) or simulate real-time API transfers with Reverse MIS UTR reconciliation."
              category="banking"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            Bank APIs & H2H Disbursements
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Direct integrations with HDFC Bank API, ICICI Bank CIB API, and automated Host-to-Host (SFTP/NACH/ISO 20022) clearing queues.
          </p>
        </div>

        {canManagePayroll && (
          <div id="tour-disbursements-actions" className="flex items-center gap-3">
            <GuideTooltip
              title="Generate Corporate H2H Bank File"
              description="Generates compliant corporate payout files in NACH 306 text, ICICI CIB CSV, HDFC ENet, or SBI formats ready for bank portal upload."
              category="banking"
              tip="Click to generate and download a sample NACH file in sandbox."
              position="bottom"
            >
              <button
                onClick={() => setShowH2HModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
              >
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>Generate H2H Bank File</span>
              </button>
            </GuideTooltip>

            <GuideTooltip
              title="Ingest Bank Reverse MIS File"
              description="Uploads bank response files containing UTR reference numbers to automatically reconcile successful and failed salary transfers."
              category="banking"
              tip="Test UTR reconciliation with pre-filled sample bank response data."
              position="bottom"
            >
              <button
                onClick={() => {
                  setReverseMISInput(
                    `REC_TYPE,BEN_ACC,AMOUNT,STATUS,UTR_NO\nD,50100234567890,145000.00,SUCCESS,HDFCR5202608280098412\nD,102938475601,52000.00,SUCCESS,ICICR5202608280041239\nD,918010045678912,85000.00,SUCCESS,AXISR5202608280055112`
                  );
                  setShowReverseMISModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Ingest Reverse MIS (UTR Reconcile)</span>
              </button>
            </GuideTooltip>
          </div>
        )}
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Corporate Bank Accounts Liquidity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bankAccounts.map((account: any) => {
          const isHDFC = account.bankCode === 'HDFC';
          return (
            <div
              key={account.id}
              className={`p-6 rounded-3xl border transition-all ${
                (activeBank?.id === account.id)
                  ? 'bg-slate-900/90 border-indigo-500/50 shadow-xl shadow-indigo-500/10'
                  : 'glass-panel border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-3 rounded-2xl text-white font-bold text-sm ${
                      isHDFC ? 'bg-blue-600' : 'bg-orange-600'
                    }`}
                  >
                    {account.bankCode}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{account.bankName}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      A/C: {account.accountNumber} • {account.ifscCode}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                  API Connected
                </span>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Treasury Available Balance
                  </span>
                  <div className="text-2xl font-extrabold dark:text-white text-slate-900 font-mono mt-0.5">
                    {formatCurrency(account.availableBalance)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>SFTP Gateway:</span>
                  <div className="font-mono text-slate-300">{account.sftpHost}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Initiation Console Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold dark:text-white text-slate-900">1-Click Salary Disbursement Console</h2>
            <p className="text-xs text-slate-400">
              Select an approved payroll period, select funding corporate account, and trigger automated payouts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Select Payroll Run */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Payroll Run</label>
            <select
              value={activeRun?.id || ''}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500"
            >
              {approvedRuns.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {getMonthName(r.periodMonth)} {r.periodYear} ({r.status}) - {formatCurrency(r.totalNet)}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Debit Bank Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Debit Corporate Pool A/C</label>
            <select
              value={activeBank?.id || ''}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500"
            >
              {bankAccounts.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.bankName} ({b.accountNumber.slice(-4)}) - Bal: {formatCurrency(b.availableBalance)}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Select Payment Integration Engine */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Disbursement Integration Protocol</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500"
            >
              <option value="HDFC_API">HDFC Bank Direct Corporate API (Instant IMPS/NEFT)</option>
              <option value="ICICI_API">ICICI Bank CIB Composite Payment API</option>
              <option value="H2H_SFTP">Host-to-Host (H2H) Automated SFTP Clearing</option>
            </select>
          </div>
        </div>

        {/* Selected Batch Summary Banner */}
        {activeRun && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-indigo-300">
                Ready to disburse period: <strong>{getMonthName(activeRun.periodMonth)} {activeRun.periodYear}</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Enrolled Beneficiaries: <strong>{activeRun.totalEmployees} Employees</strong> • Required Liquidity:{' '}
                <strong className="text-white font-mono">{formatCurrency(activeRun.totalNet)}</strong>
              </div>
            </div>

            {canManagePayroll && (
              <button
                onClick={handleDisburse}
                disabled={disburseMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                {disburseMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{disburseMutation.isPending ? 'Executing Transfers...' : `Authorize & Disburse via ${selectedMethod.replace('_', ' ')}`}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment Batches & Transactions Ledger */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">Payment Batches & RBI UTR Ledger</h2>
            <p className="text-xs text-slate-400">
              Audit trail of corporate disbursements, bank transaction references, and settlement timestamps
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-slate-300 text-slate-700">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-4 py-3.5">Batch #</th>
                <th className="px-4 py-3.5">Bank Gateway</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Disbursed Amount</th>
                <th className="px-4 py-3.5">Transfers</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Settlement Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {batchesLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading batch records...</td>
                </tr>
              ) : batches.length > 0 ? (
                batches.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-400">{batch.batchNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{batch.bankAccount?.bankName}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{batch.method}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400 font-mono">{formatCurrency(batch.totalAmount)}</td>
                    <td className="px-4 py-3 text-slate-300">{batch.successCount} / {batch.totalRecords} Success</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {batch.settledAt ? new Date(batch.settledAt).toLocaleString() : formatDate(batch.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No disbursement batches executed yet. Select an approved payroll run above and disburse.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Host-to-Host (H2H) File Generator Modal */}
      {showH2HModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold dark:text-white text-slate-900">Host-to-Host (H2H) Banking File Generator</h2>
                  <p className="text-xs text-slate-400">Generate RBI and Bank standard file formats for SFTP/AS2 upload</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowH2HModal(false);
                  setGeneratedFilePreview(null);
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Standard Banking Format</label>
                <select
                  value={selectedH2HFormat}
                  onChange={(e) => setSelectedH2HFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500"
                >
                  <option value="NACH_306_TXT">NPCI NACH 306-Byte Standard Text Format (National Clearing)</option>
                  <option value="HDFC_SUF_CSV">HDFC E-CMS Bulk Salary Upload File (SUF CSV)</option>
                  <option value="ICICI_CIB_15COL">ICICI Connected Banking 15-Column CIB Standard CSV</option>
                  <option value="ISO_20022_XML">ISO 20022 XML (pain.001.001.03 Customer Credit Transfer)</option>
                </select>
              </div>

              {generatedFilePreview && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">Generated File: {generatedFilePreview.fileName}</span>
                    <button
                      onClick={() => handleDownloadFile(generatedFilePreview.fileName, generatedFilePreview.content)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto overflow-x-auto">
                    {generatedFilePreview.content}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowH2HModal(false);
                    setGeneratedFilePreview(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleGenerateH2H}
                  disabled={generateH2HMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {generateH2HMutation.isPending ? 'Generating...' : 'Build Bank Standard File'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reverse MIS Reconciliation Modal */}
      {showReverseMISModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold dark:text-white text-slate-900">Ingest Bank Reverse MIS Response File</h2>
                  <p className="text-xs text-slate-400">Match bank clearance UTR references and update payroll statuses</p>
                </div>
              </div>
              <button
                onClick={() => setShowReverseMISModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIngestReverseMIS} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bank Settlement File Content (.res / .ack / CSV / TXT)
                </label>
                <textarea
                  rows={6}
                  required
                  value={reverseMISInput}
                  onChange={(e) => setReverseMISInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Paste or upload reverse response MIS file content..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReverseMISModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingestMISMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {ingestMISMutation.isPending ? 'Reconciling...' : 'Reconcile UTRs & Mark Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
