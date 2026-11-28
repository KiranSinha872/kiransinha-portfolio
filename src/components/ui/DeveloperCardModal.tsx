'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Profile } from '@/types';
import { GitHubIcon } from '@/components/ui/PlatformIcons';
import {
  X,
  RotateCw,
  ExternalLink,
  Award,
  Sparkles,
  MapPin,
  GraduationCap,
  Code2,
} from 'lucide-react';

interface DeveloperCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Profile | null;
}

export default function DeveloperCardModal({
  isOpen,
  onClose,
  profile,
}: DeveloperCardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();

  const handleClose = useCallback(() => {
    setIsFlipped(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
    onClose();
  }, [onClose]);

  // Handle ESC key & focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  // 3D Tilt calculation
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReduced || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0 to 1
      const py = (e.clientY - rect.top) / rect.height; // 0 to 1

      const rotateY = (px - 0.5) * 24; // -12 to 12 deg
      const rotateX = (0.5 - py) * 24; // -12 to 12 deg

      setTilt({
        x: rotateX,
        y: rotateY,
        glareX: px * 100,
        glareY: py * 100,
      });
    },
    [prefersReduced]
  );

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Developer Ability Card"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center max-w-sm w-full my-auto"
          >
            {/* Top Toolbar (Flip hint + Close button) */}
            <div className="w-full flex items-center justify-between pb-3 text-white/90">
              <button
                type="button"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-medium transition-colors cursor-pointer"
                title="Tap or click card to flip"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'Show Front' : 'Flip to Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
                aria-label="Close Developer Card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Flippable Card Perspective Wrapper */}
            <div
              className="w-full perspective-[1200px]"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onClick={() => setIsFlipped((prev) => !prev)}
            >
              <div
                ref={cardRef}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${isFlipped ? 180 : 0 + tilt.y}deg) rotateX(${
                    isFlipped ? 0 : tilt.x
                  }deg)`,
                  transition: isFlipped ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.12s ease-out',
                }}
                className="relative w-full aspect-[1/1.55] rounded-3xl cursor-pointer select-none shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
              >
                {/* ================= FRONT FACE ================= */}
                <div
                  style={{ backfaceVisibility: 'hidden' }}
                  className="absolute inset-0 rounded-3xl p-5 flex flex-col justify-between border-2 border-[#0B7658]/40 bg-gradient-to-b from-[#18231e] via-[#0f1713] to-[#080d0a] text-white overflow-hidden shadow-2xl"
                >
                  {/* Holographic Rainbow Foil Layer */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.7) 0%, rgba(11,118,88,0.4) 25%, rgba(255,100,200,0.3) 50%, rgba(0,200,255,0.3) 75%, transparent 100%)`,
                    }}
                    aria-hidden="true"
                  />

                  {/* Diagonal Sheen Glare */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 40%, rgba(255,255,255,0.3) 60%, transparent 100%)',
                    }}
                    aria-hidden="true"
                  />

                  {/* Header Row: Rarity + Collectible ID */}
                  <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/10 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-[#2ee0ad]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="font-bold tracking-widest uppercase">DEV CARD</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#0B7658]/30 border border-[#0B7658]/50 text-[#54f0c4] font-semibold">
                      LIMITED #001
                    </span>
                  </div>

                  {/* Framed Portrait Box */}
                  <div className="relative z-10 my-3 rounded-2xl overflow-hidden border border-white/20 bg-black/40 aspect-square max-h-[190px] mx-auto w-full shadow-inner flex items-center justify-center">
                    <Image
                      src="/images/my-photo.png"
                      alt="Kiran Sinha"
                      fill
                      className="object-cover object-top filter contrast-105"
                      sizes="(max-width: 640px) 260px, 320px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
                      <span className="font-bold tracking-tight text-white drop-shadow-md">
                        {profile?.name || 'Kiran Sinha'}
                      </span>
                      <span className="font-mono text-[10px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                        AIML &apos;29
                      </span>
                    </div>
                  </div>

                  {/* Identity & Core Attributes */}
                  <div className="relative z-10 space-y-2">
                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                      {profile?.headline ||
                        'Full-Stack Developer & AIML Student building scalable web applications and mastering algorithmic problem solving.'}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-white/50 block text-[9px] uppercase">Specialization</span>
                        <span className="font-semibold text-white truncate block">AI & Full-Stack</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-white/50 block text-[9px] uppercase">Institution</span>
                        <span className="font-semibold text-white truncate block">Mirai School</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Foil Bar */}
                  <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span>AUTHENTIC EDITION</span>
                    <span className="text-[#2ee0ad]">TAP TO FLIP ↺</span>
                  </div>
                </div>

                {/* ================= BACK FACE ================= */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                  className="absolute inset-0 rounded-3xl p-5 flex flex-col justify-between border-2 border-[#0B7658]/40 bg-gradient-to-b from-[#131a16] via-[#0d1310] to-[#070a08] text-white overflow-hidden shadow-2xl"
                >
                  {/* Subtle Grid Sheen */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage:
                        'radial-gradient(rgba(11,118,88,0.4) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                    aria-hidden="true"
                  />

                  {/* Back Header */}
                  <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/10 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-[#2ee0ad]">
                      <Award className="w-3.5 h-3.5" />
                      <span className="font-bold tracking-widest uppercase">PASSPORT</span>
                    </div>
                    <span className="text-white/60 font-mono text-[10px]">VERIFIED IDENT</span>
                  </div>

                  {/* Academic & Location Credentials */}
                  <div className="relative z-10 space-y-2.5 my-auto">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <GraduationCap className="w-3.5 h-3.5 text-[#2ee0ad]" />
                        <span>Mirai School of Technology</span>
                      </div>
                      <p className="text-[11px] text-white/70 pl-5.5">
                        B.Tech in Artificial Intelligence & Machine Learning (2025 – 2029)
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <MapPin className="w-3.5 h-3.5 text-[#2ee0ad]" />
                        <span>Based in Delhi, India</span>
                      </div>
                      <p className="text-[11px] text-white/70 pl-5.5">
                        Originally from Silchar, Assam, India
                      </p>
                    </div>

                    {/* Developer Profiles List */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                        Verified Profiles
                      </span>

                      <div className="grid grid-cols-1 gap-1.5">
                        {profile?.githubUrl && (
                          <a
                            href={profile.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <GitHubIcon className="w-3.5 h-3.5 text-[#2ee0ad]" />
                              <span>GitHub</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-white/50" />
                          </a>
                        )}

                        {profile?.leetcodeUrl && (
                          <a
                            href={profile.leetcodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Code2 className="w-3.5 h-3.5 text-[#2ee0ad]" />
                              <span>LeetCode</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-white/50" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Back Footer */}
                  <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span>STATUS: ACTIVE BUILDER</span>
                    <span className="text-[#2ee0ad]">TAP TO FLIP ↺</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
