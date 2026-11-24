import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Container from '@/components/ui/Container';
import ProjectCard from '@/components/ui/ProjectCard';
import { getProfile, getProjectsList } from '@/lib/services/firestore';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Projects | Kiran Sinha',
  description:
    'Comprehensive showcase of software engineering projects, web applications, and technical work by Kiran Sinha.',
};

export default async function AllProjectsPage() {
  const [profile, projects] = await Promise.all([
    getProfile(),
    getProjectsList(),
  ]);

  const allProjects = projects && projects.length > 0 ? projects : [];
  const githubUrl = profile?.githubUrl || 'https://github.com';

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-[#F9F9F9] min-h-[calc(100vh-140px)] border-b border-[#DADADA]">
      <Container>
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/#projects"
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5B5B5B] hover:text-[#0B7658] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658]"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#DADADA]">
          <div>
            <div className="inline-flex flex-col items-start">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#121212]">
                Portfolio Archive
              </span>
              <span
                className="mt-1.5 h-[2px] w-8 bg-[#0B7658] rounded-full"
                aria-hidden="true"
              />
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#121212] font-heading">
              All Projects
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#5B5B5B] max-w-xl">
              A comprehensive showcase of software engineering applications, tools, and technical explorations.
            </p>
          </div>

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0B7658] hover:text-[#096148] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7658] self-start md:self-end"
            >
              <span>GitHub Profile</span>
              <span className="transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
            </a>
          )}
        </div>

        {/* Projects Grid */}
        {allProjects.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project, idx) => (
              <ProjectCard
                key={project.id || project.slug || idx}
                project={project}
                index={idx}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-sm text-[#5B5B5B]">No projects found at this time.</p>
          </div>
        )}
      </Container>
    </div>
  );
}
