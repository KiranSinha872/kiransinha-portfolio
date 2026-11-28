'use client';

import React from 'react';
import Image from 'next/image';
import type { Certification } from '@/types';
import { Award, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import Container from '@/components/ui/Container';

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
    <section
      id="certifications"
      className="scroll-mt-28 py-20 sm:py-28 bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--line)] transition-colors duration-250 relative overflow-hidden"
    >
      <Container>
        {/* Section Header */}
        <div className="pb-10 border-b border-[var(--line)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0B7658] font-bold">
              [ 04 / CREDENTIALS ]
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B7658] animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
            Verified Certifications
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-xl">
            Industry accreditations, verified professional licenses, and specialized engineering credentials.
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {data.map((cert, idx) => (
            <article
              key={cert.id || idx}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[#0B7658]/40 hover:shadow-xs transition-all duration-200"
            >
              <div>
                {/* Header row: Issuer + Verification badge */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]/60 text-xs font-mono">
                  <span className="font-bold text-[#0B7658] uppercase tracking-wider">
                    {cert.issuer}
                  </span>
                  <div className="flex items-center gap-1 text-[var(--muted)]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#0B7658]" />
                    <span>Verified</span>
                  </div>
                </div>

                {/* Title & Badge */}
                <div className="mt-4 flex items-start gap-4">
                  {cert.badgeUrl ? (
                    <div className="relative w-12 h-12 rounded-xl bg-[var(--background)] border border-[var(--line)] overflow-hidden shrink-0">
                      <Image
                        src={cert.badgeUrl}
                        alt={`${cert.title} badge`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#0B7658]/10 text-[#0B7658] flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] group-hover:text-[#0B7658] transition-colors">
                      {cert.title}
                    </h3>
                    {cert.issueDate && (
                      <p className="mt-1 text-xs text-[var(--muted)] font-mono flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#0B7658]" />
                        <span>Issued {cert.issueDate}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Credential ID + External Link */}
              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3 text-xs font-mono">
                {cert.credentialId ? (
                  <span className="text-[var(--muted)] truncate max-w-[200px]" title={cert.credentialId}>
                    ID: {cert.credentialId}
                  </span>
                ) : (
                  <span className="text-[var(--muted)]">Accredited</span>
                )}

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#0B7658] font-bold hover:underline shrink-0"
                  >
                    <span>Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
