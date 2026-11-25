'use client';

import React, { useState, useEffect } from 'react';
import {
  getSkillsList,
  addSkill,
  updateSkill,
  deleteSkill,
  deleteSkillCategory,
} from '@/lib/services/firestore';
import { revalidatePortfolio } from '@/app/actions/revalidate';
import { useToast } from '@/components/ui/Toast';
import type { Skill, SkillCategory } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderPlus,
} from 'lucide-react';
import SkillFormModal, { CATEGORIES } from './SkillFormModal';

export default function SkillsManager() {
  const { showToast } = useToast();
  const [list, setList] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [deletedCategories, setDeletedCategories] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storedDeleted = localStorage.getItem('admin_deleted_skill_categories');
      return storedDeleted ? JSON.parse(storedDeleted) : [];
    } catch {
      return [];
    }
  });
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storedCustom = localStorage.getItem('admin_custom_skill_categories');
      return storedCustom ? JSON.parse(storedCustom) : [];
    } catch {
      return [];
    }
  });

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

  // Compute active categories dynamically
  const dbCategories = Array.from(
    new Set(list.map((s) => s.category?.trim()).filter(Boolean) as string[])
  );
  const allKnownCategories = Array.from(
    new Set([...CATEGORIES, ...customCategories, ...dbCategories])
  );
  const activeCategories = allKnownCategories.filter(
    (cat) => !deletedCategories.includes(cat)
  );

  const openAddModal = (defaultCategory?: SkillCategory) => {
    setEditingId(null);
    setForm({
      name: '',
      category: defaultCategory || activeCategories[0] || 'Programming',
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

  const handleAddCategory = () => {
    const name = window.prompt('Enter new category name (e.g. Cloud, Mobile, DevOps):');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();

    // If it was previously marked as deleted, remove it from deletedCategories
    setDeletedCategories((prev) => {
      const next = prev.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());
      try {
        localStorage.setItem('admin_deleted_skill_categories', JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return next;
    });

    setCustomCategories((prev) => {
      const next = Array.from(new Set([...prev, trimmed]));
      try {
        localStorage.setItem('admin_custom_skill_categories', JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return next;
    });

    showToast('success', `Category "${trimmed}" added.`);
  };

  const handleDeleteCategory = async (cat: string, count: number) => {
    if (deletingCategory) return;
    const msg =
      count > 0
        ? `Are you sure you want to delete the entire "${cat}" category and all ${count} skill${count === 1 ? '' : 's'} inside it? This cannot be undone.`
        : `Are you sure you want to delete the "${cat}" category?`;

    if (!window.confirm(msg)) return;

    setDeletingCategory(cat);
    try {
      await deleteSkillCategory(cat);

      // Record as deleted category
      setDeletedCategories((prev) => {
        const next = Array.from(new Set([...prev, cat]));
        try {
          localStorage.setItem('admin_deleted_skill_categories', JSON.stringify(next));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
        return next;
      });

      // Remove from custom list if tracked
      setCustomCategories((prev) => {
        const next = prev.filter((c) => c !== cat);
        try {
          localStorage.setItem('admin_custom_skill_categories', JSON.stringify(next));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
        return next;
      });

      // Immediately remove all skills under this category from local UI state
      setList((prev) => prev.filter((s) => (s.category || 'Other') !== cat));

      // Invalidate portfolio cache
      try {
        await revalidatePortfolio();
      } catch (revalErr) {
        console.warn('Revalidation warning:', revalErr);
      }

      showToast('success', `Deleted "${cat}" category and associated skills.`);
    } catch (err) {
      console.error('Delete category error:', err);
      showToast('error', `Failed to delete category "${cat}".`);
    } finally {
      setDeletingCategory(null);
    }
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
        showToast('success', `Updated "${form.name}"!`);
      } else {
        await addSkill(form);
        showToast('success', `Added "${form.name}" to skills!`);
      }

      // Ensure this category is not marked as deleted
      if (form.category) {
        setDeletedCategories((prev) => {
          const next = prev.filter((c) => c !== form.category);
          try {
            localStorage.setItem('admin_deleted_skill_categories', JSON.stringify(next));
          } catch (e) {
            console.warn('LocalStorage error:', e);
          }
          return next;
        });
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
          <button
            type="button"
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : activeCategories.length === 0 ? (
        <div className="p-8 border border-gray-200 rounded text-center text-gray-500 text-xs space-y-2">
          <p>No skill categories available.</p>
          <button
            type="button"
            onClick={handleAddCategory}
            className="text-xs text-gray-900 underline font-medium"
          >
            Add a category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCategories.map((cat) => {
            const catSkills = list.filter((s) => (s.category || 'Other') === cat);

            return (
              <div
                key={cat}
                className="p-4 border border-gray-200 rounded bg-white space-y-3 flex flex-col justify-between shadow-xs hover:border-gray-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-gray-900">{cat}</h3>
                      <span className="text-[11px] text-gray-500 font-mono">
                        ({catSkills.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAddModal(cat)}
                        className="text-xs text-gray-700 hover:text-gray-900 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                      <button
                        type="button"
                        disabled={deletingCategory === cat}
                        onClick={() => handleDeleteCategory(cat, catSkills.length)}
                        className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 disabled:opacity-50"
                        title={`Delete ${cat} category and all its skills`}
                      >
                        {deletingCategory === cat ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>Delete Category</span>
                      </button>
                    </div>
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
      <SkillFormModal
        isOpen={modalOpen}
        editingId={editingId}
        form={form}
        submitting={submitting}
        categories={activeCategories}
        onClose={() => setModalOpen(false)}
        onChange={setForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
