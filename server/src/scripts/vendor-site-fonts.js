import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../../../Zeta-Jersey-Store/public/fonts/', import.meta.url);
await mkdir(root, { recursive: true });
const url = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Barlow+Condensed:wght@900&display=swap';
const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' } });
if (!response.ok) throw new Error(`Font stylesheet failed: ${response.status}`);
let css = await response.text();
if (!css.includes("format('woff2')")) throw new Error('Expected compressed WOFF2 fonts.');
const sources = [...new Set([...css.matchAll(/https:\/\/fonts\.gstatic\.com\/[^)\s]+/g)].map(([source]) => source))];
for (const source of sources) {
  const file = `${createHash('sha256').update(source).digest('hex').slice(0, 16)}.woff2`;
  const font = await fetch(source);
  if (!font.ok) throw new Error(`Font download failed: ${font.status}`);
  await writeFile(new URL(file, root), Buffer.from(await font.arrayBuffer()));
  css = css.replaceAll(source, `/fonts/${file}`);
}
await writeFile(new URL('fonts.css', root), css);
for (const family of ['poppins', 'barlowcondensed']) {
  const license = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);
  if (!license.ok) throw new Error(`Font license download failed: ${license.status}`);
  await writeFile(new URL(`${family}-OFL.txt`, root), await license.text());
}
console.log(`Vendored ${sources.length} font subsets.`);
