'use client';

import React, { useState, useEffect, useRef } from 'react';

const ROLES = [
  'Full-Stack Developer',
  'AI/ML Student',
  'React & Next.js Builder',
  'Problem Solver',
  'Aspiring Software Engineer',
];

export default function FlipCalendar() {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = ROLES.length;
  const currentRole = ROLES[index];
  const nextRole = ROLES[(index + 1) % total];

  const currentCount = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const nextCount = `${String(((index + 1) % total) + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  const triggerFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    setTimeout(() => {
      setIndex((prev) => (prev + 1) % total);
      setIsFlipping(false);
    }, 600);
  };

  useEffect(() => {
    const cycle = () => {
      if (document.hidden) {
        timerRef.current = setTimeout(cycle, 1000);
        return;
      }
      setIsFlipping(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % total);
        setIsFlipping(false);
      }, 600);
      timerRef.current = setTimeout(cycle, 2600);
    };

    timerRef.current = setTimeout(cycle, 2200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [total]);

  return (
    <div
      onClick={triggerFlip}
      className="inline-block align-middle cursor-pointer select-none group perspective-[800px]"
      title="Click to flip role"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerFlip();
        }
      }}
      aria-label={`Role: ${currentRole}. Press enter to cycle.`}
    >
      <div className="relative inline-flex flex-col rounded-xl border border-[#C5BFB8] dark:border-[#383333] bg-gradient-to-b from-[#FAF8F5] to-[#EAE6DF] dark:from-[#2A2525] dark:to-[#1E1B1B] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] px-4 py-2 sm:px-5 sm:py-2.5 transition-transform duration-300 group-hover:-translate-y-0.5">
        
        {/* Top Wire Spiral Rings */}
        <div className="absolute -top-2 inset-x-0 flex items-center justify-around px-3 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-[#8C827A] to-[#4A423D] dark:from-[#665E5E] dark:to-[#221F1F] shadow-sm"
            />
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex items-center justify-between gap-4 mt-0.5">
          {/* Animated Role Text */}
          <div className="relative h-6 sm:h-7 overflow-hidden min-w-[200px] sm:min-w-[240px]">
            <span
              className={`block text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isFlipping
                  ? '-translate-y-full opacity-0'
                  : 'translate-y-0 opacity-100'
              }`}
            >
              {currentRole}
            </span>
            <span
              className={`absolute inset-0 block text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isFlipping
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-full opacity-0'
              }`}
            >
              {nextRole}
            </span>
          </div>

          {/* Odometer Numeric Counter: 01 / 05 */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono tracking-wider font-semibold text-[var(--muted)] border-l border-[var(--line)] pl-3">
            <span className="tnum text-[#0B7658] dark:text-[#34D399]">
              {isFlipping ? nextCount : currentCount}
            </span>
          </div>
        </div>

        {/* Paper Leaf Drop-Shadow line at bottom */}
        <div className="absolute inset-x-2 -bottom-1 h-1 bg-[#D8D2C8] dark:bg-[#181515] rounded-b-md -z-10 shadow-xs" />
      </div>
    </div>
  );
}
