'use client';

import React from 'react';
import type { Education } from '@/types';
import { X, Check, Loader2 } from 'lucide-react';

interface EducationFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: Omit<Education, 'id'>;
  submitting: boolean;
  onClose: () => void;
  onChange: (form: Omit<Education, 'id'>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EducationFormModal({
  isOpen,
  editingId,
  form,
  submitting,
  onClose,
  onChange,
  onSubmit,
}: EducationFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white border border-gray-300 p-6 shadow-2xl space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="text-sm font-bold text-gray-900">
            {editingId ? 'Edit Education Entry' : 'Add New Education'}
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
              Degree / Certificate *
            </label>
            <input
              type="text"
              required
              value={form.degree}
              onChange={(e) => onChange({ ...form, degree: e.target.value })}
              placeholder="e.g. Bachelor of Technology"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Field of Study *
            </label>
            <input
              type="text"
              required
              value={form.fieldOfStudy}
              onChange={(e) => onChange({ ...form, fieldOfStudy: e.target.value })}
              placeholder="e.g. Computer Science and Engineering"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Institution / University *
            </label>
            <input
              type="text"
              required
              value={form.institution}
              onChange={(e) => onChange({ ...form, institution: e.target.value })}
              placeholder="e.g. University Institute of Technology"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date / Year
              </label>
              <input
                type="text"
                value={form.startDate}
                onChange={(e) => onChange({ ...form, startDate: e.target.value })}
                placeholder="e.g. 2021"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date / Year
              </label>
              <input
                type="text"
                value={form.endDate}
                onChange={(e) => onChange({ ...form, endDate: e.target.value })}
                placeholder="e.g. 2025 or Present"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Grade / Honors
              </label>
              <input
                type="text"
                value={form.grade}
                onChange={(e) => onChange({ ...form, grade: e.target.value })}
                placeholder="e.g. First Class"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => onChange({ ...form, location: e.target.value })}
                placeholder="e.g. Bengaluru, India"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Coursework / Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="Key courses, thesis, extracurricular leadership..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
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
              <span>{editingId ? 'Update Record' : 'Create Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
