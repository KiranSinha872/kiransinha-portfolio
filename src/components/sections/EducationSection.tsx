'use client';

import React, { useState } from 'react';
import type { Education } from '@/types';
import { MapPin, Calendar, Star } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';

interface EducationSectionProps {
  education: Education[];
}

const DEFAULT_EDUCATION: Education[] = [
  {
    institution: 'Mirai School of Technology',
    degree: 'Bachelor of Technology (B.Tech)',
    fieldOfStudy: 'Artificial Intelligence & Machine Learning',
    startDate: '2025',
    endDate: '2029',
    location: 'Delhi, India',
    description:
      'Relevant Coursework: Data Structures & Algorithms, Web Development, Data Science, Artificial Intelligence Fundamentals',
  },
  {
    institution: 'Gurucharan College',
    degree: 'Higher Secondary (Class XII)',
    fieldOfStudy: 'Science (PCMB)',
    startDate: '2023',
    endDate: '2025',
    location: 'Silchar, Assam, India',
  },
  {
    institution: 'Surendra Singha Memorial English School',
    degree: 'Secondary School (Class X)',
    fieldOfStudy: 'General',
    startDate: '',
    endDate: '',
    location: 'Silchar, Assam, India',
    grade: '89.9% | First Division with Distinction',
  },
];

/**
 * Extracts initials from the first two significant words of an institution's name,
 * skipping stopwords like of, the, and, for, &, in.
 * Example:
 * - "Mirai School of Technology" -> "MS"
 * - "Gurucharan College" -> "GC"
 * - "Surendra Singha Memorial English School" -> "SS"
 */
function getInstitutionInitials(name: string): string {
  if (!name) return 'ED';
  const ignoredWords = new Set(['of', 'the', 'and', 'for', '&', 'in']);
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((w) => w.length > 0 && !ignoredWords.has(w.toLowerCase()));

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function InstitutionLogoTile({
  institution,
  logoUrl,
}: {
  institution: string;
  logoUrl?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = getInstitutionInitials(institution);

  // If no logoUrl or the image fails to load, render initials fallback tile
  if (!logoUrl || imgError) {
    return (
      <div
        className="w-14 h-14 sm:w-[112px] sm:h-[112px] rounded-2xl bg-[#E8F4EF] border border-[#E8E8E8] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 select-none transition-colors duration-200 hover:border-[#0B7658] motion-reduce:transition-none"
        aria-hidden="true"
      >
        <span className="font-semibold text-[#0B7658] text-base sm:text-3xl tracking-tight">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className="w-14 h-14 sm:w-[112px] sm:h-[112px] rounded-2xl bg-white border border-[#E8E8E8] p-1.5 sm:p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 overflow-hidden transition-colors duration-200 hover:border-[#0B7658] motion-reduce:transition-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${institution} logo`}
        loading="lazy"
        onError={() => setImgError(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export default function EducationSection({ education }: EducationSectionProps) {
  const data = education && education.length > 0 ? education : DEFAULT_EDUCATION;

  return (
    <section id="education" className="py-16 sm:py-24 bg-[#F9F9F9] border-b border-[#E8E8E8]">
      <Container>
        <div className="max-w-4xl">
          {/* Section Heading */}
          <SectionHeading
            label="EDUCATION"
            title="Academic Background"
            description="Formal engineering education, foundation coursework, and degree milestones."
          />

          {/* Education Rows with Top & Bottom Dividers */}
          <div className="mt-10 border-t border-b border-[#E8E8E8] divide-y divide-[#E8E8E8]">
            {data.map((item, idx) => {
              // Duration formatting: skip line if no start/end dates
              const hasStartDate = Boolean(item.startDate && item.startDate.trim());
              const hasEndDate = Boolean(item.endDate && item.endDate.trim());
              const isCurrent = Boolean(item.isCurrent);
              const hasDates = hasStartDate || hasEndDate || isCurrent;

              let dateText = '';
              if (hasStartDate && (hasEndDate || isCurrent)) {
                dateText = `${item.startDate} – ${item.endDate || 'Present'}`;
              } else if (hasStartDate) {
                dateText = item.startDate;
              } else if (hasEndDate) {
                dateText = item.endDate || '';
              }

              return (
                <article
                  key={item.id || idx}
                  className="py-7 flex items-start gap-5 sm:gap-6"
                >
                  {/* Left Column: Institution Logo Tile or Fallback Initials */}
                  <InstitutionLogoTile
                    institution={item.institution}
                    logoUrl={item.logoUrl}
                  />

                  {/* Right Column: Text Stack */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* a. Degree */}
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111]">
                      {item.degree}
                      {item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ''}
                    </h3>

                    {/* b. Institution Name & Location */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm sm:text-base">
                      <span className="font-medium text-[#111]">{item.institution}</span>
                      {item.location && (
                        <div className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#5B5B5B]">
                          <MapPin
                            className="w-3.5 h-3.5 text-[#0B7658] shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>

                    {/* c. Duration on its own line with calendar icon (skip line if no dates) */}
                    {hasDates && dateText && (
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#5B5B5B]">
                        <Calendar
                          className="w-3.5 h-3.5 text-[#5B5B5B] shrink-0"
                          aria-hidden="true"
                        />
                        <span>{dateText}</span>
                      </div>
                    )}

                    {/* d. Coursework / Description in muted grey */}
                    {item.description && (
                      <p className="text-xs sm:text-sm text-[#5B5B5B] leading-relaxed pt-0.5">
                        {item.description}
                      </p>
                    )}

                    {/* e. Achievement Pill (green tint, star icon, rounded-full) */}
                    {item.grade && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F4EF] border border-[#0B7658]/30 text-xs font-medium text-[#0B7658]">
                          <Star
                            className="w-3 h-3 text-[#0B7658] fill-[#0B7658] shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item.grade}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
