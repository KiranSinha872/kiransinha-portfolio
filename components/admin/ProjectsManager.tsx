'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  getProjectsList,
  addProject,
  updateProject,
  deleteProject,
} from '@/lib/firestore';
import { uploadFileToStorage } from '@/lib/storage';
import { useToast } from './Toast';
import ImageCropModal from './ImageCropModal';
import type { Project } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  Upload,
  ExternalLink,
  Code2,
} from 'lucide-react';

export default function ProjectsManager() {
  const { showToast } = useToast();
  const [list, setList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<Omit<Project, 'id'>>({
    title: '',
    slug: '',
    tagline: '',
    description: '',
    thumbnailUrl: '',
    tags: [],
    liveUrl: '',
    repoUrl: '',
    featured: false,
    order: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getProjectsList();
      setList(data);
    } catch (err) {
      console.error('Fetch projects error:', err);
      showToast('error', 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      tagline: '',
      description: '',
      thumbnailUrl: '',
      tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      liveUrl: '',
      repoUrl: '',
      featured: false,
      order: list.length + 1,
    });
    setTagInput('');
    setModalOpen(true);
  };

  const openEditModal = (item: Project) => {
    setEditingId(item.id || null);
    setForm({
      title: item.title,
      slug: item.slug,
      tagline: item.tagline || '',
      description: item.description,
      thumbnailUrl: item.thumbnailUrl || '',
      tags: item.tags || [],
      liveUrl: item.liveUrl || '',
      repoUrl: item.repoUrl || '',
      featured: item.featured ?? false,
      order: item.order ?? 1,
    });
    setTagInput('');
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: editingId ? prev.slug : slug,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setSelectedImageFile(file);
    setCropModalOpen(true);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File, previewUrl: string) => {
    setCropModalOpen(false);
    setSelectedImageFile(null);

    // Show preview immediately
    setForm((prev) => ({ ...prev, thumbnailUrl: previewUrl }));

    try {
      setUploadingImage(true);
      const url = await uploadFileToStorage(croppedFile, 'projects');
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
      showToast('success', 'Project screenshot cropped and saved successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      showToast('error', 'Failed to upload project screenshot.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showToast('error', 'Project title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Omit<Project, 'id'> = {
        ...form,
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
      };

      if (editingId) {
        await updateProject(editingId, payload);
        showToast('success', `Updated project "${form.title}" in Firestore!`);
      } else {
        await addProject(payload);
        showToast('success', `Created project "${form.title}" in Firestore!`);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save project error:', err);
      showToast('error', 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete project "${title}"?`)) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      showToast('success', `Deleted project "${title}".`);
      await loadData();
    } catch (err) {
      console.error('Delete project error:', err);
      showToast('error', 'Failed to delete project.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Project Showcase</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage portfolio projects, tech stacks, live links, and screenshot assets.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="p-8 border border-gray-200 rounded text-center text-gray-500 text-xs">
          <p>No projects created yet.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 text-xs text-gray-900 underline"
          >
            Add your first showcase project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded overflow-hidden flex flex-col justify-between bg-white"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full bg-gray-100 border-b border-gray-200 flex items-center justify-center">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain"
                  />
                ) : (
                  <div className="text-xs text-gray-400">
                    No image
                  </div>
                )}
                {item.featured && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-semibold border border-gray-300 bg-white text-gray-800 rounded">
                    Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                    {item.title}
                  </h3>
                  {item.tagline && (
                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                      {item.tagline}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 border border-gray-200 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags && item.tags.length > 3 && (
                    <span className="px-1 py-0.5 text-[10px] text-gray-500">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900"
                        title="Live demo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {item.repoUrl && (
                      <a
                        href={item.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-gray-900"
                        title="Source code"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1 border border-gray-200 rounded text-gray-700 hover:bg-gray-50"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => item.id && handleDelete(item.id, item.title)}
                      className="p-1 border border-red-200 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
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
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
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
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
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
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
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
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type tech name and press Add"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
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
                        onClick={() => handleRemoveTag(tag)}
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
                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
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
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, thumbnailUrl: '' }))}
                        className="px-2 py-1 text-xs text-red-600 hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 transition-colors">
                    <Upload className="w-5 h-5 mb-1 text-gray-500" />
                    <span className="font-medium">{uploadingImage ? 'Processing...' : 'Upload & Crop Screenshot'}</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, or WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
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
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
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
                  onClick={() => setModalOpen(false)}
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
      )}

      {/* Interactive Image Cropper Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageFile={selectedImageFile}
        initialAspectRatio="16:9"
        initialFitMode="cover"
        title="Crop & Fit Project Screenshot"
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setCropModalOpen(false);
          setSelectedImageFile(null);
        }}
      />
    </div>
  );
}
