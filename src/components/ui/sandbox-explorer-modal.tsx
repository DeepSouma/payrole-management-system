'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Search,
  X,
  Sparkles,
  Calculator,
  ShieldCheck,
  Landmark,
  Users,
  CalendarCheck,
  CheckCheck,
  Receipt,
  BarChart3,
  History,
  Settings,
  UserCheck,
  Building2,
  ArrowRight,
  Lightbulb,
  FileCode,
  Shield,
} from 'lucide-react';
import { useSandboxGuide } from '@/lib/sandbox-guide-context';

interface FeatureGuideItem {
  id: string;
  name: string;
  category: 'core' | 'statutory' | 'banking' | 'portal' | 'governance';
  icon: any;
  href: string;
  summary: string;
  howToTest: string;
  formula?: string;
  rolesAllowed: string[];
}

const FEATURE_CATALOG: FeatureGuideItem[] = [
  {
    id: 'dashboard',
    name: 'Real-Time Payroll Command Center',
    category: 'core',
    icon: Sparkles,
    href: '/',
    summary: 'Executive dashboard summarizing total workforce headcount, pending approvals, estimated cash outflow, and payroll run timeline.',
    howToTest: 'Review top KPI cards and click "Run Payroll Engine" or "Pending Approvals" to jump into live operations.',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
  },
  {
    id: 'payroll-engine',
    name: '4-Step Automated Payroll Engine',
    category: 'core',
    icon: Calculator,
    href: '/payroll',
    summary: 'Batch calculation pipeline that automatically imports monthly attendance, computes gross earnings, deducts EPF, ESI, Professional Tax, TDS withholdings, and generates itemized pay registers.',
    howToTest: 'Select Month & Year, then click "Run Calculation Engine". Review the real-time breakdown, then submit for Manager Review.',
    formula: 'Net Pay = Gross Earnings - (EPF + ESI + PT + TDS + LOP Deductions)',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
  },
  {
    id: 'employees',
    name: 'Employee Master & KYC Directory',
    category: 'core',
    icon: Users,
    href: '/employees',
    summary: 'Complete employee lifecycle management with statutory PAN, Aadhaar, Bank Account IFSC, Salary Structure assignment, and historical revisions.',
    howToTest: 'Click "Add Employee" or select any profile to edit compensation structure and view assigned benefits.',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
  },
  {
    id: 'salary-structures',
    name: 'Salary Structures & Statutory Rules',
    category: 'statutory',
    icon: Settings,
    href: '/salary-structures',
    summary: 'Customizable compensation templates with flexible earnings (Basic, HRA, DA, Special) and statutory deduction components (EPF, ESI, PT, TDS).',
    howToTest: 'Review the statutory deduction rules card and test creating a new structure with percentage or fixed allowances.',
    formula: 'EPF = 12% of Basic (capped at ₹1,800/mo) | ESI = 0.75% of Gross (for Gross ≤ ₹21,000)',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
  },
  {
    id: 'attendance',
    name: 'Monthly Attendance & LOP Computation',
    category: 'statutory',
    icon: CalendarCheck,
    href: '/attendance',
    summary: 'Attendance register tracking present days, approved paid leaves, and unpaid absences triggering automated Loss-of-Pay (LOP) salary deductions.',
    howToTest: 'Edit unpaid leaves for any employee and click Save. Notice how the next payroll run deducts LOP pro-rata.',
    formula: 'Loss of Pay = (Basic Salary + DA) / Total Working Days * Unpaid Absent Days',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
  },
  {
    id: 'approvals',
    name: 'Maker-Checker Multi-Level Approvals',
    category: 'governance',
    icon: CheckCheck,
    href: '/approvals',
    summary: 'Enterprise audit compliance enforcing two-man rule: HR creates the payroll run, and Department/Finance Managers inspect and approve or reject before disbursement.',
    howToTest: 'Switch role to "Manager" in the top header, click "Review & Approve" on any pending run, add comments, and approve.',
    rolesAllowed: ['SUPER_ADMIN', 'MANAGER'],
  },
  {
    id: 'disbursements',
    name: 'Bank Payouts & Host-to-Host (H2H)',
    category: 'banking',
    icon: Landmark,
    href: '/disbursements',
    summary: 'Generate standardized bank transfer files (NACH 306, HDFC, ICICI, SBI NEFT/RTGS), test direct API disbursement, and ingest Reverse MIS reconciliation reports.',
    howToTest: 'Select a finalized payroll run, click "Generate Bank Batch File" to download NACH format or simulate instant H2H transfer.',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
  },
  {
    id: 'payslips',
    name: 'Digital Payslips & Bulk PDF Generation',
    category: 'portal',
    icon: Receipt,
    href: '/payslips',
    summary: 'Branded official employee payslips featuring complete itemized earnings, statutory tax withholdings, attendance stats, and net pay in words.',
    howToTest: 'Click "Preview" on any payslip to view the printable format or trigger window print.',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
  },
  {
    id: 'my-payroll',
    name: 'Employee Self-Service (ESS) Portal',
    category: 'portal',
    icon: UserCheck,
    href: '/my-payroll',
    summary: 'Employee portal allowing staff to access their monthly compensation breakdown, view tax deductions, and download payslips directly.',
    howToTest: 'Switch role to "Employee" in the header and verify that the UI restricts admin menus and displays the self-service dashboard.',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER', 'EMPLOYEE'],
  },
  {
    id: 'reports',
    name: 'Statutory Reports & Analytics',
    category: 'governance',
    icon: BarChart3,
    href: '/reports',
    summary: 'One-click exportable regulatory filings including PF ECR Form, ESI Monthly Return, Form 24Q TDS withholdings, and Department Cost Analytics.',
    howToTest: 'Select "PF ECR Form" or "ESI Monthly" and click "Export CSV" to inspect compliance data.',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
  },
  {
    id: 'audit-logs',
    name: 'Immutable Compliance Audit Trail',
    category: 'governance',
    icon: History,
    href: '/audit-logs',
    summary: 'Complete tamper-evident event log recording every salary change, payroll calculation, approval, and administrative setting modification with timestamp and actor IP.',
    howToTest: 'Filter logs by module or click "View Diff" to inspect state changes before and after an operation.',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
  },
  {
    id: 'departments',
    name: 'Department & Designation Matrix',
    category: 'core',
    icon: Building2,
    href: '/departments',
    summary: 'Organizational hierarchy, department budget tracking, and designation salary bands.',
    howToTest: 'Create a new department and configure min/max salary bands for designations.',
    rolesAllowed: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
  },
];

export function SandboxExplorerModal() {
  const router = useRouter();
  const { showGuideDrawer, setShowGuideDrawer, startTour } = useSandboxGuide();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!showGuideDrawer) return null;

  const filteredFeatures = FEATURE_CATALOG.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.howToTest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Modules (12)' },
    { id: 'core', label: 'Core Engine & Staff' },
    { id: 'statutory', label: 'Statutory & Formulas' },
    { id: 'banking', label: 'Banking & Payouts' },
    { id: 'governance', label: 'Approvals & Audit' },
    { id: 'portal', label: 'Payslips & Self-Service' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900/95 border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200 backdrop-blur-2xl">
        {/* Modal Top Bar */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Sandbox Feature Explorer & Guide
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Interactive Demo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete directory of all modules, statutory formulas, and evaluation guides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowGuideDrawer(false);
                startTour(0);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Interactive Tour</span>
            </button>
            <button
              onClick={() => setShowGuideDrawer(false)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Minute Evaluation Script Banner */}
        <div className="px-6 py-3 bg-indigo-950/40 border-b border-indigo-500/20 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>5-Minute Evaluation Flow:</strong> 1. Switch Role ➔ 2. Check Attendance & LOP ➔ 3. Run Payroll Engine ➔ 4. Approve as Manager ➔ 5. Download Bank NACH File & Payslips
              </span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex-shrink-0 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search features, formulas (PF, ESI, TDS, LOP), banking formats, or workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Category: {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {item.rolesAllowed.map((r) => (
                          <span
                            key={r}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                          >
                            {r === 'SUPER_ADMIN' ? 'Admin' : r === 'PAYROLL_ADMIN' ? 'HR' : r === 'MANAGER' ? 'Mgr' : 'Emp'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.summary}
                    </p>

                    {item.formula && (
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-start gap-1.5">
                        <Calculator className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-400" />
                        <span>{item.formula}</span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200">
                      <strong className="text-amber-400 block text-[9px] uppercase tracking-wider mb-0.5">
                        Sandbox Evaluation Hint
                      </strong>
                      <span>{item.howToTest}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setShowGuideDrawer(false);
                        router.push(item.href);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>Explore in Sandbox</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-semibold">No features found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for PF, attendance, approval, or payslip.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
