'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import type { Project } from '@/types';
import ProjectOverviewModal from './ProjectOverviewModal';

interface ProjectDoorsProps {
  projects: Project[];
}

const DOOR_THEMES = [
  {
    bg: '#1c2638',
    border: '#2c3d59',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    plate: 'from-[#f5e6c8] to-[#d4af37]',
  },
  {
    bg: '#341f2a',
    border: '#4a2c3b',
    accent: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.4)',
    plate: 'from-[#f5e6c8] to-[#d4af37]',
  },
  {
    bg: '#1b2b20',
    border: '#294030',
    accent: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.4)',
    plate: 'from-[#f5e6c8] to-[#d4af37]',
  },
  {
    bg: '#382315',
    border: '#4f321e',
    accent: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.4)',
    plate: 'from-[#f5e6c8] to-[#d4af37]',
  },
  {
    bg: '#221c33',
    border: '#332a4d',
    accent: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.4)',
    plate: 'from-[#f5e6c8] to-[#d4af37]',
  },
  {
    bg: '#282417',
    border: '#3b3420',
    accent: '#facc15',
    glow: 'rgba(250, 204, 21, 0.4)',
    plate: 'from-[#f5e6c8] to-[#d4af37]',
  },
];

export default function ProjectDoors({ projects }: ProjectDoorsProps) {
  // Sort and select up to 6 projects (featured first, then order)
  const displayProjects = React.useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return [...projects]
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (a.order ?? 0) - (b.order ?? 0);
      })
      .slice(0, 6);
  }, [projects]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeDoorIdx, setActiveDoorIdx] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cursor Follower
  const wallRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isCursorInside, setIsCursorInside] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wallRef.current) return;
    const rect = wallRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDoorClick = (project: Project, idx: number) => {
    setActiveDoorIdx(idx);
    // Smooth transition: crack door wide, then open modal
    setTimeout(() => {
      setSelectedProject(project);
      setIsModalOpen(true);
      setActiveDoorIdx(null);
    }, 280);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // Pre-load images in background
  useEffect(() => {
    displayProjects.forEach((p) => {
      if (p.thumbnailUrl) {
        const img = new window.Image();
        img.src = p.thumbnailUrl;
      }
    });
  }, [displayProjects]);

  if (displayProjects.length === 0) {
    return null;
  }

  return (
    <div
      ref={wallRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsCursorInside(true)}
      onMouseLeave={() => {
        setIsCursorInside(false);
        setHoveredIdx(null);
      }}
      className="relative w-full overflow-hidden"
    >
      {/* Floating Cursor Follower Badge (desktop only) */}
      <div
        className={`pointer-events-none absolute z-30 hidden md:flex items-center justify-center transition-opacity duration-200 -translate-x-1/2 -translate-y-1/2 ${
          isCursorInside && hoveredIdx !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transition: 'transform 0.12s ease-out, opacity 0.2s ease',
        }}
        aria-hidden="true"
      >
        <div className="px-3.5 py-1.5 rounded-full bg-white text-black font-semibold text-xs tracking-wider shadow-2xl flex items-center gap-1.5 border border-black/10">
          <span>OPEN</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Architectural Wall Presentation */}
      <div className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[var(--background)] via-[var(--surface)] to-[var(--background)] border-y border-[var(--line)]">
        
        {/* Subtle architectural vertical wall grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
          }}
          aria-hidden="true"
        />

        <div className="shell relative z-10">
          {/* Section Heading Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[var(--line)]">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]">
                  02 / SELECTED WORK
                </span>
                <span className="h-[2px] w-6 bg-[#0B7658] rounded-full" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)] font-heading">
                Selected Projects
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
                Step inside each door to explore real-world software architecture, technical problem-solving, and live interactive builds.
              </p>
            </div>

            {/* "View all projects" header link */}
            <div className="shrink-0">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] hover:text-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
              >
                <span>View all projects ({projects.length})</span>
                <span className="transform transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Interactive Doors Grid */}
          <div className="pt-12 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {displayProjects.map((project, idx) => {
                const theme = DOOR_THEMES[idx % DOOR_THEMES.length];
                const isHovered = hoveredIdx === idx;
                const isOpening = activeDoorIdx === idx;
                const formattedNum = String(idx + 1).padStart(2, '0');
                const primaryTag = project.tags && project.tags.length > 0 ? project.tags[0] : 'Engineering';

                // Door rotation angle:
                // Normal: 0deg
                // Hover: -22deg (cracks inward revealing warm light inside)
                // Opening: -75deg (swings wide open)
                let doorRotation = 'rotateY(0deg)';
                if (isOpening) {
                  doorRotation = 'rotateY(-75deg)';
                } else if (isHovered) {
                  doorRotation = 'rotateY(-24deg)';
                }

                return (
                  <div
                    key={project.id || project.slug || idx}
                    className="flex flex-col items-center"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Doorway Outer Frame (Architrave) */}
                    <div
                      className="relative w-full max-w-[340px] aspect-[1/1.9] sm:aspect-[1/2] rounded-t-2xl rounded-b-md p-3 sm:p-3.5 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-950 border-2 border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between"
                      style={{
                        perspective: '1400px',
                      }}
                    >
                      {/* Architectural Header Molding / Transom */}
                      <div className="w-full pb-2.5 mb-1 border-b border-stone-800/80 flex items-center justify-between text-[10px] font-mono tracking-widest text-stone-400 select-none">
                        <span className="font-semibold text-stone-300">DOOR {formattedNum}</span>
                        {project.featured ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                            <Sparkles className="w-3 h-3" />
                            FEATURED
                          </span>
                        ) : (
                          <span className="text-stone-500 uppercase">{primaryTag}</span>
                        )}
                      </div>

                      {/* Doorway Interior Chamber (Revealed when door swings open) */}
                      <div className="relative w-full flex-1 rounded-t-lg rounded-b-sm bg-neutral-950 overflow-hidden shadow-inner flex flex-col justify-end">
                        
                        {/* Warm Interior Glow & Light Spill */}
                        <div
                          className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background: `radial-gradient(ellipse at 85% 60%, ${theme.glow} 0%, rgba(255, 215, 120, 0.15) 40%, transparent 80%)`,
                            opacity: isOpening ? 1 : isHovered ? 0.85 : 0.1,
                          }}
                        />

                        {/* Room Interior Depth Hints (grid wallpaper/horizon) */}
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{
                            backgroundImage:
                              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                          }}
                        />

                        {/* The Interactive 3D Door Leaf */}
                        <button
                          type="button"
                          onClick={() => handleDoorClick(project, idx)}
                          aria-haspopup="dialog"
                          aria-label={`Open project ${formattedNum}: ${project.title}`}
                          className="relative w-full h-full text-left rounded-t-lg rounded-b-sm cursor-pointer select-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                          style={{
                            transformOrigin: 'left center',
                            transform: doorRotation,
                            transformStyle: 'preserve-3d',
                            backgroundColor: theme.bg,
                            borderRight: `3px solid ${theme.border}`,
                            boxShadow: isHovered
                              ? '8px 10px 25px rgba(0, 0, 0, 0.7)'
                              : '2px 4px 12px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          {/* Door Paneling (Fluted Channels) */}
                          <div className="absolute inset-2.5 rounded border border-white/10 flex flex-col justify-between p-3 sm:p-4 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none">
                            
                            {/* Upper Inset Panel */}
                            <div className="w-full h-24 rounded border border-white/5 bg-black/20 p-2 flex flex-col justify-between">
                              <span className="text-[10px] font-mono tracking-widest text-neutral-400">
                                KS / {formattedNum}
                              </span>
                              <div className="w-full flex justify-end">
                                <span className="w-2 h-2 rounded-full bg-emerald-500/70 shadow-[0_0_8px_#10b981]" />
                              </div>
                            </div>

                            {/* Brass / Steel Nameplate */}
                            <div className="my-auto py-3 px-3 rounded-md bg-gradient-to-r from-[#e8d5a8] via-[#ffd97d] to-[#c7a353] text-stone-900 shadow-md border border-amber-300/60">
                              <div className="text-[9px] font-mono uppercase tracking-widest text-stone-700 font-bold">
                                PROJECT {formattedNum}
                              </div>
                              <div className="text-xs sm:text-sm font-bold uppercase tracking-tight leading-tight line-clamp-2 mt-0.5 text-stone-950 font-heading">
                                {project.title}
                              </div>
                            </div>

                            {/* Door Hardware: Sleek Vertical Pull Handle & Lock */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
                              {/* Metal Handle */}
                              <div className="w-2 h-14 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-lg border border-amber-200/50" />
                              {/* Keyhole / Cylinder */}
                              <div className="w-2.5 h-3.5 rounded bg-stone-900 border border-amber-400/50 flex items-center justify-center">
                                <div className="w-1 h-1.5 bg-black rounded-full" />
                              </div>
                            </div>

                            {/* Lower Inset Panel */}
                            <div className="w-full h-16 rounded border border-white/5 bg-black/20 p-2 flex items-end">
                              <span className="text-[10px] font-mono text-neutral-400 truncate">
                                {project.tags && project.tags.length > 0 ? project.tags.slice(0, 2).join(' • ') : 'Software'}
                              </span>
                            </div>

                          </div>
                        </button>

                        {/* Doorway Sill / Threshold at bottom */}
                        <div
                          className="h-2 w-full transition-all duration-300 pointer-events-none"
                          style={{
                            backgroundColor: isHovered ? theme.accent : '#292524',
                            boxShadow: isHovered
                              ? `0 0 16px ${theme.glow}, 0 -2px 10px ${theme.glow}`
                              : 'none',
                          }}
                        />
                      </div>

                    </div>

                    {/* Beneath Door: Project Title & Quick Trigger */}
                    <div className="w-full max-w-[340px] mt-4 flex items-center justify-between px-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[var(--muted)]">
                            {formattedNum}
                          </span>
                          <h3 className="text-sm font-bold tracking-tight text-[var(--foreground)] truncate max-w-[200px]">
                            {project.title}
                          </h3>
                        </div>
                        {project.tagline && (
                          <p className="text-xs text-[var(--muted)] truncate max-w-[240px] mt-0.5">
                            {project.tagline}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDoorClick(project, idx)}
                        className="px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[11px] font-semibold text-[var(--foreground)] hover:text-[#0B7658] transition-colors cursor-pointer"
                        aria-label={`Inspect ${project.title}`}
                      >
                        Inspect
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar: Mobile "View all projects" */}
          <div className="pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[var(--muted)] font-mono">
              Displaying {displayProjects.length} of {projects.length} curated engineering projects
            </span>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B7658] hover:text-[#096148] transition-colors"
            >
              <span>Explore all projects archive</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Project Overview Panel Modal */}
      <ProjectOverviewModal
        project={selectedProject}
        projects={displayProjects}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectProject={(p) => setSelectedProject(p)}
      />
    </div>
  );
}
