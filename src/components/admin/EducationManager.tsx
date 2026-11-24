'use client';

import React, { useState, useEffect } from 'react';
import {
  getEducationList,
  addEducation,
  updateEducation,
  deleteEducation,
  deleteEducationLogoFile,
} from '@/lib/services/firestore';
import { useToast } from '@/components/ui/Toast';
import type { Education } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  Building2,
} from 'lucide-react';
import EducationFormModal from './EducationFormModal';
import {
  validateLogoFile,
  processInstitutionLogo,
  uploadInstitutionLogoFile,
  deleteStorageFile,
  mapStorageError,
} from './institutionLogoHelper';

export default function EducationManager() {
  const { showToast } = useToast();
  const [list, setList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Logo pipeline states
  const [processingLogo, setProcessingLogo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [initialLogoPath, setInitialLogoPath] = useState<string | null>(null);
  const [initialLogoUrl, setInitialLogoUrl] = useState<string | null>(null);
  const [newUploadedLogoPath, setNewUploadedLogoPath] = useState<string | null>(null);
  const [lastSelectedFile, setLastSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState<Omit<Education, 'id'>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
    location: '',
    description: '',
    logoUrl: '',
    logoPath: '',
    order: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getEducationList();
      setList(data);
    } catch (err) {
      console.error('Fetch education error:', err);
      showToast('error', 'Failed to load education entries.');
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
    setInitialLogoPath(null);
    setInitialLogoUrl(null);
    setNewUploadedLogoPath(null);
    setLastSelectedFile(null);
    setLogoError(null);
    setProcessingLogo(false);
    setUploadingLogo(false);
    setUploadProgress(0);
    setForm({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      location: '',
      description: '',
      logoUrl: '',
      logoPath: '',
      order: list.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Education) => {
    setEditingId(item.id || null);
    setInitialLogoPath(item.logoPath || null);
    setInitialLogoUrl(item.logoUrl || null);
    setNewUploadedLogoPath(null);
    setLastSelectedFile(null);
    setLogoError(null);
    setProcessingLogo(false);
    setUploadingLogo(false);
    setUploadProgress(0);
    setForm({
      institution: item.institution,
      degree: item.degree,
      fieldOfStudy: item.fieldOfStudy,
      startDate: item.startDate,
      endDate: item.endDate || '',
      grade: item.grade || '',
      location: item.location || '',
      description: item.description || '',
      logoUrl: item.logoUrl || '',
      logoPath: item.logoPath || '',
      order: item.order ?? 1,
    });
    setModalOpen(true);
  };

  const handleCloseModal = async () => {
    // If a new file was uploaded in this modal session but never saved, clean it up
    if (newUploadedLogoPath && newUploadedLogoPath !== initialLogoPath) {
      await deleteStorageFile(newUploadedLogoPath);
    }
    setNewUploadedLogoPath(null);
    setLastSelectedFile(null);
    setLogoError(null);
    setProcessingLogo(false);
    setUploadingLogo(false);
    setUploadProgress(0);
    setModalOpen(false);
  };

  const executeUpload = async (file: File) => {
    setLogoError(null);
    setLastSelectedFile(file);
    setUploadProgress(0);

    // 1. Validate file
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      const err = validation.error || 'Invalid image file.';
      setLogoError(err);
      showToast('error', err);
      return;
    }

    try {
      // 2. Stage 1: Processing image (rasterize, downscale, convert)
      setProcessingLogo(true);
      setUploadingLogo(false);

      const { file: processedFile, previewUrl } = await processInstitutionLogo(file);

      // Temporary preview during upload
      setForm((prev) => ({ ...prev, logoUrl: previewUrl }));

      // 3. Stage 2: Upload to Supabase Storage with progress events
      setProcessingLogo(false);
      setUploadingLogo(true);

      const targetId = editingId || `edu_${Date.now()}`;
      const { logoUrl, logoPath } = await uploadInstitutionLogoFile(
        processedFile,
        targetId,
        (progress) => setUploadProgress(progress),
        30000 // 30 second timeout
      );

      // If user uploaded multiple files in the same modal session, delete previous intermediate upload
      if (newUploadedLogoPath && newUploadedLogoPath !== initialLogoPath) {
        await deleteStorageFile(newUploadedLogoPath);
      }

      setNewUploadedLogoPath(logoPath);
      setForm((prev) => ({
        ...prev,
        logoUrl,
        logoPath,
      }));

      showToast('success', 'Institution logo processed and uploaded!');
    } catch (err) {
      console.error('Logo processing or upload error:', err);
      const userMsg = mapStorageError(err);
      setLogoError(userMsg);
      showToast('error', userMsg);
      // Revert preview to previous logo if processing or upload failed
      setForm((prev) => ({
        ...prev,
        logoUrl: initialLogoUrl || '',
        logoPath: initialLogoPath || '',
      }));
    } finally {
      // Always reset both processing and uploading indicators
      setProcessingLogo(false);
      setUploadingLogo(false);
    }
  };

  const handleFileSelect = (file: File) => {
    executeUpload(file);
  };

  const handleRetryUpload = () => {
    if (lastSelectedFile) {
      executeUpload(lastSelectedFile);
    }
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({
      ...prev,
      logoUrl: '',
      logoPath: '',
    }));
    setLogoError(null);
    setLastSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.institution.trim() || !form.degree.trim()) {
      showToast('error', 'Institution and Degree are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateEducation(editingId, form);
        // If an old logo existed and was replaced or removed, delete the old file from storage
        if (initialLogoPath && initialLogoPath !== form.logoPath) {
          await deleteEducationLogoFile(initialLogoPath);
        }
        showToast('success', 'Education record updated successfully!');
      } else {
        await addEducation(form);
        showToast('success', 'New education record created successfully!');
      }

      setNewUploadedLogoPath(null);
      setLastSelectedFile(null);
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save education error:', err);
      // If the Firestore write fails, delete the newly uploaded orphaned file
      if (newUploadedLogoPath && newUploadedLogoPath !== initialLogoPath) {
        await deleteStorageFile(newUploadedLogoPath);
      }
      showToast('error', 'Failed to save education record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: Education) => {
    if (!item.id) return;
    if (!confirm(`Are you sure you want to delete ${item.institution}?`)) return;

    setDeletingId(item.id);
    try {
      await deleteEducation(item.id);
      showToast('success', 'Education entry deleted successfully.');
      await loadData();
    } catch (err) {
      console.error('Delete education error:', err);
      showToast('error', 'Failed to delete education entry.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Education History</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage degrees, institutions, logos, academic milestones, and coursework.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 self-start sm:self-auto transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-12 flex justify-center items-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="p-8 border border-gray-200 rounded text-center text-gray-500 text-xs">
          <p>No education records found.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 text-xs text-gray-900 underline"
          >
            Add an education entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3">
                {/* Logo or placeholder icon */}
                <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  {item.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.logoUrl}
                      alt={item.institution}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm">
                      {item.degree} {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ''}
                    </h3>
                    {item.grade && (
                      <span className="px-2 py-0.5 border border-gray-300 rounded text-[10px] text-gray-600 bg-gray-50">
                        {item.grade}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">{item.institution}</span>
                    {item.location ? ` • ${item.location}` : ''}
                  </p>
                  <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {item.startDate} — {item.endDate || (item.isCurrent ? 'Present' : '')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Edit entry"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item)}
                  className="p-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  title="Delete entry"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <EducationFormModal
        isOpen={modalOpen}
        editingId={editingId}
        form={form}
        submitting={submitting}
        processingLogo={processingLogo}
        uploadingLogo={uploadingLogo}
        uploadProgress={uploadProgress}
        logoError={logoError}
        onClose={handleCloseModal}
        onChange={setForm}
        onSubmit={handleSubmit}
        onFileSelect={handleFileSelect}
        onRemoveLogo={handleRemoveLogo}
        onRetryLogoUpload={handleRetryUpload}
      />
    </div>
  );
}
