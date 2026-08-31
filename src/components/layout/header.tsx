'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Shield,
  Briefcase,
  Users2,
  Sparkles,
  Check,
  LogIn,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth, UserRole } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';

export function Header() {
  const { user, setRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: Array<{ role: UserRole; title: string; desc: string; icon: any }> = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Admin',
      desc: 'Full system configuration, security, audit logs',
      icon: Shield,
    },
    {
      role: 'PAYROLL_ADMIN',
      title: 'Payroll Admin (HR)',
      desc: 'Employee management, salary config, payroll processing',
      icon: Briefcase,
    },
    {
      role: 'MANAGER',
      title: 'Manager / Approver',
      desc: 'Review and approve/reject department payroll runs',
      icon: Users2,
    },
    {
      role: 'EMPLOYEE',
      title: 'Employee (Self-Service)',
      desc: 'View personal payslips, salary details & attendance',
      icon: User,
    },
  ];

  return (
    <header
      className="h-16 backdrop-blur-md border-b px-6 flex items-center justify-between z-20 sticky top-0 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-header)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <GuideTooltip
          title="Universal Payroll Search"
          description="Instant search across employee names, employee codes (EMP-001), designations, departments, and payroll run batches."
          category="feature"
          tip="Type an employee name or 'August' to quickly filter relevant records."
          position="bottom"
          wrapperClassName="w-full"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search employees, payroll runs, payslips..."
              className="w-full text-sm placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all dark:bg-slate-900/90 dark:text-slate-200 dark:border-slate-700/60 dark:focus:border-indigo-500 bg-white/80 text-slate-800 border-slate-200 focus:border-indigo-400"
            />
          </div>
        </GuideTooltip>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Interactive Demo Role Switcher */}
        <GuideTooltip
          title="Interactive Role Persona Switcher"
          description="Instantly switch your active persona between Super Admin, Payroll Admin (HR Maker), Manager (Approver), and Employee (Self-Service) to test access permissions."
          category="action"
          tip="Try switching to 'Manager' to approve pending payroll runs, or 'Employee' to test the self-service payslip portal."
          position="bottom"
        >
          <div className="relative">
            <button
              id="tour-role-switcher"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-200 text-xs font-semibold shadow-sm transition-all dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Role: <strong className="dark:text-white text-indigo-900">{user.role.replace('_', ' ')}</strong></span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl border"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <div
                  className="px-3 py-2 border-b text-[11px] font-semibold uppercase tracking-wider"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                  Switch Interactive Demo Role
                </div>
                <div className="space-y-1 py-1">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isCurrent = user.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          setRole(r.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600/20 border border-indigo-500/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
                        }`}
                        style={{ color: isCurrent ? undefined : 'var(--text-primary)' }}
                      >
                        <div
                          className={`p-1.5 rounded-lg mt-0.5 ${
                            isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold">{r.title}</div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                          </div>
                          <div className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </GuideTooltip>

        {/* 🌙 / ☀️ Dark / Light Mode Toggle */}
        <GuideTooltip
          title="Theme Toggle — Dark / Light Mode"
          description="Switch between dark mode (low-light, reduced eye strain) and light mode (high-contrast, bright workspace)."
          category="tip"
          tip="Your preference is saved automatically and persists across sessions."
          position="bottom"
        >
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative p-2 rounded-xl border transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden group"
            style={{
              backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(251,191,36,0.12)',
              borderColor: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(251,191,36,0.4)',
            }}
          >
            <span
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{
                background: isDark
                  ? 'radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)'
                  : 'radial-gradient(circle at center, rgba(251,191,36,0.2) 0%, transparent 70%)',
              }}
            />
            <span className="relative block w-4 h-4">
              {/* Sun icon — visible in dark mode (click to go light) */}
              <Sun
                className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${
                  isDark ? 'opacity-100 rotate-0 scale-100 text-indigo-300' : 'opacity-0 -rotate-90 scale-50'
                }`}
              />
              {/* Moon icon — visible in light mode (click to go dark) */}
              <Moon
                className={`w-4 h-4 absolute inset-0 transition-all duration-300 ${
                  isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100 text-amber-500'
                }`}
              />
            </span>
          </button>
        </GuideTooltip>

        {/* Notifications */}
        <GuideTooltip
          title="System Notifications & Alerts"
          description="Real-time alerts for pending payroll approvals, disbursement status updates, and compliance reminders."
          category="feature"
          position="bottom"
        >
          <button
            className="relative p-2 rounded-xl border transition-colors hover:scale-105"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2" style={{ boxShadow: '0 0 0 2px var(--bg-surface)' }} />
          </button>
        </GuideTooltip>

        {/* User Card & Logout */}
        <GuideTooltip
          title="Active Session & Profile"
          description="Shows the currently signed-in employee profile, email address, and quick switch/logout link."
          category="tip"
          position="bottom"
        >
          <div className="flex items-center gap-3 pl-3 border-l" style={{ borderColor: 'var(--border-color)' }}>
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30 object-cover"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
              <div className="text-[10px] leading-tight truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
            <Link
              href="/login"
              className="p-1.5 rounded-lg border transition-colors ml-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-400/30 dark:hover:border-rose-500/30 hover:text-rose-500 dark:hover:text-rose-300"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              title="Switch User / Sign In Page"
            >
              <LogIn className="w-3.5 h-3.5" />
            </Link>
          </div>
        </GuideTooltip>
      </div>
    </header>
  );
}

