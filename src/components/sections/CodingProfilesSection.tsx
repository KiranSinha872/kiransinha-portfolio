'use client';

import React from 'react';
import type { Profile } from '@/types';
import { ExternalLink, Terminal, Flame, Code2 } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/PlatformIcons';
import Container from '@/components/ui/Container';

interface CodingProfilesSectionProps {
  profile?: Profile | null;
}

export default function CodingProfilesSection({ profile }: CodingProfilesSectionProps) {
  const getUrl = (key: 'github' | 'leetcode' | 'codechef' | 'codeforces') => {
    if (key === 'github' && profile?.githubUrl) return profile.githubUrl;
    if (key === 'leetcode' && profile?.leetcodeUrl) return profile.leetcodeUrl;
    if (key === 'codechef' && profile?.codechefUrl) return profile.codechefUrl;
    if (key === 'codeforces' && profile?.codeforcesUrl) return profile.codeforcesUrl;

    const match = profile?.socials?.find((s) =>
      s.platform.toLowerCase().includes(key.toLowerCase())
    );
    return match?.url || '';
  };

  function getHandle(url: string, fallback: string) {
    if (!url) return fallback;
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const last = parts[parts.length - 1];
        return last.startsWith('@') ? last : `@${last}`;
      }
    } catch {
      // fallback
    }
    return fallback;
  }

  const platforms = [
    {
      id: 'github',
      name: 'GitHub',
      handle: getHandle(getUrl('github'), '@KiranSinha872'),
      url: getUrl('github') || 'https://github.com/KiranSinha872',
      description: 'Open-source repositories, full-stack web applications, and collaborative codebases.',
      icon: <GitHubIcon className="w-5 h-5 text-[var(--foreground)]" />,
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      handle: getHandle(getUrl('leetcode'), '@kiransinha'),
      url: getUrl('leetcode') || 'https://leetcode.com',
      description: 'Algorithmic problem solving, data structures practice, and time-complexity optimization.',
      icon: <Terminal className="w-5 h-5 text-[#0B7658]" />,
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      handle: getHandle(getUrl('codechef'), '@kiransinha'),
      url: getUrl('codechef') || 'https://www.codechef.com',
      description: 'Competitive programming contests, division rated rounds, and mathematical challenge solving.',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      handle: getHandle(getUrl('codeforces'), '@kiransinha'),
      url: getUrl('codeforces') || 'https://codeforces.com',
      description: 'Speed-round programming contests, global algorithmic challenges, and graph theory problem sets.',
      icon: <Code2 className="w-5 h-5 text-blue-500" />,
    },
  ];

  return (
    <section
      id="coding-profiles"
      className="scroll-mt-28 py-20 sm:py-28 bg-[var(--surface)] text-[var(--foreground)] border-b border-[var(--line)] transition-colors duration-250 relative overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="pb-10 border-b border-[var(--line)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0B7658] font-bold">
              [ 04.5 / PROFILES ]
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B7658] animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
            Coding Profiles &amp; Open Source
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-xl">
            Active competitive programming platforms, algorithm rating profiles, and public source code repositories.
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {platforms.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-[var(--line)] bg-[var(--background)] hover:border-[#0B7658]/50 hover:shadow-xs transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {p.icon}
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--muted)] group-hover:text-[#0B7658] transition-colors" />
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                    {p.name}
                  </h3>
                  <span className="text-xs font-mono text-[#0B7658] font-semibold block mt-0.5">
                    {p.handle}
                  </span>
                  <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--line)]/60 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                <span>View Profile</span>
                <span className="group-hover:translate-x-0.5 transition-transform text-[#0B7658]">
                  ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
