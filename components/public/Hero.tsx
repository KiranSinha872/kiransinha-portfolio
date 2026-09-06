'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, FileText, User, ArrowUpRight } from 'lucide-react';
import FadeIn from '@/components/motion/FadeIn';
import Magnet from '@/components/motion/Magnet';
import ResumeViewerModal from './ResumeViewerModal';
import HeroBirdsBackground from './HeroBirdsBackground';
import type { Profile } from '@/types';

interface HeroProps {
  profile?: Profile | null;
}

export default function PublicHero({ profile }: HeroProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  const name = profile?.name || 'Kiran Sinha';
  const rawTitle = profile?.tagline || profile?.title || profile?.headline;
  const title =
    !rawTitle ||
    rawTitle === 'Full-Stack Software Engineer & Cloud Architect.' ||
    rawTitle === 'Full-Stack Software Engineer & Cloud Architect' ||
    rawTitle === 'Full-Stack Software Engineer' ||
    rawTitle === 'B.Tech AI/ML Student'
      ? 'B.Tech AI/ML Student | Aspiring Software Engineer'
      : rawTitle;
  const bio =
    profile?.bio ||
    profile?.about ||
    'Building robust, accessible, and performant web products with Next.js, TypeScript, and modern cloud architectures.';
  const avatarUrl = profile?.avatarUrl;
  const resumeUrl = profile?.resumeUrl;

  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden bg-[#0C0C0C]">
      {/* Vanta.js Birds Ambient Animated Background */}
      <HeroBirdsBackground />

      {/* Background Subtle Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-b from-[#BBCCD7]/10 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Hero Typography & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* 1. Status Badge */}
            <FadeIn delay={0.1} y={15}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#BBCCD7] text-xs font-normal tracking-wide backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Available for Opportunities</span>
              </div>
            </FadeIn>

            {/* 2. Main Name / Hero Heading */}
            <FadeIn delay={0.2} y={20}>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] gradient-text">
                {name}
              </h1>
            </FadeIn>

            {/* 3. Subheading / Professional Title */}
            <FadeIn delay={0.3} y={20}>
              <p className="text-xl sm:text-2xl font-light text-[#EDEDED] tracking-wide">
                {title}
              </p>
            </FadeIn>

            {/* 4. Bio */}
            <FadeIn delay={0.4} y={20}>
              <p className="text-sm sm:text-base font-light text-[#8E9BAE] leading-relaxed max-w-xl">
                {bio}
              </p>
            </FadeIn>

            {/* 5. CTA Buttons */}
            <FadeIn delay={0.5} y={20} className="w-full">
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#BBCCD7] text-[#0C0C0C] text-xs sm:text-sm font-semibold tracking-wide hover:bg-white shadow-[0_0_20px_rgba(187,204,215,0.25)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Get in Touch</span>
                </Link>

                {resumeUrl ? (
                  <button
                    type="button"
                    onClick={() => setResumeModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-xs sm:text-sm font-medium tracking-wide hover:bg-white/10 hover:border-white/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#BBCCD7]" />
                    <span>View Resume</span>
                  </button>
                ) : (
                  <Link
                    href="#projects"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-xs sm:text-sm font-medium tracking-wide hover:bg-white/10 hover:border-white/20 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>View Projects</span>
                    <ArrowUpRight className="w-4 h-4 text-[#BBCCD7]" />
                  </Link>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Profile Showcase */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <FadeIn delay={0.55} y={30} className="w-full max-w-[340px] sm:max-w-[380px]">
              <Magnet strength={15} className="w-full">
                <div className="relative group p-2 rounded-[32px] bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 shadow-2xl backdrop-blur-md">
                  <div className="relative w-full aspect-square rounded-[26px] overflow-hidden bg-[#141414] flex items-center justify-center select-none">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={`${name}'s Portrait`}
                        fill
                        priority
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        sizes="(max-width: 768px) 340px, 380px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#8E9BAE] p-8 select-none pointer-events-none">
                        <User className="w-20 h-20 stroke-[1.2]" />
                        <span className="text-xs mt-3 tracking-widest uppercase font-light">Kiran Sinha</span>
                      </div>
                    )}
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C]/70 via-transparent to-transparent opacity-90 pointer-events-none" />
                  </div>
                </div>
              </Magnet>
            </FadeIn>
          </div>

        </div>
      </div>

      {/* Interactive Resume Viewer Modal */}
      <ResumeViewerModal
        isOpen={resumeModalOpen}
        resumeUrl={resumeUrl || ''}
        title={`${name} - Resume`}
        onClose={() => setResumeModalOpen(false)}
      />
    </section>
  );
}
