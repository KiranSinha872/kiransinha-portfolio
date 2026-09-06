'use client';

import React from 'react';
import type { Profile } from '@/types';
import { ArrowUpRight, Terminal, Award, Flame, Code2 } from 'lucide-react';
import { GitHubIcon } from '@/components/public/PlatformIcons';
import FadeIn from '@/components/motion/FadeIn';
import CodingProfilesVideoBackground from './CodingProfilesVideoBackground';

interface CodingProfilesSectionProps {
  profile?: Profile | null;
}

export default function CodingProfilesSection({ profile }: CodingProfilesSectionProps) {
  // Helper to extract social URL from profile fields or socials array
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

  const platforms = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Open source projects, developer tooling, and code repositories',
      url: getUrl('github'),
      icon: <GitHubIcon className="w-5 h-5 text-white" />,
      accentBorder: 'hover:border-white/40',
      badgeBg: 'bg-white/10 text-white',
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      description: 'Data structures, algorithm challenges, and problem solving',
      url: getUrl('leetcode'),
      icon: <Terminal className="w-5 h-5 text-amber-400" />,
      accentBorder: 'hover:border-amber-400/40',
      badgeBg: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      description: 'Competitive programming contests and rated algorithmic challenges',
      url: getUrl('codechef'),
      icon: <Award className="w-5 h-5 text-amber-600" />,
      accentBorder: 'hover:border-amber-600/40',
      badgeBg: 'bg-amber-600/10 text-amber-400 border-amber-600/20',
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      description: 'Global competitive rounds, speed problem solving, and math',
      url: getUrl('codeforces'),
      icon: <Flame className="w-5 h-5 text-red-400" />,
      accentBorder: 'hover:border-red-400/40',
      badgeBg: 'bg-red-400/10 text-red-300 border-red-400/20',
    },
  ];

  // Filter out any platforms without a configured URL
  const activePlatforms = platforms.filter((p) => p.url && p.url.trim().length > 0);

  // If no profiles are set up in admin, do not render empty section
  if (activePlatforms.length === 0) {
    return null;
  }

  return (
    <section id="coding-profiles" className="py-20 sm:py-28 relative overflow-hidden bg-[#0C0C0C]">
      {/* Mux Ambient Streaming Video Background */}
      <CodingProfilesVideoBackground
        src="https://stream.mux.com/Jwr2RhmsNrd6GEspBNgm02vJsRZAGlaoQIh4AucGdASw.m3u8"
        opacity="opacity-35"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <FadeIn y={20}>
          <div className="mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#BBCCD7] font-medium tracking-wider uppercase mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Code2 className="w-3.5 h-3.5" />
              <span>Competitive Programming & Open Source</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text">
              Coding Profiles
            </h2>
            <p className="text-sm font-light text-[#8E9BAE] mt-2 max-w-xl">
              Track my problem-solving journey, competitive contest ratings, and open-source contributions across platforms.
            </p>
          </div>
        </FadeIn>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {activePlatforms.map((platform, idx) => (
            <FadeIn key={platform.id} delay={0.1 * (idx + 1)} y={20}>
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block rounded-2xl bg-black/40 border border-white/10 p-6 sm:p-7 backdrop-blur-md shadow-lg transition-all transform hover:-translate-y-1 ${platform.accentBorder} hover:bg-black/60`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-[#BBCCD7] transition-colors">
                        {platform.name}
                      </h3>
                      <span className="text-xs text-[#8E9BAE] font-mono break-all line-clamp-1">
                        {platform.url.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-full bg-white/5 border border-white/10 text-[#8E9BAE] group-hover:text-white group-hover:border-white/30 transition-all shrink-0">
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                <p className="text-xs font-light text-[#8E9BAE] mt-4 pt-4 border-t border-white/5 leading-relaxed">
                  {platform.description}
                </p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
