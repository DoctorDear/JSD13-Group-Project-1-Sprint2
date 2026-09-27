import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { getR2Config } from '../config/r2.js';
import { buildPublicImageUrl, putImageObject } from '../services/r2Storage.js';

const source = await readFile(new URL('../../../Zeta-Jersey-Store/src/assets/hero_section.webp', import.meta.url));
const config = getR2Config();
const variants = [];
for (const width of [640, 960, 1600, 2400]) {
  const { data, info } = await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toBuffer({ resolveWithObject: true });
  const hash = createHash('sha256').update(data).digest('hex').slice(0, 16);
  const key = `site/hero/hero-${info.width}-${hash}.webp`;
  await putImageObject({ key, body: data, contentType: 'image/webp', contentLength: data.length });
  const url = buildPublicImageUrl(key, config.publicBaseUrl);
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Hero verification failed: ${response.status}`);
  variants.push({ url, width: info.width, height: info.height, bytes: data.length });
}
await writeFile(new URL('../../../Zeta-Jersey-Store/src/lib/heroImages.json', import.meta.url), `${JSON.stringify(variants, null, 2)}\n`);
console.log(JSON.stringify({ originalBytes: source.length, variants }, null, 2));

