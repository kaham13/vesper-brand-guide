import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
const fail = message => failures.push(message);
const skip = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.vercel']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !skip.has(entry.name)) walk(full);
    else if (entry.isFile()) files.push(full);
    else if (entry.isSymbolicLink()) fail(`Symlink requires review: ${path.relative(root, full)}`);
  }
}
walk(root);
function checkReference(ref, owner, ids) {
  if (!ref || /^(?:https?:|data:|mailto:|tel:)/i.test(ref)) return;
  if (/^(?:[a-z]:|file:|\/|\\)/i.test(ref)) {
    fail(`Absolute or unsupported local path in ${owner}: ${ref}`);
    return;
  }
  const [filePart, fragment] = ref.split('#');
  if (!filePart) {
    if (fragment && !ids.has(fragment)) fail(`Missing fragment in ${owner}: ${fragment}`);
    return;
  }
  const target = path.resolve(path.dirname(path.join(root, owner)), decodeURIComponent(filePart.split('?')[0]));
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return fail(`Path escapes project: ${owner}`);
  let current = root;
  for (const segment of relative.split(path.sep)) {
    if (!fs.readdirSync(current).includes(segment)) return fail(`Missing file or case mismatch in ${owner}: ${ref}`);
    current = path.join(current, segment);
  }
  if (!fs.statSync(current).isFile()) fail(`Reference is not a file in ${owner}: ${ref}`);
}
let inlineScripts = 0;
for (const file of files.filter(f => /\.(html|svg|css)$/.test(f))) {
  const owner = path.relative(root, file);
  const source = fs.readFileSync(file, 'utf8');
  const idList = [...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
  const ids = new Set(idList);
  if (ids.size !== idList.length) fail(`Duplicate id in ${owner}`);
  for (const match of source.matchAll(/\b(?:src|href|xlink:href)\s*=\s*["']([^"']+)["']/g)) checkReference(match[1], owner, ids);
  for (const match of source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) checkReference(match[1], owner, ids);
  for (const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { new vm.Script(match[1], { filename: owner }); inlineScripts++; }
    catch { fail(`Inline JavaScript syntax error: ${owner}`); }
  }
}
const credentialPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{30,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\b(?:api[_-]?key|access[_-]?token|password|client[_-]?secret)\s*[:=]\s*["'][^"'\s]{8,}["']/i,
];
for (const file of files) {
  const owner = path.relative(root, file);
  if (/^\.env(?:\.|$)/.test(path.basename(file))) fail(`Environment file requires private review: ${owner}`);
  const source = fs.readFileSync(file, 'utf8');
  if (credentialPatterns.some(pattern => pattern.test(source))) fail(`Possible credential in ${owner}; inspect privately.`);
  if (/\.(?:html|css|svg|json|md|mjs)$/.test(file) && /(?:\/Users\/|file:\/\/|[A-Za-z]:\\Users\\)/.test(source)) fail(`Machine-specific path in ${owner}`);
}
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
if (config.framework !== null || config.buildCommand !== '' || config.installCommand !== '' || config.outputDirectory !== '.') fail('Unexpected static Vercel configuration');
if (!fs.existsSync(path.join(root, 'index.html'))) fail('Root index.html is missing');
if (fs.existsSync(path.join(root, 'public'))) fail('Unexpected public folder; review deployment root');
for (const pattern of ['node_modules/', 'dist/', '.env', '.env.*']) {
  if (!fs.readFileSync(path.join(root, '.gitignore'), 'utf8').split('\n').includes(pattern)) fail(`Missing Git exclusion: ${pattern}`);
}
if (failures.length) {
  for (const message of failures) console.error(`FAIL: ${message}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${files.length} project files; relative paths and exact filename case; anchors and SVG references; ${inlineScripts} inline script; static Vercel configuration; Git exclusions; no known credential patterns detected.`);
  console.log('No compilation or dependency installation is required.');
}
