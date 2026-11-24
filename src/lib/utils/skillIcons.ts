import * as simpleIcons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

export interface ResolvedSkillIcon {
  title: string;
  hex: string;
  path: string;
}

/**
 * Normalizes a skill name by:
 * - lowercase & trim
 * - replacing '+' with 'plus', '#' with 'sharp', '&' with 'and'
 * - removing whitespace, dots, dashes, underscores, and parentheses
 */
export function normalizeSkillName(name: string): string {
  let s = (name || '').toLowerCase().trim();
  s = s.replace(/\+/g, 'plus').replace(/#/g, 'sharp').replace(/&/g, 'and');
  s = s.replace(/[\s.\-_()]/g, '');
  return s;
}

/**
 * Explicit aliases map for names that deviate from simple-icons slugs
 */
export const SKILL_ALIASES: Record<string, string> = {
  'c++': 'cplusplus',
  'cplusplus': 'cplusplus',
  'c#': 'csharp',
  'csharp': 'csharp',
  'node.js': 'nodedotjs',
  'nodejs': 'nodedotjs',
  'nodedotjs': 'nodedotjs',
  'express': 'express',
  'express.js': 'express',
  'expressjs': 'express',
  'html': 'html5',
  'html5': 'html5',
  'css': 'css',
  'css3': 'css',
  'js': 'javascript',
  'javascript': 'javascript',
  'javascript (es6+)': 'javascript',
  'ts': 'typescript',
  'typescript': 'typescript',
  'next.js': 'nextdotjs',
  'nextjs': 'nextdotjs',
  'nextdotjs': 'nextdotjs',
  'react': 'react',
  'react.js': 'react',
  'reactjs': 'react',
  'vue': 'vuedotjs',
  'vue.js': 'vuedotjs',
  'vuejs': 'vuedotjs',
  'vuedotjs': 'vuedotjs',
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'tailwind': 'tailwindcss',
  'tailwind css': 'tailwindcss',
  'tailwindcss': 'tailwindcss',
  'vs code': 'visualstudiocode',
  'vscode': 'visualstudiocode',
  'visualstudiocode': 'visualstudiocode',
  'scikit-learn': 'scikitlearn',
  'scikitlearn': 'scikitlearn',
  'sklearn': 'scikitlearn',
  'tensorflow': 'tensorflow',
  'pytorch': 'pytorch',
  'opencv': 'opencv',
  'aws': 'amazonwebservices',
  'amazonwebservices': 'amazonwebservices',
  'gcp': 'googlecloud',
  'googlecloud': 'googlecloud',
  'k8s': 'kubernetes',
  'kubernetes': 'kubernetes',
  'git': 'git',
  'github': 'github',
  'git & github': 'github',
  'git and github': 'github',
  'firestore & firebase': 'firebase',
  'firebase': 'firebase',
  'firestore': 'firebase',
  'postman': 'postman',
  'vs code & postman': 'postman',
  'docker': 'docker',
  'python': 'python',
};

// Lazy-initialized index map from slug & title to SimpleIcon
let iconMap: Map<string, SimpleIcon> | null = null;

function getIconMap(): Map<string, SimpleIcon> {
  if (iconMap) return iconMap;
  iconMap = new Map<string, SimpleIcon>();

  for (const val of Object.values(simpleIcons)) {
    if (val && typeof val === 'object' && 'slug' in val && 'path' in val) {
      const icon = val as SimpleIcon;
      // Index by slug and normalized variants
      iconMap.set(icon.slug, icon);
      iconMap.set(icon.slug.toLowerCase(), icon);
      iconMap.set(normalizeSkillName(icon.slug), icon);
      if (icon.title) {
        iconMap.set(icon.title.toLowerCase(), icon);
        iconMap.set(normalizeSkillName(icon.title), icon);
      }
    }
  }

  return iconMap;
}

/**
 * Resolves a skill name to an accessible simple-icons object with SVG path and hex color.
 * Returns null if not found.
 */
export function resolveSkillIcon(name: string): ResolvedSkillIcon | null {
  if (!name || typeof name !== 'string') return null;

  const rawLower = name.toLowerCase().trim();
  const normalized = normalizeSkillName(name);

  // 1. Check ALIAS map first
  const aliasTarget = SKILL_ALIASES[rawLower] || SKILL_ALIASES[normalized];
  const targetSlug = aliasTarget || normalized;

  // 2. Look up in simple-icons
  const map = getIconMap();
  const matched =
    map.get(targetSlug) ||
    map.get(normalizeSkillName(targetSlug)) ||
    map.get(normalized) ||
    map.get(rawLower);

  if (!matched || !matched.path) {
    return null;
  }

  return {
    title: matched.title || name,
    hex: matched.hex || '111111',
    path: matched.path,
  };
}

/**
 * Computes contrast ratio against white (#FFFFFF).
 * If contrast ratio is below 3:1 (e.g. pale yellow or light cyan),
 * returns #111 for accessibility on light cards/chips.
 */
export function getAccessibleBrandColor(hex: string): string {
  if (!hex) return '#111111';
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return '#111111';

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  const contrastOnWhite = (1.0 + 0.05) / (L + 0.05);

  if (contrastOnWhite < 3.0) {
    return '#111111';
  }

  return `#${clean}`;
}

export type CategoryIconType =
  | 'Code2'
  | 'Server'
  | 'Database'
  | 'Layout'
  | 'BarChart3'
  | 'Wrench'
  | 'Layers';

/**
 * Automatic category header icon selector using keyword mapping with 'Layers' fallback
 */
export function getCategoryIconType(category: string): CategoryIconType {
  const c = (category || '').toLowerCase().trim();
  if (c.includes('program') || c.includes('language') || c.includes('code')) {
    return 'Code2';
  }
  if (c.includes('backend') || c.includes('server') || c.includes('api')) {
    return 'Server';
  }
  if (
    c.includes('database') ||
    c.includes('storage') ||
    c.includes('sql') ||
    c.includes('store')
  ) {
    return 'Database';
  }
  if (
    c.includes('frontend') ||
    c.includes('ui') ||
    c.includes('web') ||
    c.includes('client') ||
    c.includes('design')
  ) {
    return 'Layout';
  }
  if (
    c.includes('data') ||
    c.includes('ml') ||
    c.includes('ai') ||
    c.includes('analytics') ||
    c.includes('intelligence')
  ) {
    return 'BarChart3';
  }
  if (
    c.includes('tool') ||
    c.includes('devops') ||
    c.includes('cloud') ||
    c.includes('infra') ||
    c.includes('ci/cd')
  ) {
    return 'Wrench';
  }
  return 'Layers';
}

export type FallbackChipIconType = 'Code2' | 'Cpu' | 'Puzzle';

/**
 * Determines fallback Lucide icon for skill chips when no brand logo is matched
 */
export function getFallbackChipIconType(category: string): FallbackChipIconType {
  const c = (category || '').toLowerCase().trim();
  if (c.includes('program') || c.includes('language') || c.includes('code')) {
    return 'Code2';
  }
  if (
    c.includes('ai') ||
    c.includes('ml') ||
    c.includes('data') ||
    c.includes('infra') ||
    c.includes('system')
  ) {
    return 'Cpu';
  }
  return 'Puzzle';
}
