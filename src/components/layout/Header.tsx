'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Container from '@/components/ui/Container';
import { subscribeToProfile } from '@/lib/services/firestore';
import type { Profile } from '@/types';

const NAV_LINKS = [
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Certifications', href: '#certifications' },
  { name: 'Education', href: '#education' },
  { name: 'Profiles', href: '#coding-profiles' },
  { name: 'Contact', href: '#contact' },
];

interface HeaderProps {
  profile?: Profile | null;
}

export default function PublicHeader({ profile: initialProfile }: HeaderProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientTagline, setClientTagline] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const tagline = clientTagline ?? (initialProfile?.title || initialProfile?.headline || '');

  useEffect(() => {
    if (initialProfile) return;

    const unsub = subscribeToProfile((profile) => {
      if (profile?.title) {
        setClientTagline(profile.title);
      } else if (profile?.headline) {
        setClientTagline(profile.headline);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsub();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [initialProfile]);

  return (
    <header className="w-full bg-[#F9F9F9] text-[#121212]">
      {/* Top Branding Bar: Tagline (left), KS Logo with green slash (center), Year (right) */}
      <div className="border-b border-[#DADADA]">
        <Container className="h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Left: Tagline from profile title */}
          <div className="flex-1 min-w-0">
            {tagline ? (
              <span
                className="text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-[0.12em] sm:tracking-[0.18em] text-[#5B5B5B] block leading-tight font-medium"
                title={tagline}
              >
                {tagline}
              </span>
            ) : (
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[#5B5B5B]">
                Portfolio
              </span>
            )}
          </div>

          {/* Center: KS Logo with green diagonal slash */}
          <div className="flex items-center justify-center shrink-0">
            <Link
              href="/"
              className="inline-flex items-center text-xl sm:text-2xl font-bold tracking-tight text-[#121212] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2 rounded px-1 transition-opacity hover:opacity-85"
              aria-label="Kiran Sinha — Home"
            >
              <span className="font-heading">K</span>
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
              <span className="font-heading">S</span>
            </Link>
          </div>

          {/* Right: Current year computed in code */}
          <div className="flex-1 flex items-center justify-end gap-3 text-right">
            <span className="text-[11px] sm:text-xs font-serif-num tracking-wider text-[#5B5B5B]">
              © {currentYear}
            </span>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] p-2 text-[#121212] hover:text-[#0B7658] rounded-lg border border-[#DADADA] hover:border-[#0B7658] transition-colors cursor-pointer inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </Container>
      </div>

      {/* Sticky Minimal Navigation */}
      <nav
        aria-label="Primary navigation"
        className="sticky top-0 z-40 w-full bg-[#F9F9F9] border-b border-[#DADADA]"
      >
        <Container className="flex items-center justify-between">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center justify-center w-full gap-1 sm:gap-2 lg:gap-4 py-2.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#5B5B5B] hover:text-[#121212] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </Container>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-[#DADADA] bg-[#F9F9F9] px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] flex items-center text-xs font-semibold uppercase tracking-[0.15em] text-[#5B5B5B] hover:text-[#0B7658] px-3 py-2 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
