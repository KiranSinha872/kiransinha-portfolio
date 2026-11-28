'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import type { Profile } from '@/types';

const emptySubscribe = () => () => {};

const NAV_LINKS = [
  { name: 'About', href: '/#about' },
  { name: 'Skills', href: '/#skills' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Certifications', href: '/#certifications' },
  { name: 'Education', href: '/#education' },
  { name: 'Profiles', href: '/#coding-profiles' },
  { name: 'Contact', href: '/#contact' },
];

interface HeaderProps {
  profile?: Profile | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PublicHeader({ profile }: HeaderProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localTime, setLocalTime] = useState<string>('');
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { mode, toggleMode } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(now);
        setLocalTime(formatted);
      } catch {
        const d = new Date();
        setLocalTime(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--line)] transition-colors duration-250">
      <div className="shell h-16 sm:h-18 flex items-center justify-between gap-4">
        
        {/* Left: Local-time pill (Delhi, IN) - Tagline removed entirely to eliminate any overlap */}
        <div className="flex items-center shrink-0">
          <div
            suppressHydrationWarning
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] text-xs text-[var(--foreground)] shrink-0 select-none"
            title="Local Time in Delhi, India (Asia/Kolkata)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B7658] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B7658]"></span>
            </span>
            <span className="font-semibold text-[11px] tracking-wide uppercase text-[var(--muted)]">
              Delhi, IN
            </span>
            {mounted && localTime && (
              <>
                <span className="text-[var(--line)]">·</span>
                <span
                  suppressHydrationWarning
                  className="tnum font-medium text-[11px] text-[var(--foreground)]"
                >
                  {localTime}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center: KS Logo with green diagonal slash (Preserving Bebas Neue ONLY for monogram) */}
        <div className="flex items-center justify-center shrink-0">
          <Link
            href="/"
            className="inline-flex items-center text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2 rounded px-1 transition-opacity hover:opacity-85"
            aria-label="Kiran Sinha — Home"
          >
            <span className="font-bebas text-2xl sm:text-3xl tracking-wider leading-none">K</span>
            <svg
              className="w-3.5 h-6 text-[#0B7658] mx-0.5 inline-block"
              viewBox="0 0 14 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="11" y1="3" x2="3" y2="21" />
            </svg>
            <span className="font-bebas text-2xl sm:text-3xl tracking-wider leading-none">S</span>
          </Link>
        </div>

        {/* Right: Desktop Navigation + Theme Switcher + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Theme Switcher Button (View Transitions enabled) */}
          <button
            type="button"
            onClick={toggleMode}
            className="p-2 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] hover:bg-[var(--chip-bg-h)] text-[var(--foreground)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mounted ? (
              mode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )
            ) : (
              <span className="w-4 h-4 block" aria-hidden="true" />
            )}
          </button>

          {/* Mobile Menu Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Animated Overlay Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-[var(--line)] bg-[var(--background)] px-6 py-6 transition-colors duration-250">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="py-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] hover:text-[#0B7658] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
