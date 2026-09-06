'use client';

import type { Skill } from '@/types';
import FadeIn from '@/components/motion/FadeIn';
import { Cpu } from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
}

const DEFAULT_SKILLS: Skill[] = [
  { name: 'TypeScript', category: 'Programming' },
  { name: 'JavaScript (ES6+)', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'C++', category: 'Programming' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'React', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'HTML5 & CSS3', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'REST & GraphQL APIs', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Firestore & Firebase', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Pandas & NumPy', category: 'Data Science' },
  { name: 'Machine Learning', category: 'Data Science' },
  { name: 'Git & GitHub', category: 'Tools' },
  { name: 'Docker', category: 'Tools' },
  { name: 'VS Code & Postman', category: 'Tools' },
];

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const data = skills && skills.length > 0 ? skills : DEFAULT_SKILLS;

  // Group skills by category from Firestore data
  const categories = Array.from(new Set(data.map((s) => s.category || 'Other')));

  return (
    <section id="skills" className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <FadeIn y={20}>
          <div className="mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#BBCCD7] font-medium tracking-widest uppercase mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Technical Expertise</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-text">
              Skills & Proficiencies
            </h2>
            <p className="text-sm text-[#8E9BAE] mt-2 font-light max-w-xl">
              Specialized domain capabilities and technical disciplines.
            </p>
          </div>
        </FadeIn>

        {/* Vertical Numbered List (motionsites.ai Services layout) */}
        <div className="border-t border-white/10">
          {categories.map((category, idx) => {
            const categorySkills = data.filter((s) => (s.category || 'Other') === category);
            const formattedNumber = String(idx + 1).padStart(2, '0');

            return (
              <FadeIn key={category} delay={idx * 0.1} y={20}>
                <div className="group py-8 sm:py-10 border-b border-white/10 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-white/[0.02] transition-colors duration-300 px-2 sm:px-4 rounded-xl">
                  {/* Left Column: Number + Category */}
                  <div className="flex items-baseline gap-6 md:w-1/3 shrink-0">
                    <span className="font-mono text-3xl sm:text-5xl font-extrabold text-[#646973] group-hover:text-[#BBCCD7] transition-colors duration-300">
                      {formattedNumber}
                    </span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide group-hover:text-[#BBCCD7] transition-colors duration-300">
                        {category}
                      </h3>
                      <span className="text-xs text-[#8E9BAE] font-light">
                        {categorySkills.length} Technologies
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Stack of Skill Chips */}
                  <div className="flex-1 flex flex-wrap gap-2 md:justify-end">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.name}
                        className="px-3.5 py-1.5 rounded-full text-xs font-light text-white/90 bg-white/5 border border-white/10 group-hover:border-white/20 hover:bg-white/10 transition-all shadow-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
