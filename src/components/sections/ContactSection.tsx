'use client';

import { Mail, Phone, ArrowUpRight, Send } from 'lucide-react';
import { LinkedInIcon } from '@/components/ui/PlatformIcons';
import type { Profile } from '@/types';
import FadeIn from '@/components/motion/FadeIn';

interface ContactSectionProps {
  profile?: Profile | null;
}

export default function ContactSection({ profile }: ContactSectionProps) {
  const email = profile?.email || profile?.contactEmail || '';
  const phone = profile?.phone || '';
  
  // Extract LinkedIn URL from profile.linkedinUrl or fallback to profile.socials
  const linkedinUrl =
    profile?.linkedinUrl ||
    profile?.socials?.find((s) => s.platform.toLowerCase().includes('link'))?.url ||
    '';


  return (
    <section id="contact" className="py-28 sm:py-40 relative overflow-hidden bg-[#0C0C0C]">
      {/* Full Background Looping Video with Subtle Low Opacity */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_030633_1712fc71-4979-4e14-98f9-9f95702ab3da.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center opacity-35 filter contrast-110 brightness-90"
        />

        {/* Top, Bottom & Radial Dark Gradient Overlays for Seamless Page Blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C] via-transparent to-[#0C0C0C]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0C0C0C_85%)]" />
      </div>

      {/* Ambient Radial Color Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-t from-[#BBCCD7]/10 via-[#BBCCD7]/5 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Foreground Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <FadeIn y={20}>
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs text-[#BBCCD7] font-medium tracking-widest uppercase mb-4 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md shadow-lg">
            <Send className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight gradient-text mb-4 drop-shadow-md">
            Let&apos;s Connect
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base font-light text-[#EDEDED]/90 max-w-lg mx-auto leading-relaxed drop-shadow-sm">
            Feel free to reach out for engineering roles, technical consultations, or collaborative ventures.
          </p>

          {/* Primary Email CTA Button (Only renders if email is configured) */}
          {email && (
            <div className="mt-8 sm:mt-10 flex justify-center">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#BBCCD7] text-[#0C0C0C] font-semibold text-sm sm:text-base tracking-wide hover:bg-white shadow-[0_0_35px_rgba(187,204,215,0.35)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{email}</span>
              </a>
            </div>
          )}

          {/* Secondary Contact Links (LinkedIn & Phone) */}
          {(linkedinUrl || phone) && (
            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-3">
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/50 border border-white/15 text-xs sm:text-sm font-light text-white/90 hover:text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-md transition-all shadow-sm group"
                >
                  <LinkedInIcon className="w-4 h-4 text-[#BBCCD7] group-hover:text-blue-400 transition-colors" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#8E9BAE] group-hover:text-white transition-colors" />
                </a>
              )}

              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/50 border border-white/15 text-xs sm:text-sm font-light text-white/90 hover:text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-md transition-all shadow-sm group"
                >
                  <Phone className="w-4 h-4 text-[#BBCCD7] group-hover:text-emerald-400 transition-colors" />
                  <span>{phone}</span>
                </a>
              )}
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
