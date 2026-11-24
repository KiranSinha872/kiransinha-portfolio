'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { GitHubIcon, LinkedInIcon } from '@/components/ui/PlatformIcons';
import Container from '@/components/ui/Container';
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

  const githubUrl = profile?.githubUrl || 'https://github.com';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com';
  const email = profile?.contactEmail || profile?.email || '';

  return (
    <footer className="bg-white border-t border-[#DADADA] py-12 text-[#121212]">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Name and Title */}
          <div className="text-center md:text-left">
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-[#121212] hover:text-[#0B7658] transition-colors"
            >
              {name}
            </Link>
            <p className="text-xs text-[#5B5B5B] mt-1 font-normal">
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
                className="w-9 h-9 rounded-full border border-[#DADADA] bg-[#F9F9F9] flex items-center justify-center text-[#5B5B5B] hover:text-[#0B7658] hover:border-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
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
                className="w-9 h-9 rounded-full border border-[#DADADA] bg-[#F9F9F9] flex items-center justify-center text-[#5B5B5B] hover:text-[#0B7658] hover:border-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                aria-label="LinkedIn Profile"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="w-9 h-9 rounded-full border border-[#DADADA] bg-[#F9F9F9] flex items-center justify-center text-[#5B5B5B] hover:text-[#0B7658] hover:border-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                aria-label="Email Contact"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom Strip: Copyright + Discreet Admin Link */}
        <div className="mt-8 pt-6 border-t border-[#DADADA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5B5B5B] gap-3">
          <p>© {currentYear} {name}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 opacity-25 hover:opacity-80 transition-opacity cursor-pointer text-[#5B5B5B]"
              title="Admin Login"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
