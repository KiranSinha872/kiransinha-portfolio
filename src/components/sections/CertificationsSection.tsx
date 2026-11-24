'use client';

import React from 'react';
import Image from 'next/image';
import type { Certification } from '@/types';
import { Award, ArrowUpRight, Calendar } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';

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
    <section id="certifications" className="py-16 sm:py-24 bg-[#F1F1F1] border-b border-[#DADADA]">
      <Container>
        <div className="max-w-4xl">
          {/* Section Header */}
          <SectionHeading
            label="CERTIFICATIONS"
            title="Verified Credentials"
            description="Professional certifications, industry licenses, and technical accreditations."
          />

          {/* Clean Certification Rows with Dividers */}
          <div className="mt-10 divide-y divide-[#DADADA] border-y border-[#DADADA]">
            {data.map((cert, idx) => (
              <div
                key={cert.id || idx}
                className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Badge or Icon + Details */}
                <div className="flex items-center gap-4">
                  {cert.badgeUrl ? (
                    <div className="relative w-12 h-12 rounded-lg bg-white border border-[#DADADA] overflow-hidden shrink-0">
                      <Image
                        src={cert.badgeUrl}
                        alt={cert.title}
                        fill
                        sizes="48px"
                        className="object-contain p-1 select-none pointer-events-none"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white border border-[#DADADA] flex items-center justify-center text-[#0B7658] shrink-0">
                      <Award className="w-6 h-6 stroke-[1.5]" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#121212] tracking-tight">
                      {cert.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#5B5B5B]">
                      <span className="font-semibold text-[#121212]">{cert.issuer}</span>
                      <span className="text-[#DADADA]">•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0B7658]" />
                        <span>{cert.issueDate}</span>
                      </div>
                      {cert.credentialId && (
                        <>
                          <span className="text-[#DADADA]">•</span>
                          <span className="font-mono text-[11px] text-[#5B5B5B]">
                            ID: {cert.credentialId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Verify Credential Button (opens new tab with rel="noopener noreferrer") */}
                {cert.credentialUrl && (
                  <div className="shrink-0 sm:self-center">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DADADA] bg-white text-[#121212] text-xs font-semibold hover:border-[#0B7658] hover:text-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-2"
                    >
                      <span>Verify Credential</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#0B7658]" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
