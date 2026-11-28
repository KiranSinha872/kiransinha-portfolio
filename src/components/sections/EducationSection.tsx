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

function getInitials(name: string): string {
  const stopwords = new Set(['of', 'the', 'and', 'for', '&', 'in']);
  const words = name
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && !stopwords.has(w.toLowerCase()));

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return 'ED';
}

function InstitutionLogoTile({
  institution,
  logoUrl,
}: {
  institution: string;
  logoUrl?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(institution);

  if (!logoUrl || imgError) {
    return (
      <div
        className="w-14 h-14 sm:w-[112px] sm:h-[112px] rounded-2xl bg-[#0B7658]/10 border border-[var(--line)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 select-none transition-colors duration-200 hover:border-[#0B7658] motion-reduce:transition-none"
        aria-hidden="true"
      >
        <span className="font-semibold text-[#0B7658] text-base sm:text-3xl tracking-tight">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className="w-14 h-14 sm:w-[112px] sm:h-[112px] rounded-2xl bg-[var(--chip-bg)] border border-[var(--line)] p-1.5 sm:p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 overflow-hidden transition-colors duration-200 hover:border-[#0B7658] motion-reduce:transition-none">
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
    <section id="education" className="py-16 sm:py-24 bg-[var(--surface)] text-[var(--foreground)] border-b border-[var(--line)] transition-colors duration-250">
      <Container>
        <div className="max-w-4xl">
          {/* Section Heading */}
          <SectionHeading
            label="EDUCATION"
            title="Academic Background"
            description="Formal engineering education, foundation coursework, and degree milestones."
          />

          {/* Education Rows with Top & Bottom Dividers */}
          <div className="mt-10 border-t border-b border-[var(--line)] divide-y divide-[var(--line)]">
            {data.map((item, idx) => {
              const hasStartDate = Boolean(item.startDate && item.startDate.trim());
              const hasEndDate = Boolean(item.endDate && item.endDate.trim());
              const isCurrent = Boolean(item.isCurrent);

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
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                      {item.degree}
                      {item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ''}
                    </h3>

                    {/* b. Institution Name & Location */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm sm:text-base">
                      <span className="font-medium text-[var(--foreground)]">{item.institution}</span>
                      {item.location && (
                        <span className="inline-flex items-center gap-1 text-[var(--muted)]">
                          <MapPin className="w-3.5 h-3.5 text-[#0B7658]" aria-hidden="true" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>

                    {/* c. Duration */}
                    {dateText && (
                      <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[var(--muted)]">
                        <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
                        <span>{dateText}</span>
                      </div>
                    )}

                    {/* d. Distinction Badge */}
                    {item.grade && (
                      <div className="pt-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B7658]/10 text-[#0B7658] border border-[#0B7658]/20 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{item.grade}</span>
                        </div>
                      </div>
                    )}

                    {/* e. Description / Coursework */}
                    {item.description && (
                      <p className="pt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                        {item.description}
                      </p>
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
