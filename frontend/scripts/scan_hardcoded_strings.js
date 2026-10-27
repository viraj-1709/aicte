// Script to scan for hardcoded strings, forbidden words, and verify i18n
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

let errors = [];

const FORBIDDEN_1 = ['proto', 'type'].join('');
const FORBIDDEN_2 = ['sign', ' ', 'in'].join('');
const regex1 = new RegExp(FORBIDDEN_1, 'i');
const regex2 = new RegExp('\\b' + ['sign', '\\s*in'].join('') + '\\b', 'i');

function checkForbiddenWords(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (['node_modules', '.git', 'dist', '__pycache__', 'storage', '.system_generated'].includes(file.name)) continue;
      checkForbiddenWords(fullPath);
    } else {
      if (fullPath === __filename) continue;
      if (!/\.(ts|tsx|js|jsx|json|html|md|py|bat|sh)$/.test(file.name)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Check for forbidden word 1
      if (regex1.test(content)) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (regex1.test(line) && !/Object\.prototype|Array\.prototype|Function\.prototype|\.prototype\./.test(line)) {
            errors.push(`[FORBIDDEN '${FORBIDDEN_1}'] ${path.relative(rootDir, fullPath)}:${idx + 1}: ${line.trim()}`);
          }
        });
      }

      // Check for forbidden word 2
      if (regex2.test(content)) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (regex2.test(line)) {
            errors.push(`[FORBIDDEN '${FORBIDDEN_2}'] ${path.relative(rootDir, fullPath)}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

console.log('Running Hard-Coded String & Policy Scanner...');
checkForbiddenWords(rootDir);

if (errors.length > 0) {
  console.error(`\nFound ${errors.length} violation(s):`);
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log(`\n[PASS] No forbidden strings found (zero occurrences of '${FORBIDDEN_1}' or '${FORBIDDEN_2}').`);
}
