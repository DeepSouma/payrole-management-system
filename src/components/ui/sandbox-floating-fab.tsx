'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  BookOpen,
  Compass,
  Eye,
  EyeOff,
  X,
  Shield,
  Layers,
} from 'lucide-react';
import { useSandboxGuide } from '@/lib/sandbox-guide-context';
import { useAuth } from '@/lib/auth-context';

export function SandboxFloatingFab() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    tooltipsEnabled,
    toggleTooltips,
    startTour,
    toggleGuideDrawer,
  } = useSandboxGuide();
  const { user, setRole } = useAuth();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 no-print">
      {/* Expanded Menu Panel */}
      {isOpen && (
        <div className="w-72 bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl text-slate-200 animate-in fade-in slide-in-from-bottom-5 duration-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Sandbox Assistant
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {/* Start Interactive Tour */}
            <button
              onClick={() => {
                setIsOpen(false);
                startTour(0);
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-3 transition-all shadow-md shadow-indigo-600/30"
            >
              <div className="p-1.5 rounded-xl bg-white/20">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Start Guided Tour</div>
                <div className="text-[10px] text-indigo-100">Step-by-step interactive walkthrough</div>
              </div>
            </button>

            {/* Feature Explorer / Cheat Sheet */}
            <button
              onClick={() => {
                setIsOpen(false);
                toggleGuideDrawer();
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 flex items-center gap-3 border border-slate-700 transition-colors"
            >
              <div className="p-1.5 rounded-xl bg-slate-700 text-indigo-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold">Sandbox Feature Guide</div>
                <div className="text-[10px] text-slate-400">Directory of formulas & modules</div>
              </div>
            </button>

            {/* Toggle Tooltips ON/OFF */}
            <button
              onClick={toggleTooltips}
              className={`w-full text-left p-2.5 rounded-2xl flex items-center gap-3 border transition-colors ${
                tooltipsEnabled
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl ${
                  tooltipsEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {tooltipsEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-semibold">
                  Guide Tooltips: {tooltipsEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {tooltipsEnabled ? 'Hover over buttons & stats for hints' : 'Click to re-enable tooltips'}
                </div>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
            🧪 Customer Sandbox Mode Active
          </div>
        </div>
      )}

      {/* Primary Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all"
        title="Interactive Sandbox Guide & Tour"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>
        <Sparkles className="w-4 h-4 text-indigo-200" />
        <span>Sandbox Guide</span>
      </button>
    </div>
  );
}
