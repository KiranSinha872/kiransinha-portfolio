'use client';

import type { Education } from '@/types';
import { Calendar, MapPin, GraduationCap } from 'lucide-react';
import FadeIn from '@/components/motion/FadeIn';
import CodingProfilesVideoBackground from '@/components/public/CodingProfilesVideoBackground';

interface EducationSectionProps {
  education: Education[];
}

const DEFAULT_EDUCATION: Education[] = [
  {
    institution: 'University Institute of Technology',
    degree: 'Bachelor of Technology (B.Tech)',
    fieldOfStudy: 'Computer Science and Engineering',
    startDate: '2021',
    endDate: '2025',
    grade: 'First Class with Distinction',
    location: 'India',
    description:
      'Core coursework in Distributed Systems, Database Management Systems, Advanced Algorithms, Data Structures, and Cloud Computing Architectures.',
  },
];

export default function EducationSection({
  education,
}: EducationSectionProps) {
  const data = education && education.length > 0 ? education : DEFAULT_EDUCATION;

  return (
    <section id="education" className="py-20 sm:py-28 relative overflow-hidden bg-[#0C0C0C]">
      {/* Mux HLS Streaming Background Video matching Coding Profiles */}
      <CodingProfilesVideoBackground
        src="https://stream.mux.com/Jwr2RhmsNrd6GEspBNgm02vJsRZAGlaoQIh4AucGdASw.m3u8"
        opacity="opacity-35"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <FadeIn y={20}>
          <div className="mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#BBCCD7] font-medium tracking-wider uppercase mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Background</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text">
              Education
            </h2>
          </div>
        </FadeIn>

        {/* Education List */}
        <div className="space-y-6">
          {data.map((item, idx) => (
            <FadeIn key={item.id || idx} delay={0.1 * (idx + 1)} y={20}>
              <div className="rounded-2xl bg-black/40 border border-white/10 p-6 sm:p-7 hover:border-white/25 hover:bg-black/50 backdrop-blur-md shadow-lg transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {item.degree} in {item.fieldOfStudy}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#BBCCD7]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {item.startDate} — {item.endDate || (item.isCurrent ? 'Present' : '')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8E9BAE]">
                  <span className="font-medium text-white">{item.institution}</span>
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#BBCCD7]" />
                      <span>{item.location}</span>
                    </div>
                  )}
                  {item.grade && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#BBCCD7]">
                      {item.grade}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-sm font-light text-[#8E9BAE] pt-2 leading-relaxed border-t border-white/5">
                    {item.description}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
