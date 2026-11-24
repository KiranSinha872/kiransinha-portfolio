'use client';

import React from 'react';
import Link from 'next/link';
import type { Project, Profile } from '@/types';
import ProjectCard from '@/components/ui/ProjectCard';
import Container from '@/components/ui/Container';

interface ProjectsSectionProps {
  projects: Project[];
  profile?: Profile | null;
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const data = projects && projects.length > 0 ? projects : [];
  const displayedProjects = data.slice(0, 3);

  if (data.length === 0) {
    return null;
  }

  return (
    <section id="projects" className="py-16 sm:py-24 bg-[#F9F9F9] border-b border-[#DADADA]">
      <Container>
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-0">
          
          {/* Left column (about 1/4 width on desktop): Section label, blurb, "View all projects →" */}
          <div className="lg:w-1/4 lg:pr-10 lg:border-r lg:border-[#DADADA] flex flex-col justify-between">
            <div>
              {/* Small letter-spaced uppercase section label */}
              <div className="inline-flex flex-col items-start">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#121212]">
                  Selected Projects
                </span>
                <span
                  className="mt-1.5 h-[2px] w-8 bg-[#0B7658] rounded-full"
                  aria-hidden="true"
                />
              </div>

              {/* Short blurb */}
              <p className="mt-6 text-sm text-[#5B5B5B] leading-relaxed max-w-xs">
                A collection of work that reflects strategy, clarity, and impact.
              </p>
            </div>

            {/* Green text link "View all projects →" redirecting to /projects */}
            <div className="pt-6">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0B7658] hover:text-[#096148] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
              >
                <span>View all projects</span>
                <span className="transform transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Right column (about 3/4 width on desktop): up to 3 projects */}
          <div className="lg:w-3/4 lg:pl-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProjects.map((project, idx) => (
                <ProjectCard
                  key={project.id || project.slug || idx}
                  project={project}
                  index={idx}
                />
              ))}
            </div>

            {/* Mobile "View all projects" link under the cards */}
            {data.length > 3 && (
              <div className="mt-8 pt-6 border-t border-[#DADADA] flex justify-center lg:hidden">
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0B7658] hover:text-[#096148] transition-colors"
                >
                  <span>View all projects ({data.length})</span>
                  <span className="transform transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </Container>
    </section>
  );
}
