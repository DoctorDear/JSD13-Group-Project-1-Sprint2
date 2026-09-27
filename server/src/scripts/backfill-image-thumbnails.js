import mongoose from 'mongoose';
import { Product } from '../models/Product.model.js';
import { getR2Config } from '../config/r2.js';
import { uploadImageThumbnails } from '../services/imageThumbnails.js';

const config = getR2Config();
const base = new URL(`${config.publicBaseUrl}/`);
await mongoose.connect(process.env.MONGODB_URI);
try {
  const products = await Product.find().select('images').lean();
  const urls = [...new Set(products.flatMap(({ images }) => images || []))].filter((url) => url.startsWith(base.href));
  let completed = 0;
  let originalBytes = 0;
  let thumbnailBytes = 0;
  for (let offset = 0; offset < urls.length; offset += 3) {
    await Promise.all(urls.slice(offset, offset + 3).map(async (url) => {
      const existing = await Promise.all([320, 640].map((width) => fetch(`${url}.thumb-${width}.webp`, { method: 'HEAD', signal: AbortSignal.timeout(20_000) })));
      if (!existing.every((response) => response.ok)) {
        const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
        if (!response.ok) throw new Error(`Source image failed: ${response.status}`);
        const source = Buffer.from(await response.arrayBuffer());
        if (source.length > 20 * 1024 * 1024) throw new Error('Source exceeds 20 MiB.');
        const key = new URL(url).pathname.slice(base.pathname.length).split('/').map(decodeURIComponent).join('/');
        const variants = await uploadImageThumbnails(key, source);
        originalBytes += source.length;
        thumbnailBytes += variants.reduce((sum, variant) => sum + variant.bytes, 0);
      }
      completed++;
    }));
    console.log(`Thumbnails ready: ${completed}/${urls.length}`);
  }
  console.log(JSON.stringify({ images: urls.length, originalBytes, thumbnailBytes }));
} finally {
  await mongoose.disconnect();
}
