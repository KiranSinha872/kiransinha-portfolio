'use client';

import React from 'react';
import type { Profile } from '@/types';
import { ArrowUpRight, Terminal, Award, Flame } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/PlatformIcons';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';

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
      handle: getHandle(getUrl('github'), '@kiransinha'),
      url: getUrl('github'),
      icon: <GitHubIcon className="w-5 h-5 text-[var(--foreground)]" />,
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      handle: getHandle(getUrl('leetcode'), '@kiransinha'),
      url: getUrl('leetcode'),
      icon: <Terminal className="w-5 h-5 text-[#0B7658]" />,
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      handle: getHandle(getUrl('codechef'), '@kiransinha'),
      url: getUrl('codechef'),
      icon: <Award className="w-5 h-5 text-[#0B7658]" />,
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      handle: getHandle(getUrl('codeforces'), '@kiransinha'),
      url: getUrl('codeforces'),
      icon: <Flame className="w-5 h-5 text-[#0B7658]" />,
    },
  ];

  const activePlatforms = platforms.filter((p) => p.url && p.url.trim().length > 0);

  if (activePlatforms.length === 0) {
    return null;
  }

  return (
    <section id="coding-profiles" className="py-16 sm:py-24 bg-[var(--surface)] text-[var(--foreground)] border-b border-[var(--line)] transition-colors duration-250">
      <Container>
        {/* Section Heading */}
        <SectionHeading
          label="PROFILES"
          title="Competitive Programming & Open Source"
          description="Algorithmic problem solving, contest ratings, and developer tooling repositories."
        />

        {/* Minimal Outlined Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {activePlatforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--chip-bg)] border border-[var(--line)] rounded-xl p-5 hover:border-[#0B7658] transition-colors flex items-center justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center shrink-0">
                  {platform.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] tracking-tight group-hover:text-[#0B7658] transition-colors">
                    {platform.name}
                  </h3>
                  <span className="text-xs font-mono text-[var(--muted)]">
                    {platform.handle}
                  </span>
                </div>
              </div>

              <ArrowUpRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[#0B7658] transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
