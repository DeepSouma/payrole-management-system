'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Briefcase,
  Users2,
  User,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth, UserRole } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, setRole } = useAuth();

  const [email, setEmail] = useState('payroll.admin@apex-innovations.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const demoAccounts = [
    {
      role: 'SUPER_ADMIN' as UserRole,
      title: 'Super Admin',
      email: 'admin@apex-innovations.io',
      desc: 'System config & settings',
      icon: Shield,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      role: 'PAYROLL_ADMIN' as UserRole,
      title: 'Payroll Admin (HR)',
      email: 'payroll.admin@apex-innovations.io',
      desc: 'Process monthly payroll',
      icon: Briefcase,
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      role: 'MANAGER' as UserRole,
      title: 'Manager / Approver',
      email: 'manager@apex-innovations.io',
      desc: 'Review & authorize runs',
      icon: Users2,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      role: 'EMPLOYEE' as UserRole,
      title: 'Employee',
      email: 'rahul.verma@apex-innovations.io',
      desc: 'View personal payslips',
      icon: User,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Signal that the user just logged in so the dashboard auto-starts the tour
        try { sessionStorage.setItem('payroll_just_logged_in', 'true'); } catch { /* ignore */ }
        if (email.includes('rahul.verma')) {
          router.push('/my-payroll');
        } else {
          router.push('/');
        }
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword('password123');
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await login(acc.email, 'password123');
      if (res.success) {
        // Signal that the user just logged in so the dashboard auto-starts the tour
        try { sessionStorage.setItem('payroll_just_logged_in', 'true'); } catch { /* ignore */ }
        if (acc.role === 'EMPLOYEE') {
          router.push('/my-payroll');
        } else {
          router.push('/');
        }
      } else {
        setErrorMsg(res.error || 'Quick login failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand Value Prop */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                PayrollPro
              </span>
              <span className="block text-xs font-bold uppercase tracking-widest text-indigo-400 -mt-1">
                Enterprise Cloud
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Workforce Compensation & Payroll Suite
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automated salary computation engine, attendance integration, multi-tier approval workflow, and instant official payslips.
            </p>
          </div>

          {/* Quick Demo Login Cards */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              1-Click Demo Accounts (Instant Access)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc)}
                    disabled={isLoading}
                    className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group flex items-start gap-2.5"
                  >
                    <div className={`p-1.5 rounded-lg border text-xs mt-0.5 ${acc.badgeColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {acc.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{acc.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your organizational credentials to access the payroll console
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@apex-innovations.io"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Enter System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
              Secured with Argon2 / BCrypt hashing • Role-Based Access Control
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Reset Password</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Password reset link sent to {forgotEmail}! Please check your corporate inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Enter your registered work email address. We will dispatch a secure 1-time password reset token.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
