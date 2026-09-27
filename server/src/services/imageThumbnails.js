import sharp from 'sharp';
import { putImageObject } from './r2Storage.js';

export async function createImageThumbnails(source) {
  return Promise.all([320, 640].map(async (width) => ({
    width,
    body: await sharp(source, { limitInputPixels: 25_000_000 }).rotate()
      .resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toBuffer(),
  })));
}

export async function uploadImageThumbnails(key, source) {
  const thumbnails = await createImageThumbnails(source);
  for (const { width, body } of thumbnails) {
    await putImageObject({ key: `${key}.thumb-${width}.webp`, body, contentType: 'image/webp', contentLength: body.length });
  }
  return thumbnails.map(({ width, body }) => ({ width, bytes: body.length }));
}
