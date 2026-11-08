'use client';

import type { Profile } from '@/types';
import { UserCheck, MapPin, Sparkles } from 'lucide-react';
import FadeIn from '@/components/motion/FadeIn';
import AnimatedText from '@/components/motion/AnimatedText';

interface AboutProps {
  profile?: Profile | null;
}

export default function PublicAbout({ profile }: AboutProps) {
  const aboutText =
    profile?.about ||
    profile?.bio ||
    'I am a first-year B.Tech student specializing in Artificial Intelligence & Machine Learning, with a strong interest in Data Structures & Algorithms, Backend Development, and Data Science. I enjoy building practical, real-world applications and have hands-on experience with C++, Python, JavaScript, Node.js, Express.js, MongoDB, and REST APIs.';
  const location = profile?.location !== undefined ? profile.location : 'Delhi';
  const focusArea = profile?.focusArea !== undefined ? profile.focusArea : 'Full-Stack & Cloud Architecture';
  const mindset = profile?.mindset !== undefined ? profile.mindset : 'Continuous Learner';

  return (
    <section id="about" className="py-24 sm:py-32 relative overflow-hidden bg-[#0C0C0C]">
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-transparent via-[#BBCCD7]/5 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Centered Large Gradient-Text Heading */}
        <FadeIn y={20}>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-text mb-8 sm:mb-12">
            About Me
          </h2>
        </FadeIn>

        {/* Character-by-character Scroll-Reveal Animated Bio Paragraph */}
        <div className="my-6">
          <AnimatedText
            text={aboutText}
            className="text-xl sm:text-2xl md:text-3xl font-light text-[#EDEDED] leading-relaxed max-w-3xl mx-auto tracking-wide selection:bg-white/20"
          />
        </div>

        {/* Interactive Highlight Badges */}
        <FadeIn delay={0.3} y={20}>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs">
            {location && location.trim() && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm">
                <MapPin className="w-3.5 h-3.5 text-[#BBCCD7]" />
                <span>Based in {location}</span>
              </div>
            )}
            {focusArea && focusArea.trim() && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{focusArea}</span>
              </div>
            )}
            {mindset && mindset.trim() && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm">
                <UserCheck className="w-3.5 h-3.5 text-[#BBCCD7]" />
                <span>{mindset}</span>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
