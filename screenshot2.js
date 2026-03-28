const puppeteer = require('puppeteer');
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const VIEWPORT = { width: 1280, height: 800 };

async function shot(browser, url, filename, waitMs = 4000) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
  } catch (e) {
    console.log(`  Timeout/error for ${url}, taking screenshot anyway`);
  }
  await new Promise(r => setTimeout(r, waitMs));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), type: 'jpeg', quality: 85 });
  console.log(`  ✓ ${filename}`);
  await page.close();
}

function waitForPort(port, timeout = 30000) {
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

function killPort(port) {
  try { execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { shell: true }); } catch {}
}

function startDev(dir, port, cmd = 'npm run dev') {
  const env = { ...process.env, PORT: String(port) };
  const [bin, ...args] = cmd.split(' ');
  const proc = spawn(bin, args, { cwd: dir, env, stdio: 'ignore', detached: true });
  proc.unref();
  return proc;
}

async function run(browser, name, dir, port, file, cmd) {
  console.log(`\n→ ${name} (port ${port})`);
  killPort(port);
  let proc;
  try {
    proc = startDev(dir, port, cmd || 'npm run dev');
    await waitForPort(port, 30000);
    await shot(browser, `http://localhost:${port}`, file, 5000);
  } catch (e) {
    console.log(`  Failed: ${e.message}`);
  } finally {
    try { process.kill(-proc.pid, 'SIGKILL'); } catch {}
    killPort(port);
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  await run(browser, 'playday',   '/Users/alexgrant/development/playday/web',          3020, 'playday.jpg');
  await run(browser, 'zen-book',  '/Users/alexgrant/development/zen-book/zenbook',      3021, 'zen-book.jpg', 'npm run dev -- --port 3021');
  await run(browser, 'iEmerge',   '/Users/alexgrant/development/iEmerge/iEmerge',       3022, 'iemerge.jpg');
  await run(browser, 'real-estate','/Users/alexgrant/development/real-estate',          3023, 'real-estate.jpg');

  await browser.close();
  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
