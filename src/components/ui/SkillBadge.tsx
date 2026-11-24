import React from 'react';
import type { Skill } from '@/types';
import {
  resolveSkillIcon,
  getAccessibleBrandColor,
  getFallbackChipIconType,
} from '@/lib/utils/skillIcons';
import { Code2, Cpu, Puzzle } from 'lucide-react';

interface SkillBadgeProps {
  skill: Skill;
  category?: string;
}

export default function SkillBadge({ skill, category }: SkillBadgeProps) {
  const cat = category || skill.category || '';
  const icon = resolveSkillIcon(skill.name);

  // Fallback Lucide component when no brand logo is in simple-icons
  const fallbackType = getFallbackChipIconType(cat);
  const FallbackIcon =
    fallbackType === 'Code2' ? Code2 : fallbackType === 'Cpu' ? Cpu : Puzzle;

  const accessibleColor = icon ? getAccessibleBrandColor(icon.hex) : '#0B7658';

  return (
    <li className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#E8E8E8] bg-[#FAFAFA] text-sm font-medium text-[#111] transition-all duration-200 hover:border-[#0B7658] hover:bg-white focus-within:ring-2 focus-within:ring-[#0B7658] focus-within:ring-offset-2 select-none">
      {icon ? (
        <svg
          role="img"
          viewBox="0 0 24 24"
          className="w-4 h-4 shrink-0"
          style={{ fill: accessibleColor }}
          aria-hidden="true"
        >
          <path d={icon.path} />
        </svg>
      ) : (
        <FallbackIcon
          className="w-4 h-4 shrink-0 text-[#0B7658]"
          aria-hidden="true"
        />
      )}
      <span className="truncate">{skill.name}</span>
    </li>
  );
}
