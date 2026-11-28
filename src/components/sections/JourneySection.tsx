'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Education, Profile } from '@/types';
import Container from '@/components/ui/Container';
import { MapPin, Award, BookOpen, Sparkles, GraduationCap } from 'lucide-react';

interface JourneySectionProps {
  education?: Education[];
  profile?: Profile | null;
}

interface Chapter {
  id: string;
  year: number;
  period: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  location?: string;
  grade?: string;
  highlights?: string[];
  iconType: 'college' | 'code' | 'school' | 'spark';
}

const DEFAULT_CHAPTERS: Chapter[] = [
  {
    id: 'mirai',
    year: 2025,
    period: '2025 – 2029',
    number: '01 / 05',
    title: 'B.Tech in Artificial Intelligence & Machine Learning',
    subtitle: 'Mirai School of Technology',
    description:
      'Pursuing specialized engineering in AI & Machine Learning. Focused on Data Structures & Algorithms, modern full-stack systems, backend scalability, and applied machine learning models.',
    location: 'Delhi, India',
    highlights: [
      'Data Structures & Algorithms',
      'Full-Stack Architecture (Next.js & Supabase)',
      'Artificial Intelligence & Deep Learning',
    ],
    iconType: 'college',
  },
  {
    id: 'mastery',
    year: 2024,
    period: '2024 – 2025',
    number: '02 / 05',
    title: 'Full-Stack Systems & Algorithmic Foundations',
    subtitle: 'Independent Engineering & Problem Solving',
    description:
      'Engineered and deployed production web applications with Next.js, TypeScript, PostgreSQL, and Supabase. Actively solved competitive programming challenges across LeetCode and CodeChef.',
    highlights: [
      'Relational Database Modeling & Real-Time Sync',
      'REST & Server-Action Backend Architectures',
      'Performance Optimization & Accessible UI Design',
    ],
    iconType: 'code',
  },
  {
    id: 'gurucharan',
    year: 2023,
    period: '2023 – 2025',
    number: '03 / 05',
    title: 'Higher Secondary Science (PCMB)',
    subtitle: 'Gurucharan College',
    description:
      'Completed rigorous higher secondary coursework in Physics, Chemistry, Mathematics, and Biology with academic distinction, solidifying analytical thinking and mathematical rigor.',
    location: 'Silchar, Assam, India',
    highlights: ['Calculus & Linear Algebra', 'Physics & Logical Problem Solving'],
    iconType: 'college',
  },
  {
    id: 'school',
    year: 2022,
    period: '2022 – 2023',
    number: '04 / 05',
    title: 'Secondary School Education (Class X)',
    subtitle: 'Surendra Singha Memorial English School',
    description:
      'Graduated with First Division with Distinction (89.9%). Developed initial passions for computer science, computational logic, and mathematics.',
    location: 'Silchar, Assam, India',
    grade: '89.9% | First Division with Distinction',
    iconType: 'school',
  },
  {
    id: 'beginnings',
    year: 2021,
    period: '2021 – 2022',
    number: '05 / 05',
    title: 'First Lines of Code & Engineering Curiosity',
    subtitle: 'Self-Directed Discovery',
    description:
      'Wrote first foundational programs in C/C++ and Python. Explored programming fundamentals, terminal tools, and algorithmic puzzle solving, setting the trajectory for software engineering.',
    highlights: ['C & C++ Fundamentals', 'Python Scripting & Automation', 'Core Computer Science'],
    iconType: 'spark',
  },
];

// 4-Digit Mechanical Rolling Odometer Year Display
function MechanicalOdometer({ year }: { year: number }) {
  const digits = useMemo(() => {
    const s = year.toString().padStart(4, '0');
    return s.split('').map((ch) => parseInt(ch, 10));
  }, [year]);

  return (
    <div
      className="inline-flex items-center bg-[var(--surface)] border border-[var(--line)] px-4 py-2 rounded-xl shadow-xs font-mono font-black text-2xl sm:text-3xl tracking-tight text-[var(--foreground)]"
      aria-label={`Current milestone year: ${year}`}
    >
      <span className="text-xs uppercase text-[#0B7658] mr-2 font-bold tracking-widest">
        YEAR
      </span>
      <div className="flex overflow-hidden h-[36px] items-center">
        {digits.map((digit, idx) => (
          <div
            key={idx}
            className="w-[18px] sm:w-[22px] overflow-hidden text-center relative"
            style={{ height: '36px' }}
          >
            <div
              className="flex flex-col transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateY(-${digit * 10}%)`,
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div
                  key={n}
                  className="h-[36px] flex items-center justify-center text-[var(--foreground)]"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3D Clock Tunnel Background Canvas
function ClockTunnelCanvas({ scrollProgress }: { scrollProgress: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth * 1.5);
    let height = (canvas.height = canvas.offsetHeight * 1.5);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * 1.5;
      height = canvas.height = canvas.offsetHeight * 1.5;
    };

    window.addEventListener('resize', onResize);

    const ringsCount = 14;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.42;

      // Color based on theme
      const isDark = document.documentElement.classList.contains('dark');
      const strokeColor = isDark ? 'rgba(11, 118, 88, ' : 'rgba(11, 118, 88, ';

      // Render concentric receding 3D clock tunnel rings
      for (let i = 0; i < ringsCount; i++) {
        // Perspective depth calculation
        const offset = (i / ringsCount + scrollProgress * 0.8) % 1;
        const z = 1 - offset; // 1 (near) to 0 (far)
        const radius = baseRadius * Math.pow(z, 1.8);
        const alpha = Math.sin(z * Math.PI) * (isDark ? 0.35 : 0.2);

        if (radius <= 2) continue;

        ctx.save();
        ctx.translate(cx, cy);
        const ringAngle = angle * (i % 2 === 0 ? 1 : -1) * 0.4 + scrollProgress * Math.PI;
        ctx.rotate(ringAngle);

        // Ring stroke
        ctx.strokeStyle = strokeColor + alpha.toFixed(3) + ')';
        ctx.lineWidth = Math.max(1, z * 2.2);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 12 Roman/tick clock points on selected rings
        if (i % 2 === 0 && radius > 30) {
          ctx.fillStyle = strokeColor + (alpha * 1.2).toFixed(3) + ')';
          for (let tick = 0; tick < 12; tick++) {
            const tickAngle = (tick / 12) * Math.PI * 2;
            const tx = Math.cos(tickAngle) * radius;
            const ty = Math.sin(tickAngle) * radius;
            ctx.beginPath();
            ctx.arc(tx, ty, Math.max(1, z * 2.5), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      if (!prefersReduced) {
        angle += 0.003;
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, [scrollProgress, prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-45 dark:opacity-35"
      aria-hidden="true"
    />
  );
}

export default function JourneySection({ education, profile }: JourneySectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeYear, setActiveYear] = useState<number>(2025);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const prefersReduced = useReducedMotion();

  // Combine real database education records with the 5 journey milestones
  const chapters = useMemo(() => {
    if (!education || education.length === 0) return DEFAULT_CHAPTERS;

    // Merge database education items into the chapter milestones
    const list = [...DEFAULT_CHAPTERS];
    for (const edu of education) {
      const startYear = parseInt(edu.startDate?.trim() || '', 10);
      if (!isNaN(startYear)) {
        const match = list.find(
          (c) =>
            c.subtitle.toLowerCase().includes(edu.institution.toLowerCase()) ||
            c.title.toLowerCase().includes(edu.institution.toLowerCase()) ||
            c.year === startYear
        );
        if (match) {
          if (edu.degree) match.title = `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;
          if (edu.location) match.location = edu.location;
          if (edu.grade) match.grade = edu.grade;
        }
      }
    }
    return list;
  }, [education]);

  // Track scroll position to update odometer year & clock tunnel
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Section progress 0 to 1
      const totalDist = rect.height - viewportHeight;
      if (totalDist > 0) {
        const current = Math.max(0, Math.min(1, -rect.top / totalDist));
        setScrollProgress(current);
      }

      // Find chapter closest to viewport center
      const chapterEls = containerRef.current.querySelectorAll('[data-chapter-year]');
      let closestYear = activeYear;
      let minDistance = Infinity;

      chapterEls.forEach((el) => {
        const elRect = el.getBoundingClientRect();
        const elCenter = elRect.top + elRect.height / 2;
        const targetCenter = viewportHeight * 0.45;
        const dist = Math.abs(elCenter - targetCenter);
        if (dist < minDistance) {
          minDistance = dist;
          const y = parseInt(el.getAttribute('data-chapter-year') || '2025', 10);
          closestYear = y;
        }
      });

      if (closestYear !== activeYear) {
        setActiveYear(closestYear);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeYear]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="scroll-mt-28 py-24 sm:py-32 bg-[var(--surface)] text-[var(--foreground)] border-b border-[var(--line)] transition-colors duration-250 relative overflow-hidden"
    >
      {/* Anchor for education links to preserve backwards compatibility */}
      <span id="education" className="scroll-mt-28 absolute top-0" aria-hidden="true" />

      {/* 3D Clock Tunnel Canvas */}
      <ClockTunnelCanvas scrollProgress={scrollProgress} />

      <Container className="relative z-10">
        {/* Section Header with Mechanical Odometer HUD */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0B7658] font-bold">
                [ 03 / JOURNEY & ABOUT ]
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B7658] animate-pulse" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
              Academic & Development Journey
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--muted)] max-w-xl">
              {profile?.bio ||
                'A timeline of academic milestones, algorithmic problem solving, and production engineering experience.'}
            </p>
          </div>

          {/* Mechanical Odometer Roller HUD */}
          <div className="self-start md:self-end shrink-0">
            <MechanicalOdometer year={activeYear} />
          </div>
        </div>

        {/* Timeline Chapters with Traveling Dot & Rail */}
        <div className="mt-16 relative">
          {/* Vertical central rail */}
          <div
            className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-4 bottom-4 w-[2px] bg-[var(--line)]"
            aria-hidden="true"
          />

          {/* Glowing traveling dot */}
          <div
            className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0B7658] shadow-[0_0_14px_#0B7658] transition-all duration-300 pointer-events-none"
            style={{
              top: `${Math.max(2, Math.min(98, scrollProgress * 100))}%`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden="true"
          >
            <span className="absolute inset-0 rounded-full bg-[#0B7658] animate-ping opacity-60" />
          </div>

          {/* Chapter cards */}
          <div className="space-y-12 sm:space-y-16">
            {chapters.map((chap, idx) => {
              const isEven = idx % 2 === 0;
              const isActive = chap.year === activeYear;

              return (
                <div
                  key={chap.id}
                  data-chapter-year={chap.year}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  } gap-6 sm:gap-12 pl-10 sm:pl-0`}
                >
                  {/* Indicator Node on the Rail */}
                  <div
                    className={`absolute left-4 sm:left-1/2 -translate-x-1/2 top-6 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'border-[#0B7658] bg-[#0B7658] scale-125'
                        : 'border-[var(--line)] bg-[var(--background)]'
                    }`}
                    aria-hidden="true"
                  />

                  {/* Chapter Content Card (Occupies half width on desktop) */}
                  <div className="w-full sm:w-1/2">
                    <motion.article
                      initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className={`group p-6 sm:p-7 rounded-2xl border transition-all duration-300 ${
                        isActive
                          ? 'border-[#0B7658]/70 bg-[var(--background)] shadow-md ring-1 ring-[#0B7658]/30'
                          : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-h)]'
                      } ${isEven ? 'sm:mr-6' : 'sm:ml-6'}`}
                    >
                      {/* Chapter Metadata Row */}
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--line)]/60 text-xs font-mono">
                        <span className="font-bold text-[#0B7658] uppercase tracking-wider">
                          CHAPTER {chap.number}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--chip-bg)] border border-[var(--line)] text-[var(--foreground)] font-semibold">
                          {chap.period}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          {chap.iconType === 'college' && (
                            <GraduationCap className="w-4 h-4 text-[#0B7658] shrink-0" />
                          )}
                          {chap.iconType === 'code' && (
                            <BookOpen className="w-4 h-4 text-[#0B7658] shrink-0" />
                          )}
                          {chap.iconType === 'school' && (
                            <Award className="w-4 h-4 text-[#0B7658] shrink-0" />
                          )}
                          {chap.iconType === 'spark' && (
                            <Sparkles className="w-4 h-4 text-[#0B7658] shrink-0" />
                          )}
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                            {chap.title}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-[var(--foreground)]/80">
                          {chap.subtitle}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
                        {chap.description}
                      </p>

                      {/* Location or Grade badge */}
                      {(chap.location || chap.grade) && (
                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          {chap.location && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--chip-bg)] border border-[var(--line)] text-[var(--muted)]">
                              <MapPin className="w-3 h-3 text-[#0B7658]" />
                              <span>{chap.location}</span>
                            </span>
                          )}
                          {chap.grade && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0B7658]/10 text-[#0B7658] font-mono font-medium">
                              <Award className="w-3 h-3" />
                              <span>{chap.grade}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Coursework & Focus Highlights */}
                      {chap.highlights && chap.highlights.length > 0 && (
                        <ul className="mt-4 pt-3 border-t border-[var(--line)]/50 flex flex-wrap gap-1.5">
                          {chap.highlights.map((h, i) => (
                            <li
                              key={i}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--line)] text-[var(--muted)]"
                            >
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.article>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
