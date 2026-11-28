'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ArrowUpRight, ChevronLeft, ChevronRight, Code2 } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { GitHubIcon } from '@/components/ui/PlatformIcons';
import type { Project } from '@/types';

interface ProjectOverviewModalProps {
  project: Project | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export default function ProjectOverviewModal({
  project,
  projects,
  isOpen,
  onClose,
  onSelectProject,
}: ProjectOverviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // 3D Monitor tilt state
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringMonitor, setIsHoveringMonitor] = useState(false);

  // Current project index
  const currentIndex = project
    ? projects.findIndex((p) => (p.id && p.id === project.id) || p.slug === project.slug)
    : -1;
  const projectNumber = currentIndex >= 0 ? String(currentIndex + 1).padStart(2, '0') : '01';
  const totalCount = String(projects.length).padStart(2, '0');

  // Handle previous and next navigation
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectProject(projects[currentIndex - 1]);
    } else if (projects.length > 0) {
      onSelectProject(projects[projects.length - 1]);
    }
  }, [currentIndex, projects, onSelectProject]);

  const handleNext = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < projects.length - 1) {
      onSelectProject(projects[currentIndex + 1]);
    } else if (projects.length > 0) {
      onSelectProject(projects[0]);
    }
  }, [currentIndex, projects, onSelectProject]);

  // Keyboard navigation & accessibility focus trap
  useEffect(() => {
    if (!isOpen) {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      return;
    }

    previousActiveElement.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal container
    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Monitor mouse move tilt calculation
  const handleMonitorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 14, y: -y * 10 });
  };

  const handleMonitorMouseLeave = () => {
    setIsHoveringMonitor(false);
    setTilt({ x: 0, y: 0 });
  };

  if (!isOpen || !project) return null;

  const tags = Array.isArray(project.tags) ? project.tags : [];
  const hasLiveUrl = Boolean(project.liveUrl);
  const hasRepoUrl = Boolean(project.repoUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`project-title-${project.id || project.slug}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#141416] text-[#EDEDED] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.85)] z-10 flex flex-col focus:outline-none"
        tabIndex={-1}
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#141416]/95 backdrop-blur border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-wider text-[#0B7658] bg-[#0B7658]/15 px-2.5 py-1 rounded-full border border-[#0B7658]/30">
              PROJECT {projectNumber} / {totalCount}
            </span>
            {project.featured && (
              <span className="text-[11px] font-semibold tracking-wider uppercase bg-amber-400/10 text-amber-300 border border-amber-400/25 px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next buttons */}
            {projects.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 mr-2 border-r border-white/10 pr-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
              aria-label="Close project overview (Escape)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Stacked 3D Monitor Mockup */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div
                className="w-full max-w-[520px] py-4 select-none"
                style={{ perspective: '1600px' }}
                onMouseMove={handleMonitorMouseMove}
                onMouseEnter={() => setIsHoveringMonitor(true)}
                onMouseLeave={handleMonitorMouseLeave}
              >
                {/* 3D Monitor Wrapper with dynamic interactive tilt */}
                <div
                  className="transition-transform duration-300 ease-out flex flex-col items-center"
                  style={{
                    transform: shouldReduceMotion
                      ? 'none'
                      : isHoveringMonitor
                      ? `rotateY(${-14 + tilt.x}deg) rotateX(${4 + tilt.y}deg)`
                      : 'rotateY(-15deg) rotateX(4deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Monitor Screen Frame / Bezel */}
                  <div className="relative w-full rounded-2xl bg-[#1B1B1F] p-3 sm:p-3.5 border-2 border-[#2C2C32] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
                    
                    {/* Top Bezel Webcam Dot */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0D0D0F] ring-1 ring-white/20" />

                    {/* The Screen Display */}
                    <div className="relative w-full aspect-[16/10] bg-[#0A0A0C] rounded-lg overflow-hidden border border-black/80">
                      {project.thumbnailUrl ? (
                        <Image
                          src={project.thumbnailUrl}
                          alt={`${project.title} live interface preview`}
                          fill
                          sizes="(max-width: 1024px) 90vw, 520px"
                          className="object-cover object-top select-none pointer-events-none"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-neutral-400 bg-gradient-to-br from-[#121214] to-[#1c1c22]">
                          <Code2 className="w-12 h-12 text-[#0B7658] mb-3" />
                          <span className="text-sm font-semibold text-white tracking-wide">
                            {project.title}
                          </span>
                          <span className="text-xs text-neutral-500 mt-1">
                            Interactive Demo Preview
                          </span>
                        </div>
                      )}

                      {/* Screen Glare Diagonal Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 35%, transparent 60%)',
                        }}
                      />

                      {/* Subtle Screen Inner Vignette */}
                      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_18px_rgba(0,0,0,0.6)]" />
                    </div>
                  </div>

                  {/* Monitor Neck (Stand Stem) */}
                  <div
                    className="w-12 h-7 bg-gradient-to-b from-[#2A2A30] via-[#383842] to-[#1E1E22] shadow-inner -mt-0.5 border-x border-[#383842]"
                    style={{ transform: 'translateZ(-10px)' }}
                  />

                  {/* Monitor Base Plate */}
                  <div
                    className="w-44 sm:w-52 h-2.5 rounded-full bg-gradient-to-r from-[#202026] via-[#484854] to-[#202026] shadow-[0_12px_24px_rgba(0,0,0,0.9)] border-t border-white/20"
                    style={{ transform: 'translateZ(-15px)' }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 mt-2 tracking-wide font-mono select-none">
                3D Interactive Viewport — Move cursor to inspect
              </p>
            </div>

            {/* Right Column: Project Details & Tech Stack */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2
                  id={`project-title-${project.id || project.slug}`}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight font-heading"
                >
                  {project.title}
                </h2>

                {project.tagline && (
                  <p className="text-sm sm:text-base font-medium text-[#0B7658] mt-2">
                    {project.tagline}
                  </p>
                )}

                {/* What it does / Problem it solves */}
                <div className="mt-5 space-y-3">
                  {project.description && (
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  {project.longDescription && project.longDescription !== project.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed border-l-2 border-[#0B7658]/50 pl-3">
                      {project.longDescription}
                    </p>
                  )}
                </div>

                {/* Tech Stack Chips */}
                {tags.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-white/10">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400 block mb-2.5">
                      Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-white/5 border border-white/10 text-neutral-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Live Demo and Source Code */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
                {hasLiveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B7658] hover:bg-[#096148] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-[#0B7658]/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B7658]"
                  >
                    <span>Live Demo</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}

                {hasRepoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold tracking-wide border border-white/15 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <GitHubIcon className="w-4 h-4" />
                    <span>Source Code</span>
                  </a>
                )}

                {!hasLiveUrl && !hasRepoUrl && (
                  <span className="text-xs text-neutral-400 italic">
                    Proprietary / Academic Exploration
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-[#0E0E10] border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>Press ESC or click outside to close</span>
          <span className="hidden sm:inline">Use Left/Right arrows to browse projects</span>
        </div>
      </div>
    </div>
  );
}
