'use client';

import React, { useState, useEffect } from 'react';

const DISCIPLINES = [
  { text: 'Kiran Sinha', bg: '#1F1C1C', color: '#E8E4E0', dir: 1 },
  { text: 'Full-Stack Development', bg: '#22304a', color: '#E8E4E0', dir: -1 },
  { text: 'Data Structures & Algorithms', bg: '#4a3540', color: '#E8E4E0', dir: 1 },
  { text: 'AI & Machine Learning', bg: '#7a8670', color: '#F3EEEC', dir: -1 },
  { text: 'React & Next.js Builder', bg: '#a4552c', color: '#F3EEEC', dir: 1 },
  { text: 'Problem Solver', bg: '#C4B0B0', color: '#1A1818', dir: -1 },
];

function checkShouldShowLoader(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('ready');
    return false;
  }
  try {
    if (sessionStorage.getItem('portfolio_loader_seen') === 'true') {
      document.body.classList.add('ready');
      return false;
    }
    sessionStorage.setItem('portfolio_loader_seen', 'true');
    return true;
  } catch {
    return false;
  }
}

export default function IntroLoader({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState<boolean>(checkShouldShowLoader);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!visible) {
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
            setVisible(false);
            onComplete?.();
          }, 850);
        }, 150);
      }
    };

    const animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [visible, onComplete]);

  if (!visible) return null;

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
          // Pill entrance activates sequentially based on progress threshold
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
              }}
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom HUD: Counter and Progress Bar */}
      <div className="absolute bottom-10 inset-x-0 shell flex flex-col sm:flex-row items-center justify-between gap-4 text-[#E8E4E0] text-xs">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <span className="font-bold text-[#E8E4E0]">Kiran Sinha</span>
          <span>·</span>
          <span>B.Tech AI/ML Student & Software Engineer</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
            Loading Portfolio
          </span>
          <span className="tnum font-mono text-base font-bold text-[#E8E4E0] w-12 text-right">
            {String(progress).padStart(3, '0')}
          </span>
          <div className="w-24 sm:w-36 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E8E4E0] transition-all duration-75 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
