'use client';

import React, { useRef } from 'react';
import { useScroll } from 'framer-motion';
import type { Project } from '@/types';
import ProjectCard from '@/components/ui/ProjectCard';
import FadeIn from '@/components/motion/FadeIn';
import { FolderGit2 } from 'lucide-react';

interface ProjectsSectionProps {
  projects: Project[];
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Distributed System Topology Visualizer',
    slug: 'distributed-topology-visualizer',
    tagline: 'Real-time multi-cloud telemetry and latency benchmark engine',
    description:
      'High-performance canvas dashboard illustrating distributed microservice traffic, bottleneck alerts, and automated latency benchmarks.',
    thumbnailUrl: '',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'WebSockets', 'Canvas API'],
    liveUrl: 'https://example.com/demo',
    repoUrl: 'https://github.com/example/topology-visualizer',
    featured: true,
    order: 1,
  },
  {
    id: '2',
    title: 'OmniData ETL Pipeline Engine',
    slug: 'omnidata-etl-pipeline',
    tagline: 'High-throughput ETL service with dynamic schema transformation',
    description:
      'Engineered a scalable ingestion pipeline transforming semi-structured documents into indexed database records with sub-millisecond query performance.',
    thumbnailUrl: '',
    tags: ['TypeScript', 'Firebase', 'PostgreSQL', 'Node.js', 'Docker'],
    liveUrl: 'https://example.com/omnidata',
    repoUrl: 'https://github.com/example/omnidata',
    featured: true,
    order: 2,
  },
  {
    id: '3',
    title: 'Autonomous Code Synthesis Workbench',
    slug: 'code-synthesis-workbench',
    tagline: 'Multi-agent orchestration platform for verified code synthesis',
    description:
      'AI assistant platform supporting step-by-step reasoning, interactive code generation, and verifiable test sandbox execution.',
    thumbnailUrl: '',
    tags: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Gemini API'],
    liveUrl: 'https://example.com/synthesis',
    repoUrl: 'https://github.com/example/synthesis',
    featured: true,
    order: 3,
  },
];

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const data = projects && projects.length > 0 ? projects : DEFAULT_PROJECTS;
  const totalCards = data.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="projects"
      ref={containerRef}
      className="py-20 sm:py-28 relative"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <FadeIn y={20}>
          <div className="mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#BBCCD7] font-medium tracking-widest uppercase mb-2">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Selected Works</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-text">
              Featured Projects
            </h2>
            <p className="text-sm text-[#8E9BAE] mt-2 font-light max-w-xl">
              Production systems, architecture designs, and developer tooling.
            </p>
          </div>
        </FadeIn>

        {/* Sticky-Stacking Projects Container */}
        <div className="relative">
          {data.map((project, idx) => {
            const targetScale = 1 - (totalCards - 1 - idx) * 0.03;
            const rangeStart = idx * (1 / totalCards);

            return (
              <ProjectCard
                key={project.id || project.slug}
                project={project}
                index={idx}
                totalCards={totalCards}
                progress={scrollYProgress}
                range={[rangeStart, 1]}
                targetScale={targetScale}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
