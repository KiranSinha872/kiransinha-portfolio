'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, ArrowRight, Sparkles } from 'lucide-react';
import { LinkedInIcon } from '@/components/ui/PlatformIcons';
import PublicResumeModal from '@/components/ui/PublicResumeModal';
import PullCord from '@/components/hero/PullCord';
import IntroLoader from '@/components/hero/IntroLoader';
import FlipCalendar from '@/components/hero/FlipCalendar';
import type { Profile } from '@/types';

interface HeroProps {
  profile?: Profile | null;
}

export default function PublicHero({ profile }: HeroProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [portraitRevealed, setPortraitRevealed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Short bio preview
  const bio =
    profile?.bio ||
    profile?.about ||
    'Building robust, accessible, and performant web products with Next.js, TypeScript, and modern cloud architectures.';
  const shortBio = bio.split(/(?<=[.!?])\s+/)[0] || bio;

  const resumeUrl = profile?.resumeUrl;
  const linkedinUrl =
    profile?.linkedinUrl ||
    'https://www.linkedin.com/in/kiran-sinha-555510377/?skipRedirect=true';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--line)] overflow-hidden pt-6 sm:pt-10 lg:pt-12 pb-0 transition-colors duration-250"
      aria-label="Introduction"
    >
      {/* 1. Staggered Intro Loader (Session-based, reduced-motion compliant, hydration-safe) */}
      <IntroLoader />

      {/* 2. Verlet Physics Pull-Cord Lamp */}
      <PullCord />

      <div className="shell relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between min-h-[460px] sm:min-h-[540px] lg:min-h-[640px] gap-8 lg:gap-4">
          
          {/* Left Text & Interactive Intro Column */}
          <div className="w-full lg:w-1/2 flex flex-col items-start pb-8 sm:pb-12 lg:pb-16 z-20">
            
            {/* Top Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] text-xs text-[var(--muted)] font-medium mb-4 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B7658]" />
              <span>Aspiring Software Engineer</span>
            </div>

            {/* Headline with Greeting */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--foreground)] leading-[1.04]">
                Hi, I&apos;m Kiran.
              </h1>

              {/* Grey "I am a" connector line matching the reference */}
              <p className="text-sm sm:text-base font-semibold uppercase tracking-wider text-[var(--muted)] pt-1">
                I am a
              </p>

              {/* Spiral-Notebook Flip Card Cycling Roles */}
              <div className="pt-0.5 pb-1">
                <FlipCalendar />
              </div>
            </motion.div>

            {/* Bio Paragraph */}
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[var(--foreground)]/80 max-w-[440px] leading-relaxed font-normal">
              {shortBio}
            </p>

            {/* Action Buttons */}
            <div className="mt-7 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Primary "Get in touch" */}
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)] text-xs sm:text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-all cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
              >
                <span>Get in touch</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Outline "See my work" */}
              <button
                type="button"
                onClick={() => scrollToSection('projects')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--foreground)] text-xs sm:text-sm font-semibold tracking-wider uppercase hover:border-[#0B7658] hover:text-[#0B7658] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
              >
                <span>See my work</span>
              </button>

              {/* Resume View Button */}
              {resumeUrl && (
                <button
                  type="button"
                  onClick={() => setResumeModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--foreground)] text-xs sm:text-sm font-semibold tracking-wider uppercase hover:border-[#0B7658] hover:text-[#0B7658] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                  title="View Resume"
                >
                  <FileText className="w-4 h-4 text-[#0B7658]" />
                  <span>Resume</span>
                </button>
              )}

              {/* LinkedIn Link */}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--foreground)] text-xs sm:text-sm font-semibold tracking-wider uppercase hover:border-[#0B7658] hover:text-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                  aria-label="LinkedIn Profile"
                >
                  <LinkedInIcon className="w-4 h-4 text-[#0B7658]" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>

          </div>

          {/* Right Column: Cut-Out Portrait with Hover Color Reveal & Atmospheric Circle */}
          <div className="relative w-full lg:w-1/2 h-[420px] sm:h-[500px] lg:h-[620px] flex items-end justify-center lg:justify-end">
            <div
              tabIndex={0}
              role="region"
              aria-label="Portrait of Kiran Sinha. Hover, tap, or focus to reveal full color."
              onMouseEnter={() => setPortraitRevealed(true)}
              onMouseLeave={() => setPortraitRevealed(false)}
              onFocus={() => setPortraitRevealed(true)}
              onBlur={() => setPortraitRevealed(false)}
              onClick={() => setPortraitRevealed((prev) => !prev)}
              className="group relative h-[94%] w-auto flex items-end mr-0 lg:mr-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-4 rounded-3xl"
            >
              {/* Reference Atmospheric Backdrop Circle: Hidden/neutral at rest, fades in on hover/focus */}
              <div
                className={`absolute z-0 h-[78%] aspect-square rounded-full bg-gradient-to-tr from-[#2F9E73] to-[#7a8670] -top-[2%] left-[55%] -translate-x-1/2 pointer-events-none blur-[1px] transition-opacity duration-550 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  portraitRevealed
                    ? 'opacity-80 dark:opacity-60'
                    : 'opacity-0 group-hover:opacity-80 dark:group-hover:opacity-60 group-focus-visible:opacity-80'
                }`}
                aria-hidden="true"
              />

              {/* Floating "My developer card" Badge on the portrait (Placed at chest area, keeping face clear) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSection('developer-card-placeholder');
                }}
                className="absolute top-[52%] sm:top-[48%] -left-3 sm:-left-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--background)]/95 backdrop-blur-md shadow-xl text-xs font-semibold text-[var(--foreground)] hover:border-[#0B7658] hover:scale-105 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
                title="Explore Developer Card"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0B7658]" />
                <span>My developer card</span>
              </button>

              {/* High-Resolution Cut-Out Portrait: Greyscale by default, transitions to full color on hover/focus/tap */}
              <Image
                src="/images/my-photo.png"
                alt="Kiran Sinha"
                width={515}
                height={1024}
                priority
                unoptimized
                className={`relative z-10 h-full w-auto block select-none pointer-events-none drop-shadow-xl transition-[filter] duration-550 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                  portraitRevealed
                    ? 'grayscale-0'
                    : 'grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0'
                }`}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Status Hairline Strip */}
      <div className="border-t border-[var(--line)] bg-[var(--surface)]/50 text-[var(--muted)] text-xs font-medium py-3.5 transition-colors duration-250">
        <div className="shell flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B7658] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B7658]" />
            </span>
            <span className="text-[var(--foreground)] font-semibold">Available for internships</span>
          </div>

          <div className="text-[11px] sm:text-xs">
            Based in Delhi, India
          </div>

          <div>
            <Link
              href="#about"
              className="group inline-flex items-center gap-1.5 hover:text-[#0B7658] text-[var(--foreground)] transition-colors"
            >
              <span>Scroll to explore</span>
              <span className="transform transition-transform group-hover:translate-y-0.5">↓</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Placeholder Anchor for Developer Card (Phase 4 target) */}
      <div id="developer-card-placeholder" className="sr-only" aria-hidden="true" />

      {/* Resume Viewer Modal */}
      <PublicResumeModal
        isOpen={resumeModalOpen}
        resumeUrl={resumeUrl || ''}
        title="Kiran Sinha — Resume"
        onClose={() => setResumeModalOpen(false)}
      />
    </section>
  );
}
