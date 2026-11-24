import * as simpleIcons from 'simple-icons';

export function normalizeSkillName(name) {
  let s = (name || '').toLowerCase().trim();
  s = s.replace(/\+/g, 'plus').replace(/#/g, 'sharp').replace(/&/g, 'and');
  s = s.replace(/[\s.\-_()]/g, '');
  return s;
}

export const SKILL_ALIASES = {
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

let iconMap = null;
function getIconMap() {
  if (iconMap) return iconMap;
  iconMap = new Map();
  for (const val of Object.values(simpleIcons)) {
    if (val && typeof val === 'object' && 'slug' in val && 'path' in val) {
      iconMap.set(val.slug, val);
      iconMap.set(val.slug.toLowerCase(), val);
      iconMap.set(normalizeSkillName(val.slug), val);
      if (val.title) {
        iconMap.set(val.title.toLowerCase(), val);
        iconMap.set(normalizeSkillName(val.title), val);
      }
    }
  }
  return iconMap;
}

export function resolveSkillIcon(name) {
  if (!name || typeof name !== 'string') return null;
  const rawLower = name.toLowerCase().trim();
  const normalized = normalizeSkillName(name);

  const aliasTarget = SKILL_ALIASES[rawLower] || SKILL_ALIASES[normalized];
  const targetSlug = aliasTarget || normalized;

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

export function getAccessibleBrandColor(hex) {
  if (!hex) return '#111111';
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return '#111111';

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const toLinear = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  const contrastOnWhite = (1.0 + 0.05) / (L + 0.05);

  if (contrastOnWhite < 3.0) {
    return '#111111';
  }

  return `#${clean}`;
}

export function getCategoryIconType(category) {
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

export function getFallbackChipIconType(category) {
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

const DEFAULT_SKILLS = [
  { name: 'TypeScript', category: 'Programming' },
  { name: 'JavaScript (ES6+)', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'C++', category: 'Programming' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'React', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'REST & GraphQL APIs', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Firestore & Firebase', category: 'Database' },
  { name: 'Git & GitHub', category: 'Tools' },
  { name: 'Docker', category: 'Tools' },
  { name: 'VS Code & Postman', category: 'Tools' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Foobar Engine', category: 'DevOps' },
];

console.log('====================================================');
console.log('       SKILL LOGO RESOLUTION VERIFICATION REPORT   ');
console.log('====================================================\n');

let matchedCount = 0;
let fallbackCount = 0;

for (const skill of DEFAULT_SKILLS) {
  const icon = resolveSkillIcon(skill.name);
  const catIcon = getCategoryIconType(skill.category);

  if (icon) {
    matchedCount++;
    const accessibleHex = getAccessibleBrandColor(icon.hex);
    const adjusted = accessibleHex.toLowerCase() !== `#${icon.hex.toLowerCase()}`;
    console.log(
      `✓ [MATCH] "${skill.name}" (${skill.category})` +
        `\n   → Logo: ${icon.title}` +
        `\n   → Brand Hex: #${icon.hex} (Applied: ${accessibleHex}${adjusted ? ' [adjusted for 3:1 contrast]' : ''})` +
        `\n   → Category Icon: <${catIcon} />`
    );
  } else {
    fallbackCount++;
    const fallbackIcon = getFallbackChipIconType(skill.category);
    console.log(
      `○ [FALLBACK] "${skill.name}" (${skill.category})` +
        `\n   → No brand SVG match; using Lucide fallback: <${fallbackIcon} />` +
        `\n   → Category Icon: <${catIcon} />`
    );
  }
  console.log('----------------------------------------------------');
}

console.log(`\nSUMMARY: ${matchedCount} Matched, ${fallbackCount} Fallbacks.`);
console.log('====================================================');
