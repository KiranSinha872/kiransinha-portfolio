'use client';

import React, { useState, useEffect } from 'react';
import {
  getProjectsList,
  addProject,
  updateProject,
  deleteProject,
} from '@/lib/services/firestore';
import { uploadFileToStorage } from '@/lib/services/storage';
import { useToast } from '@/components/ui/Toast';
import ImageCropModal from '@/components/ui/ImageCropModal';
import type { Project } from '@/types';
import { Plus, Loader2 } from 'lucide-react';
import ProjectFormModal from './ProjectFormModal';
import ProjectAdminCard from './ProjectAdminCard';

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
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setForm((prev) => ({
      ...prev,
      title: val,
      slug: editingId ? prev.slug : generatedSlug,
    }));
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    setSelectedImageFile(file);
    setCropModalOpen(true);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File, previewUrl: string) => {
    setCropModalOpen(false);
    setSelectedImageFile(null);

    setForm((prev) => ({ ...prev, thumbnailUrl: previewUrl }));

    try {
      setUploadingImage(true);
      const downloadUrl = await uploadFileToStorage(croppedFile, 'projects');
      setForm((prev) => ({ ...prev, thumbnailUrl: downloadUrl }));
      showToast('success', 'Screenshot cropped and uploaded successfully!');
    } catch (err) {
      console.error('Project image upload error:', err);
      showToast('error', 'Failed to upload cropped project image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      showToast('error', 'Title and Description are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProject(editingId, form);
        showToast('success', 'Project updated successfully.');
      } else {
        await addProject(form);
        showToast('success', 'Project created successfully.');
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Submit project error:', err);
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
            <ProjectAdminCard
              key={item.id}
              item={item}
              isDeleting={deletingId === item.id}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <ProjectFormModal
        isOpen={modalOpen}
        editingId={editingId}
        form={form}
        tagInput={tagInput}
        submitting={submitting}
        uploadingImage={uploadingImage}
        onClose={() => setModalOpen(false)}
        onChange={setForm}
        onTitleChange={handleTitleChange}
        onTagInputChange={setTagInput}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onImageUpload={handleImageUpload}
        onSubmit={handleSubmit}
      />

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
