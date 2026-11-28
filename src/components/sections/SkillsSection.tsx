'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Skill } from '@/types';
import Container from '@/components/ui/Container';
import { subscribeToSkills } from '@/lib/services/firestore';
import {
  resolveSkillIcon,
  getAccessibleBrandColor,
  getFallbackChipIconType,
  getCategoryIconType,
  type CategoryIconType,
} from '@/lib/utils/skillIcons';
import {
  Code2,
  Server,
  Database,
  Layout,
  BarChart3,
  Wrench,
  Layers,
  Sparkles,
  Cpu,
  Puzzle,
} from 'lucide-react';

interface SkillsSectionProps {
  skills: Skill[];
}

function CategoryIcon({ type, className = 'w-4 h-4' }: { type: CategoryIconType; className?: string }) {
  const iconProps = { className, 'aria-hidden': true as const };
  switch (type) {
    case 'Code2':
      return <Code2 {...iconProps} />;
    case 'Server':
      return <Server {...iconProps} />;
    case 'Database':
      return <Database {...iconProps} />;
    case 'Layout':
      return <Layout {...iconProps} />;
    case 'BarChart3':
      return <BarChart3 {...iconProps} />;
    case 'Wrench':
      return <Wrench {...iconProps} />;
    case 'Layers':
    default:
      return <Layers {...iconProps} />;
  }
}

export default function SkillsSection({ skills: initialSkills }: SkillsSectionProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const prefersReducedMotion = useReducedMotion();

  // Real-time synchronization with Supabase/Firestore
  useEffect(() => {
    const unsub = subscribeToSkills((latest) => {
      if (Array.isArray(latest)) {
        setSkills(latest);
      }
    });
    return () => unsub();
  }, []);

  // Compute categories and grouped skills dynamically
  const { categories, groupedSkills, totalSkillsCount } = useMemo(() => {
    const order: string[] = [];
    const grouped = new Map<string, Skill[]>();

    for (const skill of skills) {
      const rawCat = skill.category ? skill.category.trim() : '';
      if (!rawCat) continue;

      if (!grouped.has(rawCat)) {
        grouped.set(rawCat, []);
        order.push(rawCat);
      }
      grouped.get(rawCat)!.push(skill);
    }

    // Sort skills inside each category
    for (const cat of order) {
      const list = grouped.get(cat)!;
      list.sort((a, b) => {
        if (typeof a.order === 'number' && typeof b.order === 'number') {
          return a.order - b.order;
        }
        return 0;
      });
    }

    return {
      categories: order,
      groupedSkills: grouped,
      totalSkillsCount: skills.filter((s) => s.category?.trim()).length,
    };
  }, [skills]);

  // If currently selected category was deleted, fallback to 'ALL'
  useEffect(() => {
    if (selectedCategory !== 'ALL' && !categories.includes(selectedCategory)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategory('ALL');
    }
  }, [categories, selectedCategory]);

  // Visible skills based on tab
  const visibleCategories = useMemo(() => {
    if (selectedCategory === 'ALL') return categories;
    return categories.filter((c) => c === selectedCategory);
  }, [categories, selectedCategory]);

  return (
    <section
      id="skills"
      className="scroll-mt-28 py-20 sm:py-28 bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--line)] transition-colors duration-250 relative overflow-hidden"
    >
      {/* Background radial atmosphere */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#0B7658]/5 dark:bg-[#0B7658]/10 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0B7658] font-bold">
                [ 02 / EXPERTISE ]
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B7658] animate-pulse" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
              Skills & Toolkit
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-xl">
              Technical capabilities, languages, libraries, and engineering disciplines honed through production projects and coursework.
            </p>
          </div>

          {/* Real-time sync badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] text-xs font-mono text-[var(--muted)] self-start md:self-end">
            <span className="w-2 h-2 rounded-full bg-[#0B7658]" />
            <span>{totalSkillsCount} Verified Skills</span>
          </div>
        </div>

        {/* Dynamic Category Tabs */}
        <div className="mt-10">
          <div
            role="tablist"
            aria-label="Skill categories"
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none focus:outline-none"
          >
            {/* All Tab */}
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'ALL'}
              onClick={() => setSelectedCategory('ALL')}
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shrink-0 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--line)] hover:border-[var(--line-h)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Disciplines</span>
              <span
                className={`ml-1 text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                  selectedCategory === 'ALL'
                    ? 'bg-[var(--background)]/20 text-[var(--background)]'
                    : 'bg-[var(--background)] text-[var(--muted)]'
                }`}
              >
                {totalSkillsCount}
              </span>
            </button>

            {/* Individual Category Tabs */}
            {categories.map((cat) => {
              const catCount = (groupedSkills.get(cat) || []).length;
              const isSelected = selectedCategory === cat;
              const iconType = getCategoryIconType(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm'
                      : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--line)] hover:border-[var(--line-h)]'
                  }`}
                >
                  <CategoryIcon type={iconType} className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                  <span
                    className={`ml-1 text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[var(--background)]/20 text-[var(--background)]'
                        : 'bg-[var(--background)] text-[var(--muted)]'
                    }`}
                  >
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Reveal of Skills */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              {visibleCategories.map((category) => {
                const categorySkills = groupedSkills.get(category) || [];
                if (categorySkills.length === 0) return null;
                const iconType = getCategoryIconType(category);

                return (
                  <div key={category} className="space-y-4">
                    {/* Category Subhead if viewing ALL */}
                    {selectedCategory === 'ALL' && (
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]/60">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-[#0B7658]/10 text-[#0B7658] flex items-center justify-center">
                            <CategoryIcon type={iconType} className="w-3.5 h-3.5" />
                          </div>
                          <h3 className="text-sm font-bold tracking-tight text-[var(--foreground)] uppercase font-mono">
                            {category}
                          </h3>
                        </div>
                        <span className="text-xs font-mono text-[var(--muted)]">
                          {categorySkills.length} {categorySkills.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    )}

                    {/* Skill Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                      {categorySkills.map((skill, index) => {
                        const icon = resolveSkillIcon(skill.name);
                        const fallbackType = getFallbackChipIconType(category);
                        const FallbackIcon =
                          fallbackType === 'Code2' ? Code2 : fallbackType === 'Cpu' ? Cpu : Puzzle;
                        const accessibleColor = icon ? getAccessibleBrandColor(icon.hex) : '#0B7658';

                        return (
                          <motion.div
                            key={skill.id || skill.name}
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.22,
                              delay: prefersReducedMotion ? 0 : Math.min(index * 0.025, 0.25),
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="group relative flex items-center justify-between p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[#0B7658]/50 hover:shadow-xs transition-all duration-200 select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Brand / Discipline Icon */}
                              <div
                                className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--line)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200"
                                aria-hidden="true"
                              >
                                {icon ? (
                                  <svg
                                    role="img"
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4 shrink-0"
                                    style={{ fill: accessibleColor }}
                                  >
                                    <path d={icon.path} />
                                  </svg>
                                ) : (
                                  <FallbackIcon className="w-4 h-4 shrink-0 text-[#0B7658]" />
                                )}
                              </div>

                              {/* Skill Name */}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                                  {skill.name}
                                </p>
                                {selectedCategory === 'ALL' && (
                                  <p className="text-[11px] text-[var(--muted)] truncate font-mono">
                                    {category}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Real proficiency badge if stored in DB */}
                            {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                              <div
                                className="shrink-0 pl-2 text-right"
                                title={`Proficiency: ${skill.proficiency}%`}
                              >
                                <span className="text-[11px] font-mono font-medium text-[var(--muted)] group-hover:text-[#0B7658] transition-colors">
                                  {skill.proficiency}%
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {visibleCategories.length === 0 && (
                <div className="py-12 text-center text-sm text-[var(--muted)]">
                  No skills found in this category.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
