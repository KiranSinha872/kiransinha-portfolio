'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';

const DISCIPLINES = [
  { text: 'Kiran Sinha', bg: '#1F1C1C', color: '#E8E4E0', dir: 1 },
  { text: 'Full-Stack Development', bg: '#22304a', color: '#E8E4E0', dir: -1 },
  { text: 'Data Structures & Algorithms', bg: '#4a3540', color: '#E8E4E0', dir: 1 },
  { text: 'AI & Machine Learning', bg: '#7a8670', color: '#F3EEEC', dir: -1 },
  { text: 'React & Next.js Builder', bg: '#a4552c', color: '#F3EEEC', dir: 1 },
  { text: 'Problem Solver', bg: '#C4B0B0', color: '#1A1818', dir: -1 },
];

const emptySubscribe = () => () => {};

export default function IntroLoader({ onComplete }: { onComplete?: () => void }) {
  // useSyncExternalStore guarantees identical server/client initial render (null) to prevent hydration mismatches
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('ready');
      onComplete?.();
      return;
    }

    try {
      if (sessionStorage.getItem('portfolio_loader_seen') === 'true') {
        document.body.classList.add('ready');
        onComplete?.();
        return;
      }
      sessionStorage.setItem('portfolio_loader_seen', 'true');
    } catch {
      document.body.classList.add('ready');
      onComplete?.();
      return;
    }

    const startTime = performance.now();
    const duration = 1500; // 1.5 seconds

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          setIsExiting(true);
          document.body.classList.add('ready');
          setTimeout(() => {
            setIsDone(true);
            onComplete?.();
          }, 850);
        }, 150);
      }
    };

    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  // Render null during SSR and after completion
  if (!isMounted || isDone) return null;

  // Skip rendering if already visited in this session
  if (typeof window !== 'undefined') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    try {
      if (sessionStorage.getItem('portfolio_loader_seen') === 'true' && progress === 0 && !isExiting) {
        return null;
      }
    } catch {}
  }

  return (
    <div
      className={`fixed inset-0 z-100 overflow-hidden pointer-events-none transition-transform duration-850 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isExiting ? '-translate-y-full' : 'translate-y-0'
      }`}
      aria-hidden="true"
    >
      {/* Background Radial Atmosphere */}
      <div className="absolute inset-0 bg-[#0D0C0C]">
        <div className="absolute inset-0 bg-[radial-gradient(38%_55%_at_0%_72%,rgba(164,85,44,0.25),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_58%_at_100%_70%,rgba(196,176,176,0.16),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(107,92,92,0.3),transparent_70%)]" />
      </div>

      {/* Center Staggered Discipline Pills */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-4 pointer-events-none">
        {DISCIPLINES.map((item, idx) => {
          const threshold = idx * 14;
          const entered = progress >= threshold;
          const offset = item.dir * 40;

          return (
            <div
              key={item.text}
              style={{
                backgroundColor: item.bg,
                color: item.color,
                transform: entered
                  ? 'translate3d(0, 0, 0)'
                  : `translate3d(${offset}px, 0, 0)`,
                opacity: entered ? 1 : 0,
                transition:
                  'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease',
              }}
              className="px-5 py-2.5 sm:px-7 sm:py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-lg border border-white/10 uppercase"
            >
              {item.text}
            </div>
          );
        })}
      </div>

      {/* Numeric Progress Counter 000 -> 100 */}
      <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
        <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-[#E8E4E0] tnum">
          {String(progress).padStart(3, '0')}
        </span>
        <div className="w-24 h-[2px] bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0B7658] transition-all duration-75 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
