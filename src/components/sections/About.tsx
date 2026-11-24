'use client';

import type { Profile } from '@/types';
import { MapPin, Sparkles, UserCheck } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';

interface AboutProps {
  profile?: Profile | null;
}

export default function PublicAbout({ profile }: AboutProps) {
  const rawBio =
    profile?.about ||
    profile?.bio ||
    'I am a B.Tech student specializing in Artificial Intelligence & Machine Learning, with a strong interest in Data Structures & Algorithms, Backend Development, and Cloud Computing. I enjoy building practical, real-world applications and scalable architectures.';

  // Remove any conflicting academic year references (e.g. "first-year", "1st year")
  // so Hero and About can never disagree
  const sanitizedBio = rawBio
    .replace(/\b(first|second|third|fourth|1st|2nd|3rd|4th)[-\s]year\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const location = profile?.location?.trim();
  const focusArea = profile?.focusArea?.trim();
  const mindset = profile?.mindset?.trim();

  return (
    <section id="about" className="py-16 sm:py-24 bg-[#F1F1F1] border-b border-[#DADADA]">
      <Container>
        <div className="max-w-3xl">
          {/* Section Label + Title */}
          <SectionHeading
            label="ABOUT"
            title="About Me"
          />

          {/* Clean Bio Paragraph */}
          <p className="mt-6 text-base sm:text-lg text-[#121212] leading-relaxed font-normal">
            {sanitizedBio}
          </p>

          {/* Data Chips (location, focus areas, status) */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            {location && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DADADA] text-xs font-medium text-[#121212]">
                <MapPin className="w-3.5 h-3.5 text-[#0B7658]" />
                <span>Based in {location}</span>
              </div>
            )}

            {focusArea && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DADADA] text-xs font-medium text-[#121212]">
                <Sparkles className="w-3.5 h-3.5 text-[#0B7658]" />
                <span>{focusArea}</span>
              </div>
            )}

            {mindset ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DADADA] text-xs font-medium text-[#121212]">
                <UserCheck className="w-3.5 h-3.5 text-[#0B7658]" />
                <span>{mindset}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DADADA] text-xs font-medium text-[#121212]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B7658] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B7658]"></span>
                </span>
                <span>Available for Opportunities</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
