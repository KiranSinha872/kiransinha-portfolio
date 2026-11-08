'use client';

import React from 'react';
import { MapPin, Sparkles, UserCheck } from 'lucide-react';
import type { Profile } from '@/types';

interface ProfileBadgesSectionProps {
  formData: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function ProfileBadgesSection({
  formData,
  onChange,
}: ProfileBadgesSectionProps) {
  return (
    <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-800">About Section Highlight Badges</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Customize the three pill badges displayed at the bottom of the About section.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#4B6B94]" />
            <span>Badge 1: Location</span>
          </label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g. Delhi"
            className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
          />
          <p className="text-[10px] text-gray-400 mt-1">Displays as: &quot;Based in {formData.location || 'Delhi'}&quot;</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Badge 2: Specialization</span>
          </label>
          <input
            type="text"
            value={formData.focusArea || ''}
            onChange={(e) => onChange({ focusArea: e.target.value })}
            placeholder="e.g. Full-Stack & Cloud Architecture"
            className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
          />
          <p className="text-[10px] text-gray-400 mt-1">Displays as: &quot;{formData.focusArea || 'Full-Stack & Cloud Architecture'}&quot;</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-[#4B6B94]" />
            <span>Badge 3: Mindset / Trait</span>
          </label>
          <input
            type="text"
            value={formData.mindset || ''}
            onChange={(e) => onChange({ mindset: e.target.value })}
            placeholder="e.g. Continuous Learner"
            className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
          />
          <p className="text-[10px] text-gray-400 mt-1">Displays as: &quot;{formData.mindset || 'Continuous Learner'}&quot;</p>
        </div>
      </div>
    </div>
  );
}
