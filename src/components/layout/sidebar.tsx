'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Sliders,
  CalendarCheck,
  Calculator,
  CheckCheck,
  Receipt,
  UserCheck,
  BarChart3,
  History,
  Settings,
  Sparkles,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { TooltipCategory } from '@/lib/sandbox-guide-context';

export function Sidebar() {
  const pathname = usePathname();
  const { user, isEmployeeOnly, canApprovePayroll, canManagePayroll } = useAuth();

  const navItems: Array<{
    label: string;
    href: string;
    icon: any;
    badge?: string;
    roles: string[];
    guide: {
      title: string;
      desc: string;
      category: TooltipCategory;
      tip: string;
    };
  }> = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
      guide: {
        title: 'Payroll Command Dashboard',
        desc: 'Executive overview of active workforce, pending payroll batches, monthly cash outflow, and statutory tax status.',
        category: 'stat',
        tip: 'Click here anytime to return to the high-level metrics view.',
      },
    },
    {
      label: 'My Payroll',
      href: '/my-payroll',
      icon: UserCheck,
      badge: 'Portal',
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER', 'EMPLOYEE'],
      guide: {
        title: 'Employee Self-Service (ESS) Portal',
        desc: 'Self-service portal where staff view personal compensation structures, monthly attendance, and download payslips.',
        category: 'workflow',
        tip: 'Switch role to "Employee" to test this portal view in isolation.',
      },
    },
    {
      label: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
      guide: {
        title: 'Employee Directory & KYC Master',
        desc: 'Manage employee profiles, PAN/Aadhaar/IFSC banking credentials, and assign customizable salary templates.',
        category: 'feature',
        tip: 'Click "Add Employee" or select any staff member to test salary package assignment.',
      },
    },
    {
      label: 'Departments',
      href: '/departments',
      icon: Building2,
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
      guide: {
        title: 'Departments & Salary Bands',
        desc: 'Configure organization hierarchy, department budgets, and designation salary bands (min/max pay).',
        category: 'feature',
        tip: 'Add a new department or designation to organize your workforce.',
      },
    },
    {
      label: 'Salary Structures',
      href: '/salary-structures',
      icon: Sliders,
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
      guide: {
        title: 'Salary Structures & Statutory Rules',
        desc: 'Create compensation templates with earnings (Basic, HRA, DA, Special) and statutory deductions (EPF 12%, ESI 0.75%, PT, TDS).',
        category: 'formula',
        tip: 'Explore the formula cards to understand automatic statutory calculations.',
      },
    },
    {
      label: 'Attendance & Leave',
      href: '/attendance',
      icon: CalendarCheck,
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
      guide: {
        title: 'Monthly Attendance & LOP Deductions',
        desc: 'Record present days, paid leaves, and calculate automated unpaid Loss-of-Pay deductions for the payroll engine.',
        category: 'compliance',
        tip: 'Change an employee’s unpaid leaves and click Save to test pro-rata LOP deductions.',
      },
    },
    {
      label: 'Process Payroll',
      href: '/payroll',
      icon: Calculator,
      badge: 'Engine',
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
      guide: {
        title: '4-Step Batch Payroll Engine',
        desc: 'Automated calculation engine that computes gross earnings, EPF, ESI, PT, TDS, and compiles net payable salaries.',
        category: 'action',
        tip: 'Select August 2026 and click "Run Calculation Engine" to generate an itemized run.',
      },
    },
    {
      label: 'Approvals',
      href: '/approvals',
      icon: CheckCheck,
      badge: 'Review',
      roles: ['SUPER_ADMIN', 'MANAGER'],
      guide: {
        title: 'Maker-Checker Multi-Level Approvals',
        desc: 'Review pending payroll batches, inspect employee variance, and sign off or reject with audit comments.',
        category: 'compliance',
        tip: 'Switch role to "Manager" to approve pending payroll batches before disbursement.',
      },
    },
    {
      label: 'Payslips',
      href: '/payslips',
      icon: Receipt,
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
      guide: {
        title: 'Official Payslips & PDF Generation',
        desc: 'Search, preview, and print branded employee salary slips with earnings, deductions, and net pay in words.',
        category: 'feature',
        tip: 'Click "Preview" on any payslip to view the printable format.',
      },
    },
    {
      label: 'Bank & H2H Payouts',
      href: '/disbursements',
      icon: Landmark,
      badge: 'Banking',
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
      guide: {
        title: 'Bank Batch Files & Direct H2H Payouts',
        desc: 'Generate NACH 306, HDFC, ICICI, SBI payout batch files, simulate direct API transfers, and ingest Reverse MIS.',
        category: 'banking',
        tip: 'Click "Generate Bank Batch File" to download ready-to-upload files.',
      },
    },
    {
      label: 'Reports & Analytics',
      href: '/reports',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'],
      guide: {
        title: 'Statutory Reports & Compliance Filings',
        desc: 'Export regulatory compliance reports (PF ECR, ESI Monthly, TDS 24Q) and department salary analytics in CSV.',
        category: 'compliance',
        tip: 'Select PF ECR Form and click "Export CSV" to inspect compliance format.',
      },
    },
    {
      label: 'Audit Trail',
      href: '/audit-logs',
      icon: History,
      roles: ['SUPER_ADMIN', 'PAYROLL_ADMIN'],
      guide: {
        title: 'Immutable Compliance Audit Trail',
        desc: 'Tamper-evident system event log capturing every salary change, payroll run, approval, and config edit.',
        category: 'compliance',
        tip: 'Click "View Diff" to inspect state changes made during sandbox operations.',
      },
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
      guide: {
        title: 'Organization Profile & Global Rules',
        desc: 'Configure corporate entities, statutory PF rates (12%), working days per month, and tax deduction thresholds.',
        category: 'feature',
        tip: 'Adjust default parameters to see how global rules affect future calculations.',
      },
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PAYROLL_ADMIN: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    MANAGER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    EMPLOYEE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <aside
      className="w-64 border-r flex flex-col flex-shrink-0 z-30 select-none min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)' }}
    >
      {/* Brand Header */}
      <GuideTooltip
        title="PayrollPro Cloud Enterprise"
        description="Next-generation automated enterprise payroll management system featuring multi-entity support, statutory compliance, and banking integration."
        category="feature"
        position="right"
      >
        <div
          className="h-16 flex items-center px-6 gap-3 border-b cursor-pointer"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              PayrollPro
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-indigo-400 -mt-1">
              Enterprise Cloud
            </span>
          </div>
        </div>
      </GuideTooltip>

      {/* Role Indicator Badge */}
      <div className="px-4 pt-4 pb-2">
        <GuideTooltip
          title={`Active Persona: ${user.role.replace('_', ' ')}`}
          description={`Your UI navigation and permissions are currently adapted for ${user.role.replace('_', ' ')}. You can change roles using the top-right header switcher.`}
          category="workflow"
          tip="Switch roles to test different personas and maker-checker approval rules."
          position="right"
          wrapperClassName="w-full"
        >
          <div className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between font-medium ${roleColors[user.role]}`}>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user.role.replace('_', ' ')}</span>
            </div>
            <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              Active
            </span>
          </div>
        </GuideTooltip>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <GuideTooltip
              key={item.href}
              title={item.guide.title}
              description={item.guide.desc}
              category={item.guide.category}
              tip={item.guide.tip}
              position="right"
              wrapperClassName="w-full block"
            >
              <Link
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-200'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </GuideTooltip>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div
        className="p-4 border-t bg-slate-900/40 dark:bg-slate-900/40"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <GuideTooltip
          title="Sandbox System Health & Engine Status"
          description="High-availability PostgreSQL database backend with instant sub-millisecond calculation response time."
          category="stat"
          position="right"
          wrapperClassName="w-full"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              DB: PostgreSQL 16
            </span>
            <span className="text-[11px] text-slate-400">v1.0.0</span>
          </div>
        </GuideTooltip>
      </div>
    </aside>
  );
}
