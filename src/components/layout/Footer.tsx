'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { GitHubIcon, LinkedInIcon } from '@/components/ui/PlatformIcons';
import { subscribeToProfile } from '@/lib/services/firestore';
import type { Profile } from '@/types';

interface FooterProps {
  profile?: Profile | null;
}

export default function PublicFooter({ profile: initialProfile }: FooterProps) {
  const [clientProfile, setClientProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (initialProfile) return;
    const unsub = subscribeToProfile((data) => {
      if (data) setClientProfile(data);
    });
    return () => unsub();
  }, [initialProfile]);

  const profile = clientProfile ?? initialProfile ?? null;

  const currentYear = new Date().getFullYear();
  const name = profile?.name || 'Kiran Sinha';
  const tagline =
    profile?.title ||
    profile?.headline ||
    profile?.tagline ||
    'B.Tech AI/ML Student & Software Engineer';

  const githubUrl = profile?.githubUrl || 'https://github.com/KiranSinha872';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com';
  const email = profile?.contactEmail || profile?.email || '';

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--line)] py-12 text-[var(--foreground)] transition-colors duration-250">
      <div className="shell">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Name and Title */}
          <div className="text-center md:text-left">
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-[var(--foreground)] hover:text-[#0B7658] transition-colors"
            >
              {name}
            </Link>
            <p className="text-xs text-[var(--muted)] mt-1 font-normal">
              {tagline}
            </p>
          </div>

          {/* Center/Right: Social Icon Links */}
          <div className="flex items-center gap-2">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] flex items-center justify-center text-[var(--foreground)] hover:text-[#0B7658] hover:border-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                aria-label="GitHub Profile"
              >
                <GitHubIcon className="w-4 h-4" />
              </a>
            )}

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] flex items-center justify-center text-[var(--foreground)] hover:text-[#0B7658] hover:border-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                aria-label="LinkedIn Profile"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] flex items-center justify-center text-[var(--foreground)] hover:text-[#0B7658] hover:border-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                aria-label="Email Contact"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom Strip: Copyright + Credit + Discreet Admin Link */}
        <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {currentYear} {name}. All rights reserved.</p>
            <span className="hidden sm:inline text-[var(--line)]">·</span>
            <p className="text-[11px] text-[var(--muted)] font-medium">Design inspired by Rishi Thakor</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-[var(--muted)]"
              title="Admin Login"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
