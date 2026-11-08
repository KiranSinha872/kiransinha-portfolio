'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { Code2, Layers, ArrowUpRight } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index: number;
  totalCards: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

export default function ProjectCard({
  project,
  index,
  progress,
  range,
  targetScale,
}: ProjectCardProps) {
  const safeRange: [number, number] = Array.isArray(range) && range.length === 2 ? range : [0, 1];
  const safeTargetScale = typeof targetScale === 'number' ? targetScale : 1;
  const scale = useTransform(progress, safeRange, [1, safeTargetScale]);
  const formattedNumber = String(index + 1).padStart(2, '0');
  const tags = Array.isArray(project.tags) ? project.tags : [];

  return (
    <div className="sticky top-24 sm:top-28 flex items-center justify-center mb-16 last:mb-0">
      <motion.div
        style={{
          scale,
        }}
        className="w-full rounded-[28px] sm:rounded-[36px] bg-[#141414] border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl group hover:border-white/20 transition-colors duration-300"
      >
        {/* Subtle Radial Gradient Accent in Card Corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#BBCCD7]/10 via-transparent to-transparent pointer-events-none rounded-tr-[36px]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Project Details */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              {/* Project Number + Featured Tag */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#BBCCD7] tracking-wider">
                  PROJECT {formattedNumber}
                </span>

                {project.featured && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide group-hover:text-[#BBCCD7] transition-colors">
                {project.title}
              </h3>

              {/* Tagline */}
              {project.tagline && (
                <p className="text-sm font-light text-[#BBCCD7] mt-1.5">
                  {project.tagline}
                </p>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm font-light text-[#8E9BAE] mt-3 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Tech Stack Pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-light rounded-full bg-white/5 border border-white/10 text-white/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Ghost-button style Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 text-white text-xs font-semibold tracking-wide hover:bg-white hover:text-black hover:border-white transition-all shadow-sm group/btn cursor-pointer"
                >
                  <span>Live Project</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
              )}

              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 text-xs font-medium tracking-wide transition-all"
                >
                  <Code2 className="w-4 h-4 text-[#BBCCD7]" />
                  <span>Source Code</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Browser Chrome Screenshot Mockup */}
          <div className="lg:col-span-6 w-full">
            <div className="w-full rounded-2xl bg-[#0C0D12] border border-white/10 shadow-2xl overflow-hidden group-hover:border-white/20 transition-all duration-300">
              {/* Browser Chrome Header */}
              <div className="px-3.5 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between gap-2 select-none">
                {/* Window control dots */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80" />
                </div>

                {/* URL search bar pill */}
                <div className="px-3 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-[#8E9BAE] flex items-center gap-1.5 max-w-[220px] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate">
                    {project.liveUrl
                      ? project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
                      : `${project.slug || 'project'}.app`}
                  </span>
                </div>

                {/* Right subtle tag */}
                <div className="w-10 flex justify-end">
                  <span className="text-[10px] text-white/30 font-mono">100%</span>
                </div>
              </div>

              {/* Viewport content area */}
              <div className="relative w-full aspect-[16/10] bg-[#070709] p-2 sm:p-3.5 flex items-center justify-center overflow-hidden">
                {project.thumbnailUrl ? (
                  <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center select-none">
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.title}
                      fill
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.02] pointer-events-none select-none"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#8E9BAE]/60 gap-2 p-8 text-center">
                    <Layers className="w-10 h-10 stroke-[1.2]" />
                    <span className="text-xs font-light">Interactive Project Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
