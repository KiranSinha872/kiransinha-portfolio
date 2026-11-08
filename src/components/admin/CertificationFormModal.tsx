'use client';

import React from 'react';
import type { Certification } from '@/types';
import { X, Check, Loader2, Upload } from 'lucide-react';

interface CertificationFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  form: Omit<Certification, 'id'>;
  submitting: boolean;
  uploadingBadge: boolean;
  onClose: () => void;
  onChange: (form: Omit<Certification, 'id'>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBadgeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CertificationFormModal({
  isOpen,
  editingId,
  form,
  submitting,
  uploadingBadge,
  onClose,
  onChange,
  onSubmit,
  onBadgeUpload,
}: CertificationFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white border border-gray-300 p-6 shadow-2xl space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="text-sm font-bold text-gray-900">
            {editingId ? 'Edit Certification' : 'Add New Certification'}
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
              Certificate Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="e.g. Google Cloud Professional Architect"
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Issuing Organization *
              </label>
              <input
                type="text"
                required
                value={form.issuer}
                onChange={(e) => onChange({ ...form, issuer: e.target.value })}
                placeholder="e.g. Google Cloud, AWS, Meta"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Issue Date / Year
              </label>
              <input
                type="text"
                value={form.issueDate}
                onChange={(e) => onChange({ ...form, issueDate: e.target.value })}
                placeholder="e.g. 2024"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Credential ID
              </label>
              <input
                type="text"
                value={form.credentialId}
                onChange={(e) => onChange({ ...form, credentialId: e.target.value })}
                placeholder="e.g. GCP-982314"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Credential Verification URL
              </label>
              <input
                type="url"
                value={form.credentialUrl}
                onChange={(e) => onChange({ ...form, credentialUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {/* Badge/Certificate Image Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Badge / Certificate Image (Optional)
            </label>
            {form.badgeUrl ? (
              <div className="flex items-center gap-3 p-2.5 rounded border border-gray-200 bg-gray-50">
                <div className="relative w-10 h-10 rounded overflow-hidden bg-white border border-gray-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.badgeUrl}
                    alt="Badge preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-100 rounded">
                    <Upload className="w-3 h-3" />
                    <span>Replace</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onBadgeUpload}
                      disabled={uploadingBadge}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onChange({ ...form, badgeUrl: '' })}
                    className="px-2 py-1 text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 rounded">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingBadge ? 'Processing...' : 'Upload & Crop Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onBadgeUpload}
                  disabled={uploadingBadge}
                  className="hidden"
                />
              </label>
            )}
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
              disabled={submitting || uploadingBadge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{editingId ? 'Update Certification' : 'Save Certification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
