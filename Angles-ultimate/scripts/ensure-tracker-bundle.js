const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ANGLES_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(ANGLES_DIR, '..');
const PUBLIC_DIR = path.join(ANGLES_DIR, 'public');
const BUNDLE_JS = path.join(PUBLIC_DIR, 'tracker-suite.js');
const BUNDLE_CSS = path.join(PUBLIC_DIR, 'tracker-suite.css');
const STAMP_PATH = path.join(PUBLIC_DIR, '.tracker-build-stamp.json');
const SRC_DIR = path.join(REPO_ROOT, 'src');
const ROOT_PKG = path.join(REPO_ROOT, 'package.json');
const TRACKER_VITE_CFG = path.join(REPO_ROOT, 'vite.tracker.config.ts');

function collectSourceFiles(dir, out = []) {
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

function sha256File(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function computeSrcHash(srcDir) {
  const hash = crypto.createHash('sha256');
  for (const file of collectSourceFiles(srcDir)) {
    hash.update(path.relative(srcDir, file).split(path.sep).join('/'));
    hash.update('\0');
    hash.update(fs.readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function isBundleHealthy() {
  if (!fs.existsSync(BUNDLE_JS) || !fs.existsSync(BUNDLE_CSS)) {
    return { ok: false, reason: 'missing tracker-suite.js or tracker-suite.css' };
  }
  const jsContent = fs.readFileSync(BUNDLE_JS, 'utf8');
  const cssSize = fs.statSync(BUNDLE_CSS).size;
  if (jsContent.length < 10000 || cssSize < 500) {
    return { ok: false, reason: 'tracker-suite bundle appears incomplete or truncated' };
  }
  if (jsContent.includes('jsxDEV')) {
    return { ok: false, reason: 'tracker-suite.js contains development jsxDEV runtime calls' };
  }
  return { ok: true, reason: 'healthy' };
}

function main() {
  const health = isBundleHealthy();
  const hasRootSources = fs.existsSync(SRC_DIR) && fs.existsSync(ROOT_PKG) && fs.existsSync(TRACKER_VITE_CFG);

  let needsRebuild = !health.ok;
  let reason = health.reason;
  let currentSrcHash = '';

  if (hasRootSources) {
    currentSrcHash = computeSrcHash(SRC_DIR);
    if (!needsRebuild) {
      const currentBundleHash = sha256File(BUNDLE_JS);
      let stamp = {};
      try {
        if (fs.existsSync(STAMP_PATH)) {
          stamp = JSON.parse(fs.readFileSync(STAMP_PATH, 'utf8'));
        }
      } catch {
        stamp = {};
      }
      if (stamp.srcHash && stamp.srcHash !== currentSrcHash) {
        needsRebuild = true;
        reason = 'src/ files changed since last tracker-suite.js build';
      } else if (stamp.bundleHash && stamp.bundleHash !== currentBundleHash) {
        needsRebuild = true;
        reason = 'tracker-suite.js hash differs from build stamp';
      }
    }
  }

  if (!needsRebuild) {
    console.log('[Angles] Pages 08-10 bundle verified (public/tracker-suite.js ready).');
    return;
  }

  console.log(`[Angles] Pages 08-10 bundle requires build (${reason}).`);

  if (!hasRootSources) {
    console.error('[Angles] ERROR: public/tracker-suite.js is missing or invalid, and root ../src/ sources were not found.');
    console.error('[Angles] Please pull the full repository (including src/ and Angles-ultimate/public/tracker-suite.js).');
    process.exit(1);
  }

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const vitePkg = path.join(REPO_ROOT, 'node_modules', 'vite', 'package.json');
  if (!fs.existsSync(vitePkg)) {
    console.log('[Angles] Installing root build dependencies for Pages 08-10 (first time only)...');
    execSync(`${npmCmd} install --no-audit --no-fund`, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: { ...process.env }
    });
  }

  console.log('[Angles] Building production bundle for Pages 08-10 (Tracker, Exam Info, Registry)...');
  execSync(`${npmCmd} run build:tracker`, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  const postCheck = isBundleHealthy();
  if (!postCheck.ok) {
    console.error(`[Angles] ERROR: Built bundle failed verification (${postCheck.reason}).`);
    process.exit(1);
  }

  const freshBundleHash = sha256File(BUNDLE_JS);
  fs.writeFileSync(
    STAMP_PATH,
    JSON.stringify(
      {
        srcHash: currentSrcHash,
        bundleHash: freshBundleHash,
        builtAt: new Date().toISOString()
      },
      null,
      2
    ) + '\n',
    'utf8'
  );
  console.log('[Angles] Pages 08-10 bundle built and verified successfully.');
}

try {
  main();
} catch (error) {
  console.error('[Angles] Failed to verify or build Pages 08-10 bundle:', error && error.message ? error.message : error);
  process.exit(1);
}
