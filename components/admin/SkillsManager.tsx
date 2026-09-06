'use client';

import React, { useState, useEffect } from 'react';
import {
  getSkillsList,
  addSkill,
  updateSkill,
  deleteSkill,
} from '@/lib/firestore';
import { useToast } from './Toast';
import type { Skill, SkillCategory } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
} from 'lucide-react';

const CATEGORIES: SkillCategory[] = [
  'Programming',
  'Backend',
  'Database',
  'Frontend',
  'Data Science',
  'Tools',
];

export default function SkillsManager() {
  const { showToast } = useToast();
  const [list, setList] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Skill, 'id'>>({
    name: '',
    category: 'Programming',
    proficiency: 90,
    featured: false,
    order: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSkillsList();
      setList(data);
    } catch (err) {
      console.error('Fetch skills error:', err);
      showToast('error', 'Failed to load skills list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = (defaultCategory?: SkillCategory) => {
    setEditingId(null);
    setForm({
      name: '',
      category: defaultCategory || 'Programming',
      proficiency: 90,
      featured: false,
      order: list.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Skill) => {
    setEditingId(item.id || null);
    setForm({
      name: item.name,
      category: item.category,
      proficiency: item.proficiency ?? 90,
      featured: item.featured ?? false,
      order: item.order ?? 1,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('error', 'Skill name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateSkill(editingId, form);
        showToast('success', `Updated "${form.name}" in Firestore!`);
      } else {
        await addSkill(form);
        showToast('success', `Added "${form.name}" to skills collection!`);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Save skill error:', err);
      showToast('error', 'Failed to save skill.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from skills?`)) return;
    setDeletingId(id);
    try {
      await deleteSkill(id);
      showToast('success', `Deleted skill "${name}".`);
      await loadData();
    } catch (err) {
      console.error('Delete skill error:', err);
      showToast('error', 'Failed to delete skill.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Skills & Technologies</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize your technical competencies into grouped tags for the public portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Skill</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="p-8 border border-gray-200 rounded text-center text-gray-500 text-xs">
          <p>No skills added yet.</p>
          <button
            type="button"
            onClick={() => openAddModal()}
            className="mt-2 text-xs text-gray-900 underline"
          >
            Add your first skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const catSkills = list.filter((s) => (s.category || 'Other') === cat);

            return (
              <div
                key={cat}
                className="p-4 border border-gray-200 rounded bg-white space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-gray-900">{cat}</h3>
                      <span className="text-[11px] text-gray-500 font-mono">
                        ({catSkills.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAddModal(cat)}
                      className="text-xs text-gray-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {catSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded border border-gray-200 bg-gray-50 text-xs text-gray-800"
                      >
                        <span className="font-medium">{skill.name}</span>
                        {skill.proficiency && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {skill.proficiency}%
                          </span>
                        )}
                        <div className="flex items-center gap-0.5 pl-1 border-l border-gray-200 text-gray-500">
                          <button
                            type="button"
                            onClick={() => openEditModal(skill)}
                            className="p-0.5 hover:text-gray-900"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === skill.id}
                            onClick={() => skill.id && handleDelete(skill.id, skill.name)}
                            className="p-0.5 hover:text-red-600 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {catSkills.length === 0 && (
                      <span className="text-xs text-gray-400 italic py-1">
                        No skills in {cat}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white border border-gray-300 p-6 shadow-2xl space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                {editingId ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Next.js, Docker, Python"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as SkillCategory })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-gray-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Proficiency</span>
                  <span className="font-mono">{form.proficiency || 80}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={form.proficiency || 80}
                  onChange={(e) =>
                    setForm({ ...form, proficiency: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="featured-skill"
                  type="checkbox"
                  checked={form.featured || false}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="featured-skill"
                  className="text-xs text-gray-700 select-none cursor-pointer"
                >
                  Mark as primary/featured skill
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  <span>{editingId ? 'Update Skill' : 'Create Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
