'use client';

import React, { useState, useEffect } from 'react';
import {
  getCertificationsList,
  addCertification,
  updateCertification,
  deleteCertification,
} from '@/lib/services/firestore';
import { uploadFileToStorage } from '@/lib/services/storage';
import { useToast } from '@/components/ui/Toast';
import ImageCropModal from '@/components/ui/ImageCropModal';
import type { Certification } from '@/types';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import CertificationFormModal from './CertificationFormModal';

export default function CertificationsManager() {
  const { showToast } = useToast();
  const [list, setList] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingBadge, setUploadingBadge] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Certification, 'id'>>({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    badgeUrl: '',
    order: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getCertificationsList();
      setList(data);
    } catch (err) {
      console.error('Fetch certs error:', err);
      showToast('error', 'Failed to load certifications.');
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
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      badgeUrl: '',
      order: list.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Certification) => {
    setEditingId(item.id || null);
    setForm({
      title: item.title,
      issuer: item.issuer,
      issueDate: item.issueDate,
      expiryDate: item.expiryDate || '',
      credentialId: item.credentialId || '',
      credentialUrl: item.credentialUrl || '',
      badgeUrl: item.badgeUrl || '',
      order: item.order ?? 1,
    });
    setModalOpen(true);
  };

  const handleBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setForm((prev) => ({ ...prev, badgeUrl: previewUrl }));

    try {
      setUploadingBadge(true);
      const url = await uploadFileToStorage(croppedFile, 'certifications');
      setForm((prev) => ({ ...prev, badgeUrl: url }));
      showToast('success', 'Certificate badge cropped and saved!');
    } catch (err) {
      console.error('Upload error:', err);
      showToast('error', 'Failed to upload certificate image.');
    } finally {
      setUploadingBadge(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.issuer.trim()) {
      showToast('error', 'Title and Issuer are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateCertification(editingId, form);
        showToast('success', 'Certification updated in Firestore!');
      } else {
        await addCertification(form);
        showToast('success', 'New certification recorded in Firestore!');
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save cert error:', err);
      showToast('error', 'Failed to save certification.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete certification "${title}"?`)) return;
    setDeletingId(id);
    try {
      await deleteCertification(id);
      showToast('success', `Deleted certification "${title}".`);
      await loadData();
    } catch (err) {
      console.error('Delete cert error:', err);
      showToast('error', 'Failed to delete certification.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Certifications & Badges</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage professional certificates, cloud licenses, and verification credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certification</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="p-8 border border-gray-200 rounded text-center text-gray-500 text-xs">
          <p>No certifications added yet.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 text-xs text-gray-900 underline"
          >
            Add your first certificate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded flex flex-col justify-between gap-3 bg-white"
            >
              <div className="flex items-start gap-3">
                {item.badgeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.badgeUrl}
                    alt={item.title}
                    className="w-10 h-10 rounded object-contain bg-gray-50 p-1 border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="p-2 border border-gray-200 rounded text-gray-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                )}

                <div className="space-y-0.5 flex-1 min-w-0 text-xs">
                  <h3 className="font-bold text-gray-900 truncate">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.issuer}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span>Issued {item.issueDate}</span>
                    {item.credentialId && (
                      <span className="truncate">• ID: {item.credentialId}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                {item.credentialUrl ? (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:underline flex items-center gap-1"
                  >
                    <span>Verify Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-gray-400">No URL</span>
                )}

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
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <CertificationFormModal
        isOpen={modalOpen}
        editingId={editingId}
        form={form}
        submitting={submitting}
        uploadingBadge={uploadingBadge}
        onClose={() => setModalOpen(false)}
        onChange={setForm}
        onSubmit={handleSubmit}
        onBadgeUpload={handleBadgeUpload}
      />

      {/* Interactive Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageFile={selectedImageFile}
        initialAspectRatio="1:1"
        initialFitMode="contain"
        title="Crop & Fit Badge / Certificate"
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setCropModalOpen(false);
          setSelectedImageFile(null);
        }}
      />
    </div>
  );
}
