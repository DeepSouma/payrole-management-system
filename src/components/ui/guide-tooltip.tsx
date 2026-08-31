'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  GitBranch,
  Calculator,
  ShieldCheck,
  Landmark,
  TrendingUp,
  Lightbulb,
  Info,
} from 'lucide-react';
import { useSandboxGuide, TooltipCategory } from '@/lib/sandbox-guide-context';

export interface GuideTooltipProps {
  title: string;
  description: string;
  category?: TooltipCategory;
  tip?: string;
  formula?: string;
  role?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  forceShow?: boolean;
}

const CATEGORY_META: Record<
  TooltipCategory,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  feature: {
    label: 'Feature Guide',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
    icon: Sparkles,
  },
  action: {
    label: 'Sandbox Action',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    icon: Zap,
  },
  workflow: {
    label: 'Workflow Step',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    icon: GitBranch,
  },
  formula: {
    label: 'Statutory Formula',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    icon: Calculator,
  },
  compliance: {
    label: 'Compliance & Rule',
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    icon: ShieldCheck,
  },
  banking: {
    label: 'Banking & Payout',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/30',
    icon: Landmark,
  },
  stat: {
    label: 'Payroll KPI',
    bg: 'bg-sky-500/15',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    icon: TrendingUp,
  },
  tip: {
    label: 'Pro Tip',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-300',
    border: 'border-yellow-500/30',
    icon: Lightbulb,
  },
};

export function GuideTooltip({
  title,
  description,
  category = 'feature',
  tip,
  formula,
  role,
  position = 'top',
  children,
  className = '',
  wrapperClassName = '',
  forceShow = false,
}: GuideTooltipProps) {
  const { tooltipsEnabled } = useSandboxGuide();
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; actualPos: string }>({
    top: 0,
    left: 0,
    actualPos: position,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const meta = CATEGORY_META[category] || CATEGORY_META.feature;
  const CategoryIcon = meta.icon;

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    const width = 320; // approximate max tooltip width
    let finalPos = position;

    // Auto-detect if offscreen
    if (position === 'auto' || position === 'top') {
      if (rect.top < 220) {
        finalPos = 'bottom';
      } else {
        finalPos = 'top';
      }
    }

    let top = 0;
    let left = 0;

    if (finalPos === 'top') {
      top = rect.top + scrollY - 12;
      left = rect.left + scrollX + rect.width / 2;
    } else if (finalPos === 'bottom') {
      top = rect.bottom + scrollY + 12;
      left = rect.left + scrollX + rect.width / 2;
    } else if (finalPos === 'left') {
      top = rect.top + scrollY + rect.height / 2;
      left = rect.left + scrollX - 12;
    } else if (finalPos === 'right') {
      top = rect.top + scrollY + rect.height / 2;
      left = rect.right + scrollX + 12;
    }

    // Keep within viewport horizontally
    const minLeft = width / 2 + 16;
    const maxLeft = window.innerWidth - width / 2 - 16;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    setCoords({ top, left, actualPos: finalPos });
  };

  const handleMouseEnter = () => {
    if (!tooltipsEnabled && !forceShow) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    calculatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={`relative inline-block ${wrapperClassName}`}
    >
      {children}

      {isVisible && (tooltipsEnabled || forceShow) && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform:
              coords.actualPos === 'top'
                ? 'translate(-50%, -100%)'
                : coords.actualPos === 'bottom'
                ? 'translate(-50%, 0)'
                : coords.actualPos === 'left'
                ? 'translate(-100%, -50%)'
                : 'translate(0, -50%)',
          }}
          className={`z-50 w-80 max-w-[90vw] p-3.5 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-slate-200 pointer-events-none select-none animate-in fade-in zoom-in-95 duration-150 ${className}`}
        >
          {/* Header Row: Category Badge & Role Tag */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${meta.bg} ${meta.text} ${meta.border}`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{meta.label}</span>
            </span>

            {role && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                Role: {role}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="text-xs font-bold text-white leading-snug tracking-tight mb-1">
            {title}
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-300 leading-relaxed">{description}</p>

          {/* Optional Formula Snippet */}
          {formula && (
            <div className="mt-2.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-start gap-1.5">
              <Calculator className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <span className="font-semibold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">
                  Calculation Formula
                </span>
                <span>{formula}</span>
              </div>
            </div>
          )}

          {/* Optional Sandbox Pro-Tip / Action */}
          {tip && (
            <div className="mt-2.5 p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[10px] text-indigo-200 flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-bold text-amber-300 block text-[9px] uppercase tracking-wider mb-0.5">
                  Sandbox Testing Guide
                </span>
                <span>{tip}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
