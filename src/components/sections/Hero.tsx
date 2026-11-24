'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText } from 'lucide-react';
import Container from '@/components/ui/Container';
import PublicResumeModal from '@/components/ui/PublicResumeModal';
import type { Profile } from '@/types';

interface HeroProps {
  profile?: Profile | null;
}

export default function PublicHero({ profile }: HeroProps) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Name derivation: split into stacked First and Last name
  const fullName = (profile?.name || 'Kiran Sinha').trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || 'KIRAN';
  const lastName = nameParts.slice(1).join(' ') || 'SINHA';

  // Subtitle from profile title
  const title =
    profile?.title ||
    profile?.headline ||
    profile?.tagline ||
    'B.Tech AI/ML Student | Aspiring Software Engineer';

  // Short intro line from the bio
  const bio =
    profile?.bio ||
    profile?.about ||
    'Building robust, accessible, and performant web products with Next.js, TypeScript, and modern cloud architectures.';
  const shortBio = bio.split(/(?<=[.!?])\s+/)[0] || bio;

  const resumeUrl = profile?.resumeUrl;

  return (
    <section className="relative bg-[#F9F9F9] text-[#121212] border-b border-[#DADADA] overflow-x-clip pt-4 sm:pt-6 lg:pt-8 pb-0">
      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between min-h-[420px] sm:min-h-[520px] lg:min-h-[620px] xl:min-h-[680px]">
          
          {/* Left text column: w-full lg:w-1/2 so it never reaches the circle */}
          <div className="w-full lg:w-1/2 flex flex-col items-start pb-8 sm:pb-12 lg:pb-16 z-20">
            
            {/* 1. Stacked first name / last name: Bebas Neue, tall and narrow, clean gap without overlap */}
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading uppercase text-[#121212] tracking-normal leading-[0.96] text-[clamp(4.25rem,10.5vw,9.25rem)] select-none"
            >
              <span className="block">{firstName}</span>
              <span className="block">{lastName}</span>
            </motion.h1>

            {/* 2. Green subtitle: uppercase, letter-spaced, bold, wraps cleanly on tablet, single-line on xl */}
            <p className="mt-4 sm:mt-5 text-xs sm:text-sm font-bold tracking-[0.22em] uppercase text-[#0B7658] whitespace-normal xl:whitespace-nowrap">
              {title}
            </p>

            {/* 3. Concise intro line from bio: max-w-[420px], natural leading */}
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#121212] max-w-[420px] leading-relaxed font-normal">
              {shortBio}
            </p>

            {/* 4. Short thick green accent line matching reference exactly */}
            <div
              className="mt-6 sm:mt-8 w-14 h-[4px] bg-[#0B7658]"
              aria-hidden="true"
            />

            {/* 5. Action Buttons & Status Badge */}
            <div className="mt-7 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0B7658] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase hover:bg-[#096148] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2"
              >
                <span>Get in Touch</span>
              </Link>

              {resumeUrl ? (
                <button
                  type="button"
                  onClick={() => setResumeModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#DADADA] bg-white text-[#121212] text-xs sm:text-sm font-semibold tracking-wider uppercase hover:border-[#0B7658] hover:text-[#0B7658] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2"
                >
                  <FileText className="w-4 h-4 text-[#0B7658]" />
                  <span>View Resume</span>
                </button>
              ) : (
                <Link
                  href="#projects"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#DADADA] bg-white text-[#121212] text-xs sm:text-sm font-semibold tracking-wider uppercase hover:border-[#0B7658] hover:text-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2"
                >
                  <span>View Projects</span>
                </Link>
              )}

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1F1F1] border border-[#DADADA] text-[#121212] text-xs font-medium tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B7658] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B7658]"></span>
                </span>
                <span>Available for Opportunities</span>
              </div>
            </div>

          </div>

          {/* Right Column: Explicit pixel height, position relative, no overflow-hidden */}
          <div className="relative w-full lg:w-1/2 h-[420px] sm:h-[520px] lg:h-[620px] xl:h-[680px] flex items-end justify-center lg:justify-end">
            {/* Positioned wrapper for circle and photo: positions are tied together */}
            <div className="relative h-[92%] w-auto flex items-end mr-0 lg:mr-8 xl:mr-12">
              {/* Circle: diameter = 78% of photo height, center x = 55% from photo left, top = -2% */}
              <div
                className="absolute z-0 h-[78%] aspect-square rounded-full bg-[#2F9E73] -top-[2%] left-[55%] -translate-x-1/2 pointer-events-none"
                aria-hidden="true"
              />

              {/* Photo: plain next/image inside shared wrapper, z-10 in front of circle */}
              <Image
                src="/images/hero-kiran.png"
                alt="Kiran Sinha"
                width={515}
                height={1024}
                priority
                unoptimized
                className="relative z-10 h-full w-auto block select-none pointer-events-none"
              />
            </div>
          </div>

        </div>
      </Container>

      {/* Public Resume Viewer Modal */}
      <PublicResumeModal
        isOpen={resumeModalOpen}
        resumeUrl={resumeUrl || ''}
        title={`${fullName} — Resume`}
        onClose={() => setResumeModalOpen(false)}
      />
    </section>
  );
}
