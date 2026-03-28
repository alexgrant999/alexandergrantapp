const puppeteer = require('puppeteer');
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const VIEWPORT = { width: 1280, height: 800 };

async function shot(browser, url, filename, waitMs = 3000) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
  } catch (e) {
    console.log(`  Timeout/error for ${url}, taking screenshot anyway`);
  }
  await new Promise(r => setTimeout(r, waitMs));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), type: 'jpeg', quality: 85 });
  console.log(`  ✓ ${filename}`);
  await page.close();
}

function waitForPort(port, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      try {
        execSync(`lsof -i :${port} -sTCP:LISTEN -t 2>/dev/null`, { stdio: 'pipe' });
        resolve();
      } catch {
        if (Date.now() - start > timeout) reject(new Error(`Port ${port} never opened`));
        else setTimeout(check, 500);
      }
    };
    check();
  });
}

function startDev(dir, port, cmd = 'npm run dev') {
  const env = { ...process.env, PORT: String(port), NEXT_PUBLIC_PORT: String(port) };
  const [bin, ...args] = cmd.split(' ');
  const proc = spawn(bin, args, { cwd: dir, env, stdio: 'ignore', detached: true });
  proc.unref();
  return proc;
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });

  // ── 1. Live sites ──────────────────────────────────────────────
  console.log('\n[Live sites]');
  await shot(browser, 'https://findyoga.com.au', 'findyoga-au.jpg', 4000);

  // ── 2. Local projects (start dev server, screenshot, kill) ──────
  const localProjects = [
    { name: 'findyoga-nextjs',    dir: '/Users/alexgrant/development/findyoga-nextjs',    port: 3010, file: 'findyoga-nextjs.jpg' },
    { name: 'BaliSpirit',         dir: '/Users/alexgrant/development/BaliSpirit',          port: 3011, file: 'balispirit.jpg', cmd: 'npm run dev -- --port 3011' },
    { name: 'playday',            dir: '/Users/alexgrant/development/playday',             port: 3012, file: 'playday.jpg' },
    { name: 'vibro-acoustic-app', dir: '/Users/alexgrant/development/vibro-acoustic-app', port: 3013, file: 'vibro-acoustic.jpg' },
    { name: 'tcm-study',          dir: '/Users/alexgrant/development/tcm-study',           port: 3014, file: 'tcm-study.jpg' },
    { name: 'zen-book',           dir: '/Users/alexgrant/development/zen-book',            port: 3015, file: 'zen-book.jpg', cmd: 'npm run dev -- --port 3015' },
    { name: 'real-estate',        dir: '/Users/alexgrant/development/real-estate',         port: 3016, file: 'real-estate.jpg' },
    { name: 'iEmerge',            dir: '/Users/alexgrant/development/iEmerge',             port: 3017, file: 'iemerge.jpg' },
  ];

  console.log('\n[Local projects]');
  for (const p of localProjects) {
    console.log(`\n→ ${p.name} (port ${p.port})`);
    let proc;
    try {
      // Check if node_modules exists, skip if not installed
      if (!fs.existsSync(path.join(p.dir, 'node_modules'))) {
        console.log(`  Skipping — node_modules not found`);
        continue;
      }
      proc = startDev(p.dir, p.port, p.cmd);
      await waitForPort(p.port, 25000);
      await shot(browser, `http://localhost:${p.port}`, p.file, 4000);
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
    } finally {
      if (proc) {
        try { process.kill(-proc.pid, 'SIGKILL'); } catch {}
        // Also kill by port
        try { execSync(`lsof -ti:${p.port} | xargs kill -9 2>/dev/null || true`, { shell: true }); } catch {}
      }
    }
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to ./screenshots/');
}

main().catch(e => { console.error(e); process.exit(1); });
