import { execSync } from 'child_process';

const PATTERNS = [
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g },
  { name: 'Service Account JSON', regex: /"type":\s*"service_account"/g },
  { name: 'GitHub Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}/g },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}/g },
  { name: 'Generic Secret Assignment', regex: /(?:secret|password|passwd|api_key|apikey|auth_token)\s*[:=]\s*['"][a-zA-Z0-9_\-.~]{12,}['"]/gi },
];

console.log('--- 1. Scanning Working Tree ---');
const filesOutput = execSync('git ls-files', { encoding: 'utf-8' });
const files = filesOutput.split('\n').filter(Boolean);

let findingsCount = 0;

for (const file of files) {
  try {
    const content = execSync(`git show HEAD:"${file}"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    for (const pat of PATTERNS) {
      const matches = content.match(pat.regex);
      if (matches) {
        for (const match of matches) {
          // Ignore placeholder examples in .env.example or test files
          if (file.includes('.env.example') || file.includes('verify-rules-logic') || file.includes('scan-git-history')) continue;
          console.log(`[WORKING TREE] Found ${pat.name} in ${file}: length=${match.length}`);
          findingsCount++;
        }
      }
    }
  } catch {
    // binary or unreadable
  }
}

console.log(`Working tree scan finished. Real secret findings: ${findingsCount}`);

console.log('\n--- 2. Scanning Git Commit History ---');
const logDiff = execSync('git log -p', { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });

let historyFindings = 0;
for (const pat of PATTERNS) {
  const matches = logDiff.match(pat.regex);
  if (matches) {
    const unique = [...new Set(matches)];
    for (const u of unique) {
      // Find commit
      console.log(`[GIT HISTORY] Found pattern ${pat.name} matching length ${u.length} (first 4 chars: ${u.slice(0, 4)}...)`);
      historyFindings++;
    }
  }
}

console.log(`Git history scan finished. Findings: ${historyFindings}`);
