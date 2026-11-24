'use client';

import React from 'react';
import Image from 'next/image';
import { Code2 } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const formattedNumber = String(index + 1).padStart(2, '0');
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const primaryUrl = project.liveUrl || project.repoUrl || '';
  const TileWrapper = primaryUrl ? 'a' : 'div';
  const tileProps = primaryUrl
    ? {
        href: primaryUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `${project.title} — ${project.liveUrl ? 'View Live Demo' : 'View Source Code'}`,
      }
    : {};

  return (
    <div className="group flex flex-col">
      {/* a. Header: Small number (01, 02) in DM Serif Display + Title in bold small caps, subtitle underneath in muted text */}
      <div className="mb-2.5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif-num text-base font-normal text-[#121212] select-none shrink-0">
            {formattedNumber}
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#121212] group-hover:text-[#0B7658] transition-colors duration-200 leading-snug line-clamp-2">
            {project.title}
          </h3>
        </div>

        {project.tagline && (
          <p className="text-xs text-[#5B5B5B] mt-1 leading-normal font-normal">
            {project.tagline}
          </p>
        )}
      </div>

      {/* b. Short green underline accent under the header, with a thin divider line across the column */}
      <div className="relative w-full h-[2px] bg-[#DADADA] mb-4">
        <div className="absolute left-0 top-0 h-[2px] w-8 bg-[#0B7658] rounded-full" />
      </div>

      {/* c. Large screenshot tile: rounded-12px, aspect 4:5, cover, light-grey bg, no heavy borders/shadows */}
      <TileWrapper
        {...tileProps}
        className="block relative w-full aspect-[4/5] bg-[#F1F1F1] rounded-[12px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
      >
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={`${project.title} screenshot`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top select-none pointer-events-none transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#5B5B5B] select-none">
            <Code2 className="w-8 h-8 text-[#0B7658] mb-2" />
            <span className="text-xs uppercase tracking-wider font-semibold text-[#121212]">
              {project.title}
            </span>
            <span className="text-[11px] text-[#5B5B5B] mt-1 text-center">
              Preview Unavailable
            </span>
          </div>
        )}
      </TileWrapper>

      {/* d. Below the tile: one quiet line with "Source code" text link + plain muted tech stack separated by commas */}
      <div className="mt-3 flex items-center justify-between text-xs text-[#5B5B5B] gap-2">
        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0B7658] shrink-0"
          >
            Source code
          </a>
        ) : (
          <span className="text-[#5B5B5B]/60 text-[11px]">Private source</span>
        )}

        {tags.length > 0 && (
          <span
            className="truncate text-right text-[11px] text-[#5B5B5B]"
            title={tags.join(', ')}
          >
            {tags.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}
