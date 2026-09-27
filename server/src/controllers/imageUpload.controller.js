import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getR2Config } from "../config/r2.js";
import { buildPublicImageUrl, putImageObject } from "../services/r2Storage.js";

const IMAGE_PURPOSES = new Set(["product", "product-back", "template-back"]);
const IMAGE_FORMATS = {
  jpeg: { contentType: "image/jpeg", extension: "jpg" },
  png: { contentType: "image/png", extension: "png" },
  webp: { contentType: "image/webp", extension: "webp" },
};
const MAX_IMAGE_PIXELS = 25_000_000;

export async function uploadImage(req, res) {
  if (!req.file || !req.file.buffer?.length) {
    return res.status(400).json({ message: "Choose an image to upload." });
  }
  if (!IMAGE_PURPOSES.has(req.body?.purpose)) {
    return res.status(400).json({ message: "Choose a valid image purpose." });
  }

  let metadata;
  try {
    metadata = await sharp(req.file.buffer, {
      limitInputPixels: MAX_IMAGE_PIXELS,
      animated: true,
    }).metadata();
  } catch {
    return res.status(415).json({ message: "The uploaded file is not a valid supported image." });
  }

  const imageFormat = IMAGE_FORMATS[metadata.format];
  if (!imageFormat || (metadata.pages || 1) > 1) {
    return res.status(415).json({ message: "Use a non-animated JPEG, PNG, or WebP image." });
  }
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  if (!width || !height || width * height > MAX_IMAGE_PIXELS) {
    return res.status(415).json({ message: "Image dimensions must be 25 megapixels or smaller." });
  }

  try {
    const config = getR2Config();
    const key = `uploads/${req.body.purpose}/${randomUUID()}.${imageFormat.extension}`;
    await putImageObject({
      key,
      body: req.file.buffer,
      contentType: imageFormat.contentType,
      contentLength: req.file.size,
    });

    return res.status(201).json({
      key,
      url: buildPublicImageUrl(key, config.publicBaseUrl),
      contentType: imageFormat.contentType,
      size: req.file.size,
      width,
      height,
    });
  } catch {
    return res.status(503).json({ message: "Image storage is unavailable. Please try again later." });
  }
}
