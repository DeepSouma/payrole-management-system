'use client';

import React from 'react';
import {
  Sparkles,
  BookOpen,
  Compass,
  Eye,
  EyeOff,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useSandboxGuide } from '@/lib/sandbox-guide-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';

export function SandboxBanner() {
  const {
    tooltipsEnabled,
    toggleTooltips,
    startTour,
    toggleGuideDrawer,
  } = useSandboxGuide();

  return (
    <div
      className="border-b px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-30 relative select-none no-print transition-colors duration-300 dark:bg-gradient-to-r dark:from-indigo-950 dark:via-slate-900 dark:to-purple-950 dark:border-indigo-500/20"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Left: Environment Badge & Summary */}
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Interactive Sandbox
        </span>
        <span className="text-slate-300 hidden sm:inline text-xs">
          Explore complete payroll lifecycle with live simulations, statutory formulas & role perspectives.
        </span>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2">
        {/* Start Guided Tour */}
        <GuideTooltip
          title="Interactive Guided Tour"
          description="Takes you on a step-by-step walkthrough covering Role Switching, Employee Setup, Salary Structures, Attendance, Payroll Processing, Approvals, and Bank NACH Payouts."
          category="workflow"
          tip="Click to launch the 10-step interactive walkthrough."
          position="bottom"
        >
          <button
            onClick={() => startTour(0)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-[11px] font-semibold transition-all shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Tour</span>
          </button>
        </GuideTooltip>

        {/* Feature Explorer / Cheat Sheet */}
        <GuideTooltip
          title="Sandbox Feature Explorer & Guide"
          description="Open the searchable directory of all 12 modules, statutory calculation formulas (EPF 12%, ESI 0.75%, LOP deductions), and customer evaluation guides."
          category="feature"
          tip="Use this cheat sheet to quickly find any feature or formula."
          position="bottom"
        >
          <button
            onClick={toggleGuideDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Feature Guide</span>
          </button>
        </GuideTooltip>

        {/* Tooltips Toggle */}
        <GuideTooltip
          title="Guide Tooltips Toggle"
          description="Toggle the visibility of informative guide tooltips and interactive beacons across all buttons, cards, metrics, and forms."
          category="tip"
          tip="Keep tooltips enabled during sandbox evaluation to learn what each feature does."
          position="bottom"
        >
          <button
            onClick={toggleTooltips}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
              tooltipsEnabled
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
          >
            {tooltipsEnabled ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tooltips: ON</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Tooltips: OFF</span>
              </>
            )}
          </button>
        </GuideTooltip>
      </div>
    </div>
  );
}
