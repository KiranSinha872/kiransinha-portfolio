import React from 'react';
import type { Skill } from '@/types';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import SkillBadge from '@/components/ui/SkillBadge';
import {
  getCategoryIconType,
  type CategoryIconType,
} from '@/lib/utils/skillIcons';
import {
  Code2,
  Server,
  Database,
  Layout,
  BarChart3,
  Wrench,
  Layers,
} from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
}

const DEFAULT_SKILLS: Skill[] = [
  { name: 'TypeScript', category: 'Programming', proficiency: 90 },
  { name: 'JavaScript (ES6+)', category: 'Programming', proficiency: 92 },
  { name: 'Python', category: 'Programming', proficiency: 85 },
  { name: 'C++', category: 'Programming', proficiency: 80 },
  { name: 'Next.js', category: 'Frontend', proficiency: 88 },
  { name: 'React', category: 'Frontend', proficiency: 90 },
  { name: 'Tailwind CSS', category: 'Frontend', proficiency: 94 },
  { name: 'Node.js', category: 'Backend', proficiency: 86 },
  { name: 'Express.js', category: 'Backend', proficiency: 84 },
  { name: 'REST & GraphQL APIs', category: 'Backend', proficiency: 82 },
  { name: 'PostgreSQL', category: 'Database', proficiency: 80 },
  { name: 'Firestore & Firebase', category: 'Database', proficiency: 85 },
  { name: 'Git & GitHub', category: 'Tools', proficiency: 88 },
  { name: 'Docker', category: 'Tools' },
  { name: 'VS Code & Postman', category: 'Tools' },
];

function CategoryIcon({ type }: { type: CategoryIconType }) {
  const iconProps = { className: 'w-4 h-4', 'aria-hidden': true as const };
  switch (type) {
    case 'Code2':
      return <Code2 {...iconProps} />;
    case 'Server':
      return <Server {...iconProps} />;
    case 'Database':
      return <Database {...iconProps} />;
    case 'Layout':
      return <Layout {...iconProps} />;
    case 'BarChart3':
      return <BarChart3 {...iconProps} />;
    case 'Wrench':
      return <Wrench {...iconProps} />;
    case 'Layers':
    default:
      return <Layers {...iconProps} />;
  }
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const data = skills && skills.length > 0 ? skills : DEFAULT_SKILLS;

  // Dynamically group skills by category while preserving first-seen order
  const categoryOrder: string[] = [];
  const groupedSkills = new Map<string, Skill[]>();

  for (const skill of data) {
    const rawCategory = skill.category ? skill.category.trim() : '';
    // An empty category must not render a card
    if (!rawCategory) continue;

    if (!groupedSkills.has(rawCategory)) {
      groupedSkills.set(rawCategory, []);
      categoryOrder.push(rawCategory);
    }
    groupedSkills.get(rawCategory)!.push(skill);
  }

  // Inside each category, preserve skill order (order field if present, otherwise first-seen)
  for (const cat of categoryOrder) {
    const list = groupedSkills.get(cat)!;
    list.sort((a, b) => {
      if (typeof a.order === 'number' && typeof b.order === 'number') {
        return a.order - b.order;
      }
      return 0;
    });
  }

  return (
    <section
      id="skills"
      className="py-16 sm:py-24 bg-[#F9F9F9] text-[#111] border-b border-[#E8E8E8]"
    >
      <Container>
        {/* Section Heading: Existing label style, title and one-line subtitle */}
        <SectionHeading
          label="SKILLS & TOOLKIT"
          title="Skills & Expertise"
          description="Technical capabilities, frameworks, and engineering disciplines."
        />

        {/* Dynamic Category Cards Grid: 1 col on mobile, 2 on tablet, 3 on desktop (max width 1200px) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          {categoryOrder.map((category) => {
            const categorySkills = groupedSkills.get(category) || [];
            if (categorySkills.length === 0) return null;

            const iconType = getCategoryIconType(category);
            const headingId = `skills-cat-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

            return (
              <article
                key={category}
                aria-labelledby={headingId}
                className="group relative flex flex-col justify-between bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0B7658]/40 hover:shadow-md motion-reduce:hover:translate-y-0 h-full"
              >
                <div>
                  {/* Card Header: Icon tile (emerald tint) + Category Name + Muted Count */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg bg-[#0B7658]/10 text-[#0B7658] flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <CategoryIcon type={iconType} />
                      </div>
                      <h3
                        id={headingId}
                        className="text-base font-semibold text-[#111] tracking-tight truncate"
                      >
                        {category}
                      </h3>
                    </div>
                    <span className="text-xs text-[#5B5B5B] font-normal shrink-0">
                      {categorySkills.length}{' '}
                      {categorySkills.length === 1 ? 'skill' : 'skills'}
                    </span>
                  </div>

                  {/* Thin divider */}
                  <hr className="my-5 border-[#E8E8E8]" aria-hidden="true" />

                  {/* Skills Chips List */}
                  <ul className="flex flex-wrap gap-2" role="list">
                    {categorySkills.map((skill) => (
                      <SkillBadge
                        key={skill.name}
                        skill={skill}
                        category={category}
                      />
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
