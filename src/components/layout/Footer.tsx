'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ArrowUp } from 'lucide-react';
import { GitHubIcon, LinkedInIcon } from '@/components/ui/PlatformIcons';
import { subscribeToProfile } from '@/lib/services/firestore';
import type { Profile } from '@/types';

interface FooterProps {
  profile?: Profile | null;
}

export default function PublicFooter({ profile: initialProfile }: FooterProps) {
  const [clientProfile, setClientProfile] = useState<Profile | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (initialProfile) return;
    const unsub = subscribeToProfile((data) => {
      if (data) setClientProfile(data);
    });
    return () => unsub();
  }, [initialProfile]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const current = Math.max(0, Math.min(1, window.scrollY / totalScroll));
        setScrollProgress(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const profile = clientProfile ?? initialProfile ?? null;
  const currentYear = new Date().getFullYear();
  const name = profile?.name || 'Kiran Sinha';

  const githubUrl = profile?.githubUrl || 'https://github.com/KiranSinha872';
  const linkedinUrl =
    profile?.linkedinUrl || 'https://www.linkedin.com/in/kiran-sinha-555510377/?skipRedirect=true';

  // Circular progress calculations for radius 18, circumference 2 * pi * 18 = 113.1
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--line)] pt-16 pb-12 text-[var(--foreground)] transition-colors duration-250 relative overflow-hidden">
      <div className="shell space-y-12">
        {/* Top Navigation & Back-to-Top Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-[var(--line)]/70">
          <div className="flex items-center gap-6 text-xs font-mono">
            <Link
              href="#home"
              className="hover:text-[#0B7658] text-[var(--foreground)] transition-colors uppercase"
            >
              Home
            </Link>
            <Link
              href="#about"
              className="hover:text-[#0B7658] text-[var(--foreground)] transition-colors uppercase"
            >
              Journey
            </Link>
            <Link
              href="#skills"
              className="hover:text-[#0B7658] text-[var(--foreground)] transition-colors uppercase"
            >
              Skills
            </Link>
            <Link
              href="#projects"
              className="hover:text-[#0B7658] text-[var(--foreground)] transition-colors uppercase"
            >
              Projects
            </Link>
            <Link
              href="#contact"
              className="hover:text-[#0B7658] text-[var(--foreground)] transition-colors uppercase"
            >
              Contact
            </Link>
          </div>

          {/* Circular SVG Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="group relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--background)] border border-[var(--line)] hover:border-[#0B7658] transition-all cursor-pointer shadow-xs"
            aria-label="Scroll back to top"
            title="Back to Top"
          >
            {/* SVG Progress Ring */}
            <svg className="w-12 h-12 -rotate-90 absolute inset-0 pointer-events-none" aria-hidden="true">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="text-[var(--line)]"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="text-[#0B7658] transition-all duration-150"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <ArrowUp className="w-4 h-4 text-[var(--foreground)] group-hover:-translate-y-0.5 group-hover:text-[#0B7658] transition-all relative z-10" />
          </button>
        </div>

        {/* Giant Viewport-Scaled Name Wordmark (Matching Reference Spec) */}
        <div className="w-full overflow-hidden select-none py-2 text-center" aria-hidden="true">
          <span className="block text-[13.5vw] font-black leading-none tracking-tighter uppercase text-[var(--foreground)]/90 hover:text-[#0B7658] transition-colors duration-500">
            {name}
          </span>
        </div>

        {/* Bottom Credits & Legal Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--line)] text-xs text-[var(--muted)] font-mono">
          <div className="flex items-center gap-3">
            <span>© {currentYear} {name}. All rights reserved.</span>
            <span>•</span>
            <span className="text-[var(--muted)]/80">Design inspired by Rishi Thakor</span>
          </div>

          <div className="flex items-center gap-4">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--foreground)] transition-colors"
                title="GitHub"
              >
                <GitHubIcon className="w-4 h-4" />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--foreground)] transition-colors"
                title="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            )}
            <Link
              href="/admin/login"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
              title="Admin Portal"
              aria-label="Admin Portal Login"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
