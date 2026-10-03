import Eleventy from '@11ty/eleventy';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, readdir, mkdir, rm, mkdtemp, rename, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const manifest = '.generated-files.json';
const lock = '.produce-lock';
const check = process.argv.includes('--check');
const watching = process.argv.includes('--watch');
const valid = name => /^[a-z0-9][a-z0-9-]*\.(html|css|js)$/.test(name);
async function exists(file) { try { return await lstat(file); } catch (e) { if(e.code === 'ENOENT') return null; throw e; } }
async function produce() {
  await mkdir(lock).catch(() => { throw new Error('produce läuft bereits. Bei einem abgebrochenen Prozess .produce-lock erst nach Prüfung entfernen.'); });
  let temp;
  try {
    temp = await mkdtemp(path.join(tmpdir(), 'wwe-produce-'));
    const old = JSON.parse(await readFile(manifest, 'utf8'));
    if (!Array.isArray(old) || old.some(name => !valid(name))) throw new Error('Ungültiges Ausgabemanifest');
    const elev = new Eleventy('src', temp, { configPath: 'eleventy.config.js', quietMode: true });
    await elev.write();
    const names = (await readdir(temp)).sort();
    if (!names.includes('index.html') || names.some(name => !valid(name))) throw new Error('Unerwartete Ausgabe; Root bleibt unverändert');
    const output = new Map();
    for (const name of names) {
      const dest = await exists(name);
      if (dest && (!old.includes(name) || dest.isSymbolicLink() || !dest.isFile())) throw new Error(`Geschützte Zieldatei: ${name}`);
      output.set(name, await readFile(path.join(temp, name)));
    }
    // Check all local page dependencies before touching the published files.
    for (const [name, bytes] of output) {
      const text = bytes.toString();
      const refs = name.endsWith('.html') ? [...text.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]) : name.endsWith('.css') ? [...text.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)].map(m => m[1]) : [];
      for (const ref of refs) {
        if (/^(?:[a-z]+:|#|\/\/)/i.test(ref)) continue;
        const file = ref.split(/[?#]/)[0].replace(/^\//, '') || 'index.html';
        if (!output.has(file) && !((file.startsWith('assets/') || file.startsWith('images/')) && !file.includes('..') && (await exists(file))?.isFile())) throw new Error(`${name}: fehlende lokale Ressource ${ref}`);
      }
    }
    const stale = old.filter(name => !names.includes(name));
    const changed = [];
    for (const [name, bytes] of output) if (!(await exists(name)) || !(await readFile(name)).equals(bytes)) changed.push(name);
    const manifestText = JSON.stringify(names, null, 2) + '\n';
    const manifestChanged = (await readFile(manifest, 'utf8')) !== manifestText;
    if(check) {
      if(changed.length || stale.length || manifestChanged) throw new Error(`Ausgabe veraltet: ${[...changed,...stale].join(', ')}. npm run produce ausführen.`);
      console.log('Quellen und Root-Ausgabe sind synchron.');
      return;
    }
    // Stage on the same filesystem; rename each completed file, never truncate in place.
    for (const name of changed) await writeFile(path.join(lock, name), output.get(name));
    for (const name of changed) await rename(path.join(lock, name), name);
    for (const name of stale) await rm(name, { force: true });
    await writeFile(path.join(lock, 'manifest'), manifestText);
    await rename(path.join(lock, 'manifest'), manifest);
    console.log(`produce: ${changed.length} Dateien aktualisiert, ${stale.length} entfernt. Vorschau: http://localhost:4000`);
  } finally {
    if(temp) await rm(temp, { recursive: true, force: true });
    await rm(lock, { recursive: true, force: true });
  }
}
try {
  await produce();
  if(watching) {
    console.log('Beobachte src/ und eleventy.config.js. Vorschau separat: python3 scripts/serve.py');
    let timer, running = false, pending = false;
    async function rebuild() {
      if(running) { pending = true; return; }
      running = true;
      do { pending = false; try { const result = await promisify(execFile)(process.execPath, ['scripts/produce.mjs']); console.log(result.stdout.trim()); } catch(e) { console.error(e.stderr || e.message); } } while(pending);
      running = false;
    }
    const schedule = () => { clearTimeout(timer); timer = setTimeout(rebuild, 150); };
    async function fingerprint(dir) {
      const hash = createHash('sha256');
      async function visit(folder) {
        for(const entry of (await readdir(folder, {withFileTypes: true})).sort((a,b) => a.name.localeCompare(b.name))) {
          const name = path.join(folder, entry.name);
          if(entry.isDirectory()) await visit(name);
          else if(entry.isFile()) hash.update(name).update(await readFile(name));
        }
      }
      await visit(dir);
      hash.update(await readFile('eleventy.config.js'));
      return hash.digest('hex');
    }
    let previous = await fingerprint('src'), scanning = false;
    setInterval(async () => {
      if(scanning) return;
      scanning = true;
      try { const current = await fingerprint('src'); if(current !== previous) { previous = current; schedule(); } }
      catch(e) { console.error(e.message); }
      finally { scanning = false; }
    }, 750);
  }
} catch(e) { console.error(e.message); process.exitCode = 1; }
