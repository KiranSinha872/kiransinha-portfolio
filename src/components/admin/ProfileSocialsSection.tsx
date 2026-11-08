'use client';

import React from 'react';
import { Mail, Phone, Terminal, Award, Flame } from 'lucide-react';
import { LinkedInIcon, GitHubIcon } from '@/components/ui/PlatformIcons';
import type { Profile } from '@/types';

interface ProfileSocialsSectionProps {
  formData: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function ProfileSocialsSection({
  formData,
  onChange,
}: ProfileSocialsSectionProps) {
  return (
    <>
      {/* Contact & Connect Links */}
      <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-800">Contact Details & Socials</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            These links appear in the &quot;Let&apos;s Connect&quot; / Contact section. Empty fields will be hidden on the public site.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <span>Primary Email Address</span>
            </label>
            <input
              type="email"
              value={formData.email || formData.contactEmail || ''}
              onChange={(e) =>
                onChange({
                  email: e.target.value,
                  contactEmail: e.target.value,
                })
              }
              placeholder="e.g. sinhakiran872@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-gray-500" />
              <span>Phone Number</span>
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <LinkedInIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>LinkedIn Profile URL</span>
            </label>
            <input
              type="url"
              value={formData.linkedinUrl || ''}
              onChange={(e) => onChange({ linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Coding & Competitive Programming Profiles */}
      <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-800">Coding Profiles & Competitive Programming</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            These profiles will be featured in the dedicated &quot;Coding Profiles&quot; section. Empty fields will be hidden automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <GitHubIcon className="w-3.5 h-3.5 text-gray-800" />
              <span>GitHub Profile URL</span>
            </label>
            <input
              type="url"
              value={formData.githubUrl || ''}
              onChange={(e) => onChange({ githubUrl: e.target.value })}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              <span>LeetCode Profile URL</span>
            </label>
            <input
              type="url"
              value={formData.leetcodeUrl || ''}
              onChange={(e) => onChange({ leetcodeUrl: e.target.value })}
              placeholder="https://leetcode.com/u/username"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>CodeChef Profile URL</span>
            </label>
            <input
              type="url"
              value={formData.codechefUrl || ''}
              onChange={(e) => onChange({ codechefUrl: e.target.value })}
              placeholder="https://codechef.com/users/username"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>Codeforces Profile URL</span>
            </label>
            <input
              type="url"
              value={formData.codeforcesUrl || ''}
              onChange={(e) => onChange({ codeforcesUrl: e.target.value })}
              placeholder="https://codeforces.com/profile/username"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>
      </div>
    </>
  );
}
