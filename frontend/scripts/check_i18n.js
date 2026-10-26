// Verification script to ensure 100% key coverage across all 8 languages
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/locales');

const languages = ['en', 'hi', 'ta', 'te', 'mr', 'gu', 'bn', 'ur'];

function extractKeysFromTsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  
  // Match key patterns like keyName: "..." or keyName: {
  const lines = content.split('\n');
  let currentNamespace = '';

  for (let line of lines) {
    line = line.trim();
    // Match namespace (e.g. auth: { or header: {)
    const nsMatch = line.match(/^([a-zA-Z0-9_]+)\s*:\s*\{/);
    if (nsMatch) {
      currentNamespace = nsMatch[1];
      continue;
    }
    if (line === '},' || line === '}') {
      currentNamespace = '';
      continue;
    }
    // Match property keys
    const propMatch = line.match(/^([a-zA-Z0-9_]+)\s*:\s*["`]/);
    if (propMatch) {
      const fullKey = currentNamespace ? `${currentNamespace}.${propMatch[1]}` : propMatch[1];
      keys.add(fullKey);
    }
  }

  return keys;
}

const enPath = path.join(localesDir, 'en.ts');
const baseKeys = Array.from(extractKeysFromTsFile(enPath));
console.log(`Base English keys catalog: ${baseKeys.length} statutory UI keys.\n`);

let allPassed = true;

for (const lang of languages) {
  const langPath = path.join(localesDir, `${lang}.ts`);
  if (!fs.existsSync(langPath)) {
    console.error(`[FAIL] Missing translation file for ${lang}.ts`);
    allPassed = false;
    continue;
  }

  const langKeys = extractKeysFromTsFile(langPath);
  const missing = baseKeys.filter(k => !langKeys.has(k));

  if (missing.length > 0) {
    console.error(`[FAIL] Language '${lang}' is missing ${missing.length} keys:`, missing.slice(0, 5));
    allPassed = false;
  } else {
    console.log(`[PASS] Language '${lang}' has 100% complete key coverage (${baseKeys.length}/${baseKeys.length})`);
  }
}

if (!allPassed) {
  console.error('\nI18N Coverage check failed: missing translation keys detected.');
  process.exit(1);
} else {
  console.log('\nAll 8 official languages verified with 100% key coverage.');
}
