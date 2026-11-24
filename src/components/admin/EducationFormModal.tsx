'use client';

import React, { useState, useRef } from 'react';
import type { Education } from '@/types';
import {
  X,
  Check,
  Loader2,
  Upload,
  RefreshCw,
  Trash2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface EducationFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: Omit<Education, 'id'>;
  submitting: boolean;
  processingLogo?: boolean;
  uploadingLogo: boolean;
  uploadProgress: number;
  logoError: string | null;
  onClose: () => void;
  onChange: (form: Omit<Education, 'id'>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileSelect: (file: File) => void;
  onRemoveLogo: () => void;
  onRetryLogoUpload?: () => void;
}

export default function EducationFormModal({
  isOpen,
  editingId,
  form,
  submitting,
  processingLogo = false,
  uploadingLogo,
  uploadProgress,
  logoError,
  onClose,
  onChange,
  onSubmit,
  onFileSelect,
  onRemoveLogo,
  onRetryLogoUpload,
}: EducationFormModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const isBusyWithLogo = processingLogo || uploadingLogo;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = '';
  };

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
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Degree */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Degree / Certificate *
            </label>
            <input
              type="text"
              required
              value={form.degree}
              onChange={(e) => onChange({ ...form, degree: e.target.value })}
              placeholder="e.g. Bachelor of Technology (B.Tech)"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Field of Study */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Field of Study *
            </label>
            <input
              type="text"
              required
              value={form.fieldOfStudy}
              onChange={(e) => onChange({ ...form, fieldOfStudy: e.target.value })}
              placeholder="e.g. Artificial Intelligence & Machine Learning"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Institution / University *
            </label>
            <input
              type="text"
              required
              value={form.institution}
              onChange={(e) => onChange({ ...form, institution: e.target.value })}
              placeholder="e.g. Mirai School of Technology"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Institution Logo Upload & Preview Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-700">
                Institution Logo <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              {form.logoUrl && !isBusyWithLogo && !logoError && (
                <span className="text-[11px] text-[#0B7658] font-medium">Logo attached</span>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />

            {/* Stage 1: Processing image (client-side rasterization & optimization) */}
            {processingLogo ? (
              <div className="p-4 rounded-xl border border-[#0B7658]/30 bg-[#E8F4EF]/50 flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0B7658]">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Processing image...</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Rasterizing and optimizing image...
                </p>
              </div>
            ) : uploadingLogo ? (
              /* Stage 2: Uploading logo (progress percentage + bar) */
              <div className="p-4 rounded-xl border border-[#0B7658]/30 bg-[#E8F4EF]/50 flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0B7658]">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Uploading logo: {uploadProgress}%</span>
                </div>
                <div className="w-full max-w-xs bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0B7658] h-full transition-all duration-200 ease-out"
                    style={{ width: `${Math.max(5, uploadProgress)}%` }}
                  />
                </div>
              </div>
            ) : form.logoUrl && !logoError ? (
              /* If a valid logo is attached and not in error, show the tile with Replace and Remove */
              <div className="flex items-center gap-4 p-3 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA]">
                {/* Logo Tile styled like public component */}
                <div className="relative w-20 h-20 rounded-2xl bg-white border border-[#E8E8E8] p-2 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.logoUrl}
                    alt={form.institution ? `${form.institution} logo` : 'Institution logo'}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="text-xs text-gray-700 font-medium">
                    Institution emblem attached
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={onRemoveLogo}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Dropzone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#0B7658] bg-[#E8F4EF]'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-2 text-gray-500">
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 mb-2 shadow-sm">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    PNG, JPG, SVG or WebP, up to 5MB. Square works best.
                  </p>
                </div>
              </div>
            )}

            {/* Inline Error Message with Retry Button */}
            {logoError && (
              <div className="mt-2 p-2.5 rounded-lg border border-red-200 bg-red-50/80 flex items-start justify-between gap-2 text-xs text-red-700">
                <div className="flex items-start gap-1.5 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="break-words leading-tight">{logoError}</span>
                </div>
                {onRetryLogoUpload && (
                  <button
                    type="button"
                    onClick={onRetryLogoUpload}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 bg-white text-red-700 text-[11px] font-semibold hover:bg-red-50 shrink-0 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date / Year
              </label>
              <input
                type="text"
                value={form.startDate}
                onChange={(e) => onChange({ ...form, startDate: e.target.value })}
                placeholder="e.g. 2025"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date / Year
              </label>
              <input
                type="text"
                value={form.endDate || ''}
                onChange={(e) => onChange({ ...form, endDate: e.target.value })}
                placeholder="e.g. 2029 or Present"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {/* Grade & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Grade / Honors <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.grade || ''}
                onChange={(e) => onChange({ ...form, grade: e.target.value })}
                placeholder="e.g. 89.9% | First Division with Distinction"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location || ''}
                onChange={(e) => onChange({ ...form, location: e.target.value })}
                placeholder="e.g. Delhi, India"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {/* Coursework / Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Coursework / Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description || ''}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="e.g. Relevant Coursework: Data Structures & Algorithms, Web Development..."
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              disabled={submitting || isBusyWithLogo}
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 text-xs hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isBusyWithLogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
