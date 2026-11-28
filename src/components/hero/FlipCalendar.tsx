'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Single source of truth: Exactly four roles in the specified order
export const ROLES = [
  'Aspiring Software Engineer',
  'Full Stack Developer',
  'Problem Solver',
  'AI/ML Student',
] as const;

export default function FlipCalendar() {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Single active timers for auto-cycling and transition cleanup
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceRef = useRef<() => void>(() => {});

  const total = ROLES.length; // Exactly 4
  const currentRole = ROLES[index];
  const nextRole = ROLES[(index + 1) % total];

  const currentCount = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const nextCount = `${String(((index + 1) % total) + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  // Core advancement logic with timer synchronization
  const advance = useCallback(() => {
    if (isFlipping) return;

    // Clear any pending timers so auto and manual triggers never conflict
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);

    setIsFlipping(true);

    animTimerRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % total);
      setIsFlipping(false);

      // Reschedule next automatic cycle from this exact point
      autoTimerRef.current = setTimeout(() => {
        advanceRef.current();
      }, 2600);
    }, 500);
  }, [isFlipping, total]);

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  // Initial timer setup with strict-mode cleanup
  useEffect(() => {
    // Start initial timer
    autoTimerRef.current = setTimeout(() => {
      advanceRef.current();
    }, 2400);

    // Guaranteed unmount cleanup preventing React Strict Mode duplicates
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  return (
    <div
      onClick={advance}
      className="inline-block align-middle cursor-pointer select-none group perspective-[800px]"
      title="Click to advance to next role"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advance();
        }
      }}
      aria-label={`Role: ${currentRole} (${currentCount}). Press enter or click to advance.`}
    >
      {/* Paper Card - Tactile ivory paper with crisp dark ink */}
      <div className="relative inline-flex flex-col rounded-2xl border border-[#D5CFC7] bg-gradient-to-b from-[#FBF9F5] via-[#F4EFE6] to-[#EAE3D8] shadow-[0_6px_18px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] px-5 py-3 sm:px-6 sm:py-3.5 transition-transform duration-300 group-hover:-translate-y-0.5">
        {/* Top Wire Spiral Rings */}
        <div className="absolute -top-2.5 inset-x-0 flex items-center justify-around px-4 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-4 rounded-full bg-gradient-to-b from-[#9C9288] via-[#5C544E] to-[#2B2724] shadow-sm border-t border-white/40"
            />
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex items-center justify-between gap-6 sm:gap-8 mt-1">
          {/* Animated Role Text - Large and bold dark ink */}
          <div className="relative h-8 sm:h-9 overflow-hidden min-w-[240px] sm:min-w-[320px]">
            <span
              className={`block text-lg sm:text-2xl font-bold text-[#161616] tracking-tight whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isFlipping ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
              }`}
            >
              {currentRole}
            </span>
            <span
              className={`absolute inset-0 block text-lg sm:text-2xl font-bold text-[#161616] tracking-tight whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isFlipping ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              aria-hidden="true"
            >
              {nextRole}
            </span>
          </div>

          {/* Odometer Counter (01 / 04 to 04 / 04) */}
          <div className="relative h-5 overflow-hidden font-mono text-xs sm:text-sm font-semibold text-[#5C5650] select-none shrink-0 border-l border-[#D5CFC7] pl-3.5">
            <span
              className={`block transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isFlipping ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
              }`}
            >
              {currentCount}
            </span>
            <span
              className={`absolute inset-0 pl-3.5 block transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isFlipping ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              aria-hidden="true"
            >
              {nextCount}
            </span>
          </div>
        </div>

        {/* Paper fold bottom edge shadow */}
        <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#D0C8BF] rounded-b-2xl pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}
