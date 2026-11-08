'use client';

import React from 'react';
import type { Skill, SkillCategory } from '@/types';
import { X, Check, Loader2 } from 'lucide-react';

export const CATEGORIES: SkillCategory[] = [
  'Programming',
  'Backend',
  'Database',
  'Frontend',
  'Data Science',
  'Tools',
];

interface SkillFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: Omit<Skill, 'id'>;
  submitting: boolean;
  onClose: () => void;
  onChange: (form: Omit<Skill, 'id'>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SkillFormModal({
  isOpen,
  editingId,
  form,
  submitting,
  onClose,
  onChange,
  onSubmit,
}: SkillFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
      <div className="my-auto w-full max-w-md rounded-2xl bg-white border border-gray-300 p-6 shadow-2xl space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="text-sm font-bold text-gray-900">
            {editingId ? 'Edit Skill' : 'Add New Skill'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Skill Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="e.g. Next.js, Docker, Python"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                onChange({ ...form, category: e.target.value as SkillCategory })
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
              <span>Proficiency</span>
              <span className="font-mono">{form.proficiency || 80}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={form.proficiency || 80}
              onChange={(e) =>
                onChange({ ...form, proficiency: parseInt(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="featured-skill"
              type="checkbox"
              checked={form.featured || false}
              onChange={(e) => onChange({ ...form, featured: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="featured-skill"
              className="text-xs text-gray-700 select-none cursor-pointer"
            >
              Mark as primary/featured skill
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 text-xs hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{editingId ? 'Update Skill' : 'Create Skill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
