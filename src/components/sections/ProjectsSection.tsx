'use client';

import React from 'react';
import type { Project, Profile } from '@/types';
import ProjectDoors from '@/components/projects/ProjectDoors';

interface ProjectsSectionProps {
  projects: Project[];
  profile?: Profile | null;
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section id="projects" className="scroll-mt-20">
      <ProjectDoors projects={projects} />
    </section>
  );
}
