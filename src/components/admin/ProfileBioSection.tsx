'use client';

import React from 'react';
import type { Profile } from '@/types';

interface ProfileBioSectionProps {
  formData: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function ProfileBioSection({
  formData,
  onChange,
}: ProfileBioSectionProps) {
  return (
    <>
      {/* Text Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Kiran Sinha"
            className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Professional Title / Tagline
          </label>
          <p className="text-[11px] text-gray-500 mb-1.5">
            Tagline displayed across the site (Hero section, site Footer, and SEO title).
          </p>
          <input
            type="text"
            value={formData.title || formData.headline || formData.tagline || ''}
            onChange={(e) =>
              onChange({
                title: e.target.value,
                headline: e.target.value,
                tagline: e.target.value,
              })
            }
            placeholder="e.g. B.Tech AI/ML Student | Aspiring Software Engineer"
            className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {/* Split Bio & About Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Bio (Hero Section)
          </label>
          <p className="text-[11px] text-gray-500 mb-1.5">
            Short intro displayed under your name and title in the top Hero header.
          </p>
          <textarea
            rows={4}
            value={formData.bio || ''}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="e.g. Building robust, accessible, and performant web products with Next.js, TypeScript, and modern cloud architectures."
            className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            About (About Section)
          </label>
          <p className="text-[11px] text-gray-500 mb-1.5">
            Comprehensive story and background for the scroll-reveal About section.
          </p>
          <textarea
            rows={4}
            value={formData.about || ''}
            onChange={(e) => onChange({ about: e.target.value })}
            placeholder="e.g. I am a first-year B.Tech student specializing in Artificial Intelligence & Machine Learning..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500 leading-relaxed"
          />
        </div>
      </div>
    </>
  );
}
