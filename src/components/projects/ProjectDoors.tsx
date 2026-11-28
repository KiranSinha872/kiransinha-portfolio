'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { Project } from '@/types';
import ProjectOverviewModal from './ProjectOverviewModal';

interface ProjectDoorsProps {
  projects: Project[];
}

// Reference Door Theme Palettes matching therishithakor.com
const REFERENCE_DOOR_THEMES = [
  {
    door: '#22304a',
    doorDk: '#1c2840',
    glow: '75, 140, 220',
  },
  {
    door: '#4a3540',
    doorDk: '#3f2d37',
    glow: '220, 110, 170',
  },
  {
    door: '#7a8670',
    doorDk: '#66705d',
    glow: '130, 200, 120',
  },
  {
    door: '#a4552c',
    doorDk: '#874422',
    glow: '230, 130, 70',
  },
  {
    door: '#2d2942',
    doorDk: '#242036',
    glow: '160, 140, 230',
  },
  {
    door: '#3d3422',
    doorDk: '#2e2718',
    glow: '220, 190, 80',
  },
];

export default function ProjectDoors({ projects }: ProjectDoorsProps) {
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
  const shouldReduceMotion = useReducedMotion();

  // Cursor Follower
  const wallRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isCursorInside, setIsCursorInside] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    setCursorPos({
      x: e.clientX,
      y: e.clientY,
    });
  }, [shouldReduceMotion]);

  const handleDoorClick = (project: Project, idx: number) => {
    if (shouldReduceMotion) {
      setSelectedProject(project);
      setIsModalOpen(true);
      return;
    }
    setActiveDoorIdx(idx);
    // Smooth door swing open into the overview panel
    setTimeout(() => {
      setSelectedProject(project);
      setIsModalOpen(true);
      setActiveDoorIdx(null);
    }, 420);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // Preload project images
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
      {/* Reference Cursor Follower Badge (#doorCursor) */}
      <div
        className={`pointer-events-none fixed z-50 hidden md:flex items-center justify-center transition-opacity duration-150 ${
          isCursorInside && hoveredIdx !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transform: 'translate(-50%, -50%)',
          willChange: 'left, top',
        }}
        aria-hidden="true"
      >
        <div className="w-18 h-18 rounded-full bg-[#1A1818]/90 text-[#F3EEEC] text-[10px] font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-1 shadow-2xl border border-white/20 backdrop-blur-sm">
          <span>ENTER</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#0B7658]" />
        </div>
      </div>

      {/* Architectural Wall Section */}
      <div className="relative pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-24 bg-gradient-to-b from-[var(--background)] via-[var(--surface)] to-[var(--background)] border-b border-[var(--line)]">
        
        {/* Subtle Architectural Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15 mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        <div className="shell relative z-10">
          {/* Section Header with generous scroll margin */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[var(--line)] scroll-mt-28">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)]">
                  02 / SELECTED WORK
                </span>
                <span className="h-[2px] w-6 bg-[#0B7658] rounded-full" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] font-heading">
                Engineering Doors
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
                Step through each architectural doorway to inspect full-stack architecture, live production deployments, and source repositories.
              </p>
            </div>

            {/* "View all projects" Link */}
            <div className="shrink-0">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--line)] bg-[var(--chip-bg)] hover:bg-[var(--chip-bg-h)] text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] hover:text-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
              >
                <span>View all projects ({projects.length})</span>
                <span className="transform transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Architectural Doors Wall Grid */}
          <div className="pt-14 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-14 justify-items-center">
              {displayProjects.map((project, idx) => {
                const theme = REFERENCE_DOOR_THEMES[idx % REFERENCE_DOOR_THEMES.length];
                const isHovered = hoveredIdx === idx;
                const isOpening = activeDoorIdx === idx;
                const formattedNum = String(idx + 1).padStart(2, '0');

                // Reference angles:
                // Rest: rotateY(0deg)
                // Hover: rotateY(10deg) (spring cracks open inward into room)
                // Open: rotateY(70deg) (swings wide open)
                let doorRotation = 'rotateY(0deg)';
                let openProgress = 0;
                if (shouldReduceMotion) {
                  doorRotation = 'none';
                } else if (isOpening) {
                  doorRotation = 'rotateY(70deg)';
                  openProgress = 1;
                } else if (isHovered) {
                  doorRotation = 'rotateY(10deg)';
                  openProgress = 0.14;
                }

                return (
                  <div
                    key={project.id || project.slug || idx}
                    className="w-full max-w-[310px] flex flex-col items-center scroll-mt-28"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* The Roman Arch Doorway Container (@container) */}
                    <div
                      className="relative w-full aspect-[1/2.25] group select-none"
                      style={{
                        containerType: 'inline-size',
                      }}
                    >
                      {/* Interactive Button wrapping the doorway */}
                      <button
                        type="button"
                        onClick={() => handleDoorClick(project, idx)}
                        aria-haspopup="dialog"
                        aria-label={`Open project door ${formattedNum}: ${project.title}`}
                        className="relative block w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] focus-visible:ring-offset-4 rounded-t-[50cqi]"
                      >
                        {/* 1. Arch Casing (.casing): Multi-tiered architectural molding */}
                        <div
                          className="absolute inset-0 rounded-t-[50cqi] pointer-events-none transition-shadow duration-500"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(0,0,0,0.07), rgba(255,255,255,0.18) 3cqi, transparent 6cqi, transparent calc(100% - 6cqi), rgba(0,0,0,0.05) calc(100% - 3cqi), rgba(0,0,0,0.12)), linear-gradient(180deg, rgba(255,255,255,0.35), transparent 30%), var(--surface)',
                            boxShadow: isHovered
                              ? 'inset 0 0 0 1.1cqi rgba(255,255,255,0.4), inset 0 0 0 1.5cqi rgba(0,0,0,0.08), inset 0 0 0 3.6cqi rgba(255,255,255,0.16), 0 0 0 1px rgba(0,0,0,0.08), 2cqi 5cqi 9cqi rgba(26,24,24,0.35)'
                              : 'inset 0 0 0 1.1cqi rgba(255,255,255,0.28), inset 0 0 0 1.5cqi rgba(0,0,0,0.07), inset 0 0 0 3.6cqi rgba(255,255,255,0.12), 0 0 0 1px rgba(0,0,0,0.06), 1.5cqi 2.5cqi 4.5cqi rgba(26,24,24,0.2)',
                          }}
                        >
                          {/* Inner Arch Chamfer Line (.casing::after) */}
                          <div
                            className="absolute left-[4.6cqi] right-[4.6cqi] top-[4.6cqi] bottom-0 rounded-t-[45.4cqi] border-[0.45cqi] border-black/10 dark:border-white/10 border-b-0 pointer-events-none"
                            aria-hidden="true"
                          />
                        </div>

                        {/* 2. Opening Perspective Chamber (.opening) */}
                        <div
                          className="absolute left-[7.5cqi] right-[7.5cqi] top-[7.5cqi] bottom-0 overflow-hidden rounded-t-[42.5cqi]"
                          style={{
                            perspective: '160cqi',
                            perspectiveOrigin: '50% 42%',
                          }}
                        >
                          {/* 3. The Room Behind Door (.room) with Real Project Content */}
                          <div
                            className="absolute inset-0 rounded-t-[42.5cqi] bg-[#0c0d10] overflow-hidden"
                            style={{
                              boxShadow: 'inset 2cqi 0 4cqi rgba(0,0,0,0.8), inset 0 2cqi 4cqi rgba(0,0,0,0.8)',
                            }}
                          >
                            {/* Real Project Visual Artwork / Preview inside the room */}
                            {project.thumbnailUrl ? (
                              <div className="relative w-full h-full opacity-65">
                                <Image
                                  src={project.thumbnailUrl}
                                  alt=""
                                  fill
                                  sizes="300px"
                                  className="object-cover object-center filter brightness-75 contrast-110"
                                  aria-hidden="true"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                              </div>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#14161c] to-[#0a0b0e] text-center">
                                <Code2 className="w-8 h-8 text-[#0B7658] mb-2" />
                                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                                  {project.title}
                                </span>
                              </div>
                            )}

                            {/* Interior Ambient Glow */}
                            <div
                              className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                              style={{
                                background: `radial-gradient(circle at 65% 55%, rgba(${theme.glow}, 0.5) 0%, transparent 75%)`,
                                opacity: isOpening ? 1 : isHovered ? 0.75 : 0.2,
                              }}
                            />
                          </div>

                          {/* 4. The 3D Roman Arched Door Leaf (.door) */}
                          <div
                            className="relative w-full h-full rounded-t-[42.5cqi] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                            style={{
                              transformOrigin: '0px 50%',
                              transform: doorRotation,
                              transformStyle: 'preserve-3d',
                              backgroundColor: theme.door,
                              background: `linear-gradient(100deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.18) 100%), ${theme.door}`,
                              boxShadow: 'inset 0 0 0 0.5cqi rgba(0,0,0,0.28), inset 1cqi 0 0 rgba(255,255,255,0.08), 3cqi 4cqi 10cqi rgba(0,0,0,0.4)',
                            }}
                          >
                            {/* Fluted Molding Grooves (.door__flute) */}
                            <div
                              className="absolute left-[4.8cqi] right-[4.8cqi] top-[8cqi] bottom-[9cqi] rounded-t-[34.5cqi] rounded-b-[1.2cqi] pointer-events-none"
                              style={{
                                background:
                                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.075) 0, rgba(255,255,255,0.02) 1cqi, rgba(0,0,0,0.13) 2.1cqi, rgba(255,255,255,0.075) 2.8cqi)',
                                boxShadow:
                                  'inset 0 0 0 0.3cqi rgba(0,0,0,0.16), inset 1cqi 1.2cqi 2cqi rgba(0,0,0,0.28), inset -0.6cqi -0.6cqi 1cqi rgba(255,255,255,0.07)',
                              }}
                            />

                            {/* Reference Embossed Brass Nameplate (.plate) */}
                            <div
                              className="absolute left-1/2 top-[31%] -translate-x-1/2 -translate-y-1/2 w-[62cqi] py-[2.6cqi] px-[3.5cqi] rounded-[1cqi] text-center uppercase tracking-[0.09em] font-semibold text-[5.4cqi] leading-tight select-none pointer-events-none z-10 font-heading"
                              style={{
                                color: '#2b2112',
                                textShadow: '0 0.28cqi 0 rgba(255,238,196,0.55), 0 -0.15cqi 0 rgba(0,0,0,0.25)',
                                background:
                                  'linear-gradient(160deg, #efdfb2 0%, #c9a866 28%, #e3cc92 48%, #a98747 72%, #d2b67a 100%)',
                                boxShadow:
                                  '0 0.5cqi 1cqi rgba(0,0,0,0.4), inset 0 0.3cqi 0 rgba(255,250,228,0.7), inset 0 -0.3cqi 0 rgba(88,62,22,0.45)',
                              }}
                            >
                              {/* Left & Right Screw Rivets */}
                              <span className="absolute left-[1.6cqi] top-1/2 -translate-y-1/2 w-[1.6cqi] h-[1.6cqi] rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff3cf,#8f6f33_70%)] shadow-sm" />
                              <span className="absolute right-[1.6cqi] top-1/2 -translate-y-1/2 w-[1.6cqi] h-[1.6cqi] rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff3cf,#8f6f33_70%)] shadow-sm" />

                              <span className="line-clamp-2">{project.title}</span>
                            </div>

                            {/* Reference Brass Door Handle & Lock (.handle, .handle__lever, .handle__lock) */}
                            <div
                              className="absolute right-[7cqi] top-[59%] w-[9.4cqi] h-[9.4cqi] rounded-full z-10 pointer-events-none"
                              style={{
                                background:
                                  'radial-gradient(circle at 36% 30%, #fff6dc 0, #e6cb8a 14%, #b8934c 40%, #80602a 70%, #4d3816 100%)',
                                boxShadow:
                                  '0 0 0 0.35cqi rgba(0,0,0,0.22), 0.9cqi 1.5cqi 2cqi rgba(0,0,0,0.45), inset -0.7cqi -0.9cqi 1.1cqi rgba(40,26,6,0.55), inset 0.5cqi 0.6cqi 0.8cqi rgba(255,248,222,0.5)',
                              }}
                            >
                              {/* Inner Rosette */}
                              <div
                                className="absolute inset-[2.3cqi] rounded-full"
                                style={{
                                  background:
                                    'radial-gradient(circle at 38% 32%, #fff3d0, #c9a45c 45%, #6f5122 100%)',
                                  boxShadow: '0.4cqi 0.7cqi 0.9cqi rgba(0,0,0,0.45)',
                                }}
                              />

                              {/* Arched Brass Lever (.handle__lever) */}
                              <div
                                className="absolute right-[3.6cqi] top-[2.75cqi] w-[23cqi] h-[3.9cqi] rounded-l-[2.4cqi] rounded-r-[1.6cqi]"
                                style={{
                                  transformOrigin: 'calc(100% - 1.9cqi) 50%',
                                  transform: isHovered || isOpening ? 'rotate(-18deg)' : 'rotate(-32deg)',
                                  background:
                                    'linear-gradient(180deg, #fff5d6 0%, #ecd395 16%, #c39d55 42%, #8e6a2d 72%, #5c4119 100%)',
                                  boxShadow:
                                    '0.3cqi 2.4cqi 2.2cqi rgba(0,0,0,0.38), 0 0.4cqi 0.4cqi rgba(0,0,0,0.25)',
                                  transition: 'transform 0.25s cubic-bezier(0.3, 0.7, 0.4, 1)',
                                }}
                              />

                              {/* Keyhole Escutcheon (.handle__lock) */}
                              <div
                                className="absolute left-1/2 top-[calc(100%+6.5cqi)] -translate-x-1/2 w-[5.4cqi] h-[10.5cqi] rounded-[2.7cqi]"
                                style={{
                                  background:
                                    'radial-gradient(ellipse at 38% 28%, #fff3d0 0, #d9b86f 22%, #a07b37 55%, #5e4419 100%)',
                                  boxShadow:
                                    '0 0 0 0.3cqi rgba(0,0,0,0.2), 0.6cqi 1cqi 1.4cqi rgba(0,0,0,0.42)',
                                }}
                              >
                                {/* Keyhole Pinhole */}
                                <div className="absolute left-1/2 top-[30%] -translate-x-1/2 w-[2cqi] h-[2cqi] rounded-full bg-[#140d04]" />
                                <div className="absolute left-1/2 top-[calc(30%+1.3cqi)] -translate-x-1/2 w-[1cqi] h-[3cqi] rounded-b-[0.3cqi] bg-[#140d04]" />
                              </div>
                            </div>

                            {/* Door Darkness Overlay while swinging (.door__shade) */}
                            <div
                              className="absolute inset-0 rounded-t-[42.5cqi] bg-black pointer-events-none transition-opacity duration-300"
                              style={{ opacity: openProgress * 0.45 }}
                            />
                          </div>

                          {/* 5. Glowing Threshold Sill (.sill) */}
                          <div
                            className="absolute left-[3cqi] right-[3cqi] bottom-0 h-[1.2cqi] rounded-[1cqi] pointer-events-none transition-opacity duration-500 z-10"
                            style={{
                              background: `rgba(${theme.glow}, 0.95)`,
                              filter: 'blur(0.7cqi)',
                              opacity: isOpening ? 1 : isHovered ? 0.75 : 0.35,
                            }}
                          />
                        </div>

                        {/* 6. Floor Spill Light Pool (.pool) */}
                        <div
                          className="absolute -left-[10cqi] -right-[10cqi] top-full h-[36cqi] pointer-events-none z-20 transition-opacity duration-500"
                          style={{
                            background: `radial-gradient(42% 60% at 50% 0%, rgba(${theme.glow}, 0.55), transparent 100%)`,
                            filter: 'blur(1.2cqi)',
                            opacity: isOpening ? 0.9 : isHovered ? 0.65 : 0.25,
                          }}
                        />
                      </button>
                    </div>

                    {/* Generously Spaced Caption Row under each door */}
                    <div className="w-full mt-6 px-1 flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs font-bold text-[#0B7658] bg-[#0B7658]/10 px-2 py-0.5 rounded border border-[#0B7658]/20 shrink-0">
                            {formattedNum}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] truncate font-heading">
                            {project.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDoorClick(project, idx)}
                          className="text-xs font-semibold uppercase tracking-wider text-[#0B7658] hover:text-[#096148] transition-colors shrink-0 cursor-pointer"
                          aria-label={`Inspect ${project.title}`}
                        >
                          Inspect ↗
                        </button>
                      </div>

                      {project.tagline && (
                        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed line-clamp-2">
                          {project.tagline}
                        </p>
                      )}

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--chip-bg)] border border-[var(--line)] text-[var(--muted)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar: Archive Summary & Link */}
          <div className="pt-10 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
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
