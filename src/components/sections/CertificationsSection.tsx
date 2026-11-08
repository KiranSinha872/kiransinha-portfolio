'use client';

import Image from 'next/image';
import type { Certification } from '@/types';
import { Award, ExternalLink, Calendar } from 'lucide-react';
import FadeIn from '@/components/motion/FadeIn';

interface CertificationsSectionProps {
  certifications: Certification[];
}

const DEFAULT_CERTIFICATIONS: Certification[] = [
  {
    title: 'Google Cloud Certified Professional Cloud Architect',
    issuer: 'Google Cloud',
    issueDate: '2024',
    credentialId: 'GCP-PCA-89412',
    credentialUrl: 'https://cloud.google.com/certification',
  },
  {
    title: 'Meta Front-End Developer Professional Certificate',
    issuer: 'Meta',
    issueDate: '2023',
    credentialId: 'META-FED-33291',
    credentialUrl: 'https://coursera.org',
  },
];

export default function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  const data =
    certifications && certifications.length > 0
      ? certifications
      : DEFAULT_CERTIFICATIONS;

  return (
    <section id="certifications" className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <FadeIn y={20}>
          <div className="mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#BBCCD7] font-medium tracking-widest uppercase mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Qualifications</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-text">
              Certifications & Licenses
            </h2>
            <p className="text-sm text-[#8E9BAE] mt-2 font-light max-w-xl">
              Professional credentials and technical accreditations.
            </p>
          </div>
        </FadeIn>

        {/* Vertical Numbered List */}
        <div className="border-t border-white/10">
          {data.map((cert, idx) => {
            const formattedNumber = String(idx + 1).padStart(2, '0');

            return (
              <FadeIn key={cert.id || idx} delay={idx * 0.1} y={20}>
                <div className="group py-8 sm:py-10 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors duration-300 px-2 sm:px-4 rounded-xl">
                  {/* Left Column: Number + Badge + Title */}
                  <div className="flex items-start sm:items-center gap-6 md:w-2/3">
                    <span className="font-mono text-3xl sm:text-5xl font-extrabold text-[#646973] group-hover:text-[#BBCCD7] transition-colors duration-300 shrink-0">
                      {formattedNumber}
                    </span>

                    {cert.badgeUrl ? (
                      <div className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        <Image
                          src={cert.badgeUrl}
                          alt={cert.title}
                          fill
                          sizes="48px"
                          className="object-contain p-1.5"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#BBCCD7] shrink-0">
                        <Award className="w-6 h-6 stroke-[1.5]" />
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide group-hover:text-[#BBCCD7] transition-colors duration-300">
                        {cert.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#8E9BAE]">
                        <span className="text-white/80">{cert.issuer}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#BBCCD7]" />
                          <span>{cert.issueDate}</span>
                        </div>
                        {cert.credentialId && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-[#BBCCD7]">
                              ID: {cert.credentialId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Credential Link */}
                  {cert.credentialUrl && (
                    <div className="shrink-0 flex md:justify-end">
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#BBCCD7]" />
                      </a>
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
