import type { Skill } from '@/types';

interface SkillBadgeProps {
  skill: Skill;
}

export default function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#141414] border border-white/10 text-sm hover:border-white/20 transition-colors">
      <div className="flex flex-col">
        <span className="font-medium text-white">
          {skill.name}
        </span>
        <span className="text-[11px] text-[#8E9BAE]">
          {skill.category}
        </span>
      </div>
      {skill.proficiency && (
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#BBCCD7]">
          {skill.proficiency}%
        </span>
      )}
    </div>
  );
}
