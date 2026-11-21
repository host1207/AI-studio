import { createRequire } from 'module';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(full, out);
    } else if (/\.(ts|tsx|js|jsx|css)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function sha256File(filePath: string): string {
  if (!fs.existsSync(filePath)) return '';
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function computeSrcHash(srcDir: string): string {
  const hash = crypto.createHash('sha256');
  for (const file of collectSourceFiles(srcDir)) {
    hash.update(path.relative(srcDir, file).split(path.sep).join('/'));
    hash.update('\0');
    hash.update(fs.readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

const bundlePath = path.resolve(process.cwd(), 'Angles-ultimate/public/tracker-suite.js');
const cssBundlePath = path.resolve(process.cwd(), 'Angles-ultimate/public/tracker-suite.css');
const stampPath = path.resolve(process.cwd(), 'Angles-ultimate/public/.tracker-build-stamp.json');
const srcDir = path.resolve(process.cwd(), 'src');

const currentSrcHash = computeSrcHash(srcDir);
const currentBundleHash = sha256File(bundlePath);
const hasDevRuntime = fs.existsSync(bundlePath)
  ? fs.readFileSync(bundlePath, 'utf8').includes('jsxDEV')
  : false;
let stamp: { srcHash?: string; bundleHash?: string } = {};
try {
  if (fs.existsSync(stampPath)) stamp = JSON.parse(fs.readFileSync(stampPath, 'utf8'));
} catch {
  stamp = {};
}

const needsRebuild =
  !currentBundleHash ||
  hasDevRuntime ||
  !fs.existsSync(cssBundlePath) ||
  stamp.srcHash !== currentSrcHash ||
  stamp.bundleHash !== currentBundleHash;

if (needsRebuild) {
  console.log('[Angles] Rebuilding tracker-suite.js bundle to match current src/...');
  execSync('npx vite build --config vite.tracker.config.ts --mode production', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });
  const freshBundleHash = sha256File(bundlePath);
  fs.writeFileSync(
    stampPath,
    JSON.stringify({ srcHash: currentSrcHash, bundleHash: freshBundleHash, builtAt: new Date().toISOString() }, null, 2) + '\n',
    'utf8'
  );
}

const require = createRequire(import.meta.url);
require('./Angles-ultimate/server.js');

