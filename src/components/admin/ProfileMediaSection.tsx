'use client';

import React from 'react';
import {
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';
import type { Profile } from '@/types';

interface ProfileMediaSectionProps {
  formData: Partial<Profile>;
  uploadingResume: boolean;
  onResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveResume: () => void;
  onPreviewResume: () => void;
}

export default function ProfileMediaSection({
  formData,
  uploadingResume,
  onResumeUpload,
  onRemoveResume,
  onPreviewResume,
}: ProfileMediaSectionProps) {
  return (
    <>
      {/* Resume Document Upload */}
      <div className="p-4 border border-gray-200 rounded bg-gray-50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-800 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Resume Document (PDF)</span>
            </label>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Upload your latest resume PDF for the public &apos;View Resume&apos; button.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>
              {uploadingResume
                ? 'Uploading...'
                : formData.resumeUrl
                ? 'Replace Resume PDF'
                : 'Upload Resume (PDF)'}
            </span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={onResumeUpload}
              disabled={uploadingResume}
              className="hidden"
            />
          </label>
        </div>

        {formData.resumeUrl && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 border border-gray-200 rounded bg-white text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">Resume PDF Attached</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreviewResume}
                className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <a
                href={formData.resumeUrl}
                download="Kiran_Sinha_Resume.pdf"
                className="inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>

              <button
                type="button"
                onClick={onRemoveResume}
                className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                title="Remove Resume"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
