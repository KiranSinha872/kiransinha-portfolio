'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Code, Share2, Lock } from 'lucide-react';
import { subscribeToProfile } from '@/lib/firestore';
import type { Profile } from '@/types';

interface FooterProps {
  profile?: Profile | null;
}

export default function PublicFooter({ profile: initialProfile }: FooterProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null);

  useEffect(() => {
    const unsub = subscribeToProfile((data) => {
      if (data) setProfile(data);
    });
    return () => unsub();
  }, []);

  const currentYear = new Date().getFullYear();
  const name = profile?.name || 'Kiran Sinha';

  const rawTagline = profile?.tagline || profile?.title || profile?.headline;
  const tagline =
    !rawTagline ||
    rawTagline === 'Full-Stack Software Engineer & Cloud Architect.' ||
    rawTagline === 'Full-Stack Software Engineer & Cloud Architect' ||
    rawTagline === 'Full-Stack Software Engineer' ||
    rawTagline === 'B.Tech AI/ML Student'
      ? 'B.Tech AI/ML Student | Aspiring Software Engineer'
      : rawTagline;

  const githubUrl = profile?.githubUrl || 'https://github.com';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com';
  const email = profile?.contactEmail || profile?.email || 'contact@kiransinha.dev';

  return (
    <footer className="border-t border-white/10 bg-[#080808] py-12 text-sm text-[#8E9BAE]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-bold text-base tracking-tight gradient-text-light">
              {name}
            </span>
            <p className="text-xs text-[#8E9BAE] mt-1 font-light">
              {tagline}
            </p>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="GitHub"
            >
              <Code className="w-4 h-4" />
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="LinkedIn"
            >
              <Share2 className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${email}`}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E9BAE]/60 gap-3">
          <p>© {currentYear} {name}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 opacity-15 hover:opacity-80 transition-opacity cursor-pointer"
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
