'use client';

import React from 'react';
import { HelpCircle, Sparkles, Info } from 'lucide-react';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { TooltipCategory, useSandboxGuide } from '@/lib/sandbox-guide-context';

export interface SandboxBeaconProps {
  title: string;
  description: string;
  category?: TooltipCategory;
  tip?: string;
  formula?: string;
  role?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  variant?: 'help' | 'sparkle' | 'pill';
  label?: string;
  className?: string;
}

export function SandboxBeacon({
  title,
  description,
  category = 'tip',
  tip,
  formula,
  role,
  position = 'top',
  variant = 'help',
  label,
  className = '',
}: SandboxBeaconProps) {
  const { tooltipsEnabled } = useSandboxGuide();

  if (!tooltipsEnabled) {
    return null;
  }

  const renderIcon = () => {
    switch (variant) {
      case 'sparkle':
        return (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-semibold hover:bg-indigo-500/30 transition-all cursor-help shadow-sm ${className}`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            {label && <span>{label}</span>}
          </span>
        );
      case 'pill':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/80 text-[10px] font-semibold hover:border-indigo-500/50 hover:text-white transition-all cursor-help shadow-sm ${className}`}
          >
            <Info className="w-3 h-3 text-indigo-400" />
            {label || 'Guide'}
          </span>
        );
      case 'help':
      default:
        return (
          <button
            type="button"
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-400 border border-indigo-500/30 text-[10px] font-bold transition-colors cursor-help ${className}`}
            aria-label={`Guide info for ${title}`}
          >
            <HelpCircle className="w-3 h-3" />
          </button>
        );
    }
  };

  return (
    <GuideTooltip
      title={title}
      description={description}
      category={category}
      tip={tip}
      formula={formula}
      role={role}
      position={position}
    >
      {renderIcon()}
    </GuideTooltip>
  );
}
