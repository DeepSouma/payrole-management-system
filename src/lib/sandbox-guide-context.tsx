'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type TooltipCategory =
  | 'feature'
  | 'action'
  | 'workflow'
  | 'formula'
  | 'compliance'
  | 'tip'
  | 'stat'
  | 'banking';

export interface TourStep {
  id: string;
  title: string;
  category: TooltipCategory;
  description: string;
  sandboxTip: string;
  targetPage: string;
  targetSelector?: string;
  roleRequired?: string;
}

export const SANDBOX_TOUR_STEPS: TourStep[] = [
  {
    id: 'step-role-switcher',
    title: 'Interactive Role Switcher',
    category: 'workflow',
    description:
      'Switch between Super Admin, Payroll Admin (HR Maker), Manager (Approver / Checker), and Employee perspectives to test role-based permissions.',
    sandboxTip: 'Click here to instantly change persona and see how navigation and actions adapt in real-time.',
    targetPage: '/',
    targetSelector: '#tour-role-switcher',
  },
  {
    id: 'step-dashboard-kpis',
    title: 'Live Payroll KPI Command Center',
    category: 'stat',
    description:
      'Live metric cards summarizing total workforce headcount, estimated monthly net payout, gross payroll, and pending approvals.',
    sandboxTip: 'These metrics automatically recalculate whenever salary assignments or payroll runs are processed.',
    targetPage: '/',
    targetSelector: '#tour-dashboard-kpis',
  },
  {
    id: 'step-dept-chart',
    title: 'Department Cost Allocation',
    category: 'stat',
    description:
      'Visual breakdown of total compensation expense distribution across engineering, sales, marketing, and operations.',
    sandboxTip: 'Provides real-time departmental budget visibility before manager sign-off.',
    targetPage: '/',
    targetSelector: '#tour-dept-chart',
  },
  {
    id: 'step-employees',
    title: 'Employee Directory & KYC Master',
    category: 'feature',
    description:
      'Comprehensive employee registry with PAN, Bank IFSC, designation bands, and assigned salary structures.',
    sandboxTip: 'Click "Add Employee" to onboard new hires or "Revise Salary" to assign updated compensation packages.',
    targetPage: '/employees',
    targetSelector: '#tour-employees-table',
  },
  {
    id: 'step-salary-structures',
    title: 'Statutory Formula Architecture',
    category: 'formula',
    description:
      'Statutory compliance cheat sheets for EPF 12% (₹15,000 ceiling), ESI 0.75% (₹21,000 threshold), Professional Tax slabs, and TDS withholdings.',
    sandboxTip: 'The engine uses these statutory rules automatically during monthly batch calculation.',
    targetPage: '/salary-structures',
    targetSelector: '#tour-salary-formulas',
  },
  {
    id: 'step-attendance',
    title: 'Attendance & Loss-of-Pay (LOP) Input',
    category: 'compliance',
    description:
      'Records billable working days, present days, unpaid leaves (LOP), and overtime hours feeding into salary calculations.',
    sandboxTip: 'Edit unpaid leaves (LOP) for any employee, click Save & Sync, and verify pro-rata deduction in Payroll.',
    targetPage: '/attendance',
    targetSelector: '#tour-attendance-table',
  },
  {
    id: 'step-payroll-engine',
    title: 'Automated 4-Step Payroll Engine',
    category: 'action',
    description:
      'Batch calculation engine: pulls attendance, calculates gross earnings, subtracts EPF/ESI/TDS/LOP deductions, and prepares itemized ledgers.',
    sandboxTip: 'Click "Run Calculation Engine" to process August 2026 payroll.',
    targetPage: '/payroll',
    targetSelector: '#tour-payroll-calc-btn',
  },
  {
    id: 'step-payroll-ledger',
    title: 'Itemized Employee Salary Register',
    category: 'formula',
    description:
      'Component-by-component ledger showing exact Basic pay, LOP deductions, overtime additions, EPF 12%, TDS tax, and final Net Payable.',
    sandboxTip: 'Review the live calculations across all active employees.',
    targetPage: '/payroll',
    targetSelector: '#tour-payroll-ledger',
  },
  {
    id: 'step-approvals',
    title: 'Maker-Checker Governance Gate',
    category: 'compliance',
    description:
      'Enforces corporate segregation of duties. Finance/Department Managers inspect payroll variance and sign-off or reject before disbursement.',
    sandboxTip: 'Switch to Manager role to test authorizing or rejecting the payroll run with audit comments.',
    targetPage: '/approvals',
    targetSelector: '#tour-approvals-list',
    roleRequired: 'MANAGER',
  },
  {
    id: 'step-disbursements',
    title: 'Direct Bank APIs & H2H Gateway',
    category: 'banking',
    description:
      'Generate corporate NACH 306 TXT, HDFC ENet, or ICICI CIB clearing files, or execute direct API disbursements with Reverse MIS UTR reconciliation.',
    sandboxTip: 'Click "Generate H2H Bank File" to download sample banking clearing files in sandbox.',
    targetPage: '/disbursements',
    targetSelector: '#tour-disbursements-actions',
  },
  {
    id: 'step-payslips',
    title: 'Digital Payslip Repository',
    category: 'feature',
    description:
      'Audit-ready company payslips featuring official letterhead, itemized earnings vs statutory withholdings, and net pay in words.',
    sandboxTip: 'Click "View & Print" on any payslip to inspect the printable PDF format.',
    targetPage: '/payslips',
    targetSelector: '#tour-payslips-table',
  },
  {
    id: 'step-my-payroll',
    title: 'Employee Self-Service (ESS) Portal',
    category: 'workflow',
    description:
      'Employee portal to view personal CTC compensation breakdown, monthly attendance logs, and download payslips directly.',
    sandboxTip: 'Switch to Employee role to experience self-service capabilities.',
    targetPage: '/my-payroll',
    targetSelector: '#tour-my-payroll-card',
    roleRequired: 'EMPLOYEE',
  },
];

interface SandboxGuideContextType {
  tooltipsEnabled: boolean;
  setTooltipsEnabled: (enabled: boolean) => void;
  toggleTooltips: () => void;
  tourActive: boolean;
  currentTourStep: number;
  startTour: (startStepIndex?: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;
  showGuideDrawer: boolean;
  setShowGuideDrawer: (show: boolean) => void;
  toggleGuideDrawer: () => void;
  totalTourSteps: number;
  currentStepData: TourStep | null;
}

const SandboxGuideContext = createContext<SandboxGuideContextType | undefined>(undefined);

export function SandboxGuideProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [tooltipsEnabled, setTooltipsEnabledState] = useState<boolean>(true);
  const [tourActive, setTourActive] = useState<boolean>(false);
  const [currentTourStep, setCurrentTourStep] = useState<number>(0);
  const [showGuideDrawer, setShowGuideDrawer] = useState<boolean>(false);

  // Initialize tooltips preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('payroll_sandbox_tooltips');
      if (saved !== null) {
        setTooltipsEnabledState(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-start tour after fresh login when the user lands on the dashboard
  useEffect(() => {
    if (pathname !== '/') return;
    try {
      const justLoggedIn = sessionStorage.getItem('payroll_just_logged_in');
      if (justLoggedIn === 'true') {
        sessionStorage.removeItem('payroll_just_logged_in');
        // Delay slightly to let the dashboard finish rendering before positioning tooltips
        const t = setTimeout(() => {
          setCurrentTourStep(0);
          setTourActive(true);
          setTooltipsEnabledState(true);
        }, 800);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  const setTooltipsEnabled = (enabled: boolean) => {
    setTooltipsEnabledState(enabled);
    try {
      localStorage.setItem('payroll_sandbox_tooltips', String(enabled));
    } catch {
      // ignore
    }
  };

  const toggleTooltips = () => {
    setTooltipsEnabled(!tooltipsEnabled);
  };

  const startTour = (startStepIndex = 0) => {
    setCurrentTourStep(startStepIndex);
    setTourActive(true);
    setTooltipsEnabled(true);
    const step = SANDBOX_TOUR_STEPS[startStepIndex];
    if (step && pathname !== step.targetPage) {
      router.push(step.targetPage);
    }
  };

  const nextTourStep = () => {
    if (currentTourStep < SANDBOX_TOUR_STEPS.length - 1) {
      const nextIdx = currentTourStep + 1;
      setCurrentTourStep(nextIdx);
      const step = SANDBOX_TOUR_STEPS[nextIdx];
      if (step && pathname !== step.targetPage) {
        router.push(step.targetPage);
      }
    } else {
      endTour();
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 0) {
      const prevIdx = currentTourStep - 1;
      setCurrentTourStep(prevIdx);
      const step = SANDBOX_TOUR_STEPS[prevIdx];
      if (step && pathname !== step.targetPage) {
        router.push(step.targetPage);
      }
    }
  };

  const endTour = () => {
    setTourActive(false);
    setCurrentTourStep(0);
  };

  const toggleGuideDrawer = () => {
    setShowGuideDrawer((prev) => !prev);
  };

  const currentStepData = tourActive ? SANDBOX_TOUR_STEPS[currentTourStep] || null : null;

  return (
    <SandboxGuideContext.Provider
      value={{
        tooltipsEnabled,
        setTooltipsEnabled,
        toggleTooltips,
        tourActive,
        currentTourStep,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        showGuideDrawer,
        setShowGuideDrawer,
        toggleGuideDrawer,
        totalTourSteps: SANDBOX_TOUR_STEPS.length,
        currentStepData,
      }}
    >
      {children}
    </SandboxGuideContext.Provider>
  );
}

export function useSandboxGuide() {
  const context = useContext(SandboxGuideContext);
  if (!context) {
    throw new Error('useSandboxGuide must be used within a SandboxGuideProvider');
  }
  return context;
}
