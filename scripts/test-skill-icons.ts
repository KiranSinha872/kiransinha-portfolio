import {
  resolveSkillIcon,
  getAccessibleBrandColor,
  getCategoryIconType,
  getFallbackChipIconType,
} from '../src/lib/utils/skillIcons';

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
  // Dynamic user test cases from prompt:
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
