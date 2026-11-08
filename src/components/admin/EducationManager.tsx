'use client';

import React, { useState, useEffect } from 'react';
import {
  getEducationList,
  addEducation,
  updateEducation,
  deleteEducation,
} from '@/lib/services/firestore';
import { useToast } from '@/components/ui/Toast';
import type { Education } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
} from 'lucide-react';
import EducationFormModal from './EducationFormModal';

export default function EducationManager() {
  const { showToast } = useToast();
  const [list, setList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Education, 'id'>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
    location: '',
    description: '',
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
    setForm({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      location: '',
      description: '',
      order: list.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Education) => {
    setEditingId(item.id || null);
    setForm({
      institution: item.institution,
      degree: item.degree,
      fieldOfStudy: item.fieldOfStudy,
      startDate: item.startDate,
      endDate: item.endDate || '',
      grade: item.grade || '',
      location: item.location || '',
      description: item.description || '',
      order: item.order ?? 1,
    });
    setModalOpen(true);
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
        showToast('success', 'Education record updated in Firestore!');
      } else {
        await addEducation(form);
        showToast('success', 'New education record created in Firestore!');
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save education error:', err);
      showToast('error', 'Failed to save education record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    setDeletingId(id);
    try {
      await deleteEducation(id);
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
            Manage your degrees, academic milestones, coursework, and honors.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 self-start sm:self-auto"
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
              className="p-4 border border-gray-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {item.degree} in {item.fieldOfStudy}
                  </h3>
                  {item.grade && (
                    <span className="px-1.5 py-0.2 border border-gray-300 rounded text-[10px] text-gray-600">
                      {item.grade}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">
                  {item.institution} {item.location ? `• ${item.location}` : ''}
                </p>
                <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {item.startDate} — {item.endDate || 'Present'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-1.5 border border-gray-200 rounded text-gray-700 hover:bg-gray-50"
                  title="Edit entry"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={deletingId === item.id}
                  onClick={() => item.id && handleDelete(item.id)}
                  className="p-1.5 border border-red-200 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
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
        onClose={() => setModalOpen(false)}
        onChange={setForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
