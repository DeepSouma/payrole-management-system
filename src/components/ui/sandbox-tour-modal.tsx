'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { useSandboxGuide } from '@/lib/sandbox-guide-context';

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'bottom' | 'top' | 'center';
  targetRect?: DOMRect;
}

export function SandboxTourModal() {
  const {
    tourActive,
    currentTourStep,
    nextTourStep,
    prevTourStep,
    endTour,
    currentStepData,
    totalTourSteps,
  } = useSandboxGuide();

  const [position, setPosition] = useState<TooltipPosition>({
    top: 100,
    left: 100,
    placement: 'bottom',
  });
  const [targetFound, setTargetFound] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Position calculation effect
  useEffect(() => {
    if (!tourActive || !currentStepData) return;

    let retryCount = 0;
    const maxRetries = 15;

    const calculatePosition = () => {
      const selector = currentStepData.targetSelector;
      let targetEl: HTMLElement | null = null;

      if (selector) {
        targetEl = document.querySelector(selector) as HTMLElement;
      }

      if (!targetEl) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(calculatePosition, 120);
        } else {
          // Fallback to floating card if target element not found
          setTargetFound(false);
          setPosition({
            top: 90,
            left: Math.max(16, window.innerWidth / 2 - 210),
            placement: 'bottom',
          });
        }
        return;
      }

      setTargetFound(true);

      // Scroll element smoothly into center view
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

      // Highlight target element with a glowing spotlight class
      document.querySelectorAll('.tour-active-spotlight').forEach((el) => {
        el.classList.remove(
          'tour-active-spotlight',
          'ring-4',
          'ring-indigo-500/90',
          'shadow-[0_0_35px_rgba(99,102,241,0.6)]',
          'z-30',
          'relative'
        );
      });

      targetEl.classList.add(
        'tour-active-spotlight',
        'ring-4',
        'ring-indigo-500/90',
        'shadow-[0_0_35px_rgba(99,102,241,0.6)]',
        'z-30',
        'relative'
      );

      const rect = targetEl.getBoundingClientRect();
      const cardWidth = 420;
      const cardEstimatedHeight = 280;
      const margin = 14;

      let top = rect.bottom + margin;
      let placement: 'bottom' | 'top' = 'bottom';

      // If bottom overflows viewport, place above element
      if (top + cardEstimatedHeight > window.innerHeight - 20) {
        top = Math.max(16, rect.top - cardEstimatedHeight - margin);
        placement = 'top';
      }

      // Align horizontally centered with the target element
      let left = rect.left + rect.width / 2 - cardWidth / 2;

      // Keep within horizontal bounds of screen
      if (left < 16) left = 16;
      if (left + cardWidth > window.innerWidth - 16) {
        left = window.innerWidth - cardWidth - 16;
      }

      setPosition({
        top: Math.max(16, top),
        left: Math.max(16, left),
        placement,
        targetRect: rect,
      });
    };

    // Trigger calculation
    const timer = setTimeout(calculatePosition, 80);

    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.querySelectorAll('.tour-active-spotlight').forEach((el) => {
        el.classList.remove(
          'tour-active-spotlight',
          'ring-4',
          'ring-indigo-500/90',
          'shadow-[0_0_35px_rgba(99,102,241,0.6)]',
          'z-30',
          'relative'
        );
      });
    };
  }, [tourActive, currentTourStep, currentStepData]);

  // Keyboard navigation
  useEffect(() => {
    if (!tourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextTourStep();
      } else if (e.key === 'ArrowLeft') {
        prevTourStep();
      } else if (e.key === 'Escape') {
        endTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tourActive, nextTourStep, prevTourStep, endTour]);

  if (!tourActive || !currentStepData) return null;

  const isLastStep = currentTourStep === totalTourSteps - 1;
  const progressPercent = Math.round(((currentTourStep + 1) / totalTourSteps) * 100);

  return (
    <>
      {/* Non-blocking anchored guide tooltip container */}
      <div
        ref={cardRef}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: '420px',
        }}
        className="fixed z-50 transition-all duration-300 ease-out animate-in fade-in zoom-in-95 pointer-events-auto"
      >
        {/* Pointing pointer beacon arrow */}
        {targetFound && position.targetRect && (
          <div
            className={`absolute w-0 h-0 border-solid pointer-events-none transition-all duration-200 ${
              position.placement === 'bottom'
                ? '-top-2 left-1/2 -translate-x-1/2 border-x-[8px] border-x-transparent border-b-[8px] border-b-indigo-500'
                : '-bottom-2 left-1/2 -translate-x-1/2 border-x-[8px] border-x-transparent border-t-[8px] border-t-indigo-500'
            }`}
          />
        )}

        <div className="bg-slate-900/95 border-2 border-indigo-500/80 rounded-3xl p-5 shadow-[0_12px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.35)] backdrop-blur-xl text-slate-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                Guide Step {currentTourStep + 1} of {totalTourSteps}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentStepData.category}
              </span>
              <button
                onClick={endTour}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Exit Tour (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-3.5">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step Content */}
          <div className="space-y-2">
            <h4 className="text-base font-extrabold text-white tracking-tight leading-snug">
              {currentStepData.title}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Sandbox Evaluation Hint */}
            <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-start gap-2 mt-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-200 leading-relaxed font-medium">
                {currentStepData.sandboxTip}
              </p>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/90">
            <button
              onClick={prevTourStep}
              disabled={currentTourStep === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                currentTourStep === 0
                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={endTour}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors"
              >
                Skip
              </button>

              <button
                onClick={nextTourStep}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <span>{isLastStep ? 'Finish Tour 🎉' : 'Next'}</span>
                {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
