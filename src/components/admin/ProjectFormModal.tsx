'use client';

import React from 'react';
import type { Project } from '@/types';
import { X, Check, Loader2, Upload } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: Omit<Project, 'id'>;
  tagInput: string;
  submitting: boolean;
  uploadingImage: boolean;
  onClose: () => void;
  onChange: (form: Omit<Project, 'id'>) => void;
  onTitleChange: (title: string) => void;
  onTagInputChange: (tag: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProjectFormModal({
  isOpen,
  editingId,
  form,
  tagInput,
  submitting,
  uploadingImage,
  onClose,
  onChange,
  onTitleChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onImageUpload,
  onSubmit,
}: ProjectFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
      <div className="my-auto w-full max-w-2xl rounded-2xl bg-white border border-gray-300 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]">
        {/* Pinned Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure project showcase details, tech stack, and media.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Distributed System Visualizer"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => onChange({ ...form, slug: e.target.value })}
                placeholder="e.g. distributed-system-visualizer"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tagline / Brief Hook
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => onChange({ ...form, tagline: e.target.value })}
              placeholder="e.g. Real-time distributed systems topology map"
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="Explain what the project solves, technical architecture, and key achievements..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500 leading-relaxed"
            />
          </div>

          {/* Tech Stack Tag Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tech Stack Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddTag();
                  }
                }}
                placeholder="Type tech name and press Add"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
              <button
                type="button"
                onClick={onAddTag}
                className="px-3 py-2 border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs rounded font-medium"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-300 bg-gray-50 text-gray-700 text-xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="hover:text-red-600 ml-0.5"
                    title="Remove tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Live Demo URL
              </label>
              <input
                type="url"
                value={form.liveUrl}
                onChange={(e) => onChange({ ...form, liveUrl: e.target.value })}
                placeholder="https://myproject.com"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={form.repoUrl}
                onChange={(e) => onChange({ ...form, repoUrl: e.target.value })}
                placeholder="https://github.com/user/repo"
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Project Screenshot / Thumbnail
            </label>

            {form.thumbnailUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden bg-gray-100 border border-gray-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.thumbnailUrl}
                    alt="Project preview"
                    className="w-full h-full object-contain"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 rounded">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change / Re-crop Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onChange({ ...form, thumbnailUrl: '' })}
                    className="px-2 py-1 text-xs text-red-600 hover:underline"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 transition-colors">
                <Upload className="w-5 h-5 mb-1 text-gray-500" />
                <span className="font-medium">
                  {uploadingImage ? 'Processing...' : 'Upload & Crop Screenshot'}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, or WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Featured toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="featured-project"
              type="checkbox"
              checked={form.featured || false}
              onChange={(e) => onChange({ ...form, featured: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="featured-project"
              className="text-xs text-gray-700 select-none cursor-pointer"
            >
              Feature this project on public homepage
            </label>
          </div>

          {/* Pinned Action Footer */}
          <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 shrink-0 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{editingId ? 'Update Project' : 'Save Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
