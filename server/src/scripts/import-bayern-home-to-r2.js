import { createHash } from "node:crypto";
import sharp from "sharp";
import mongoose from "mongoose";
import { getR2Config } from "../config/r2.js";
import { buildPublicImageUrl, putImageObject } from "../services/r2Storage.js";
import { Product } from "../models/Product.model.js";
import { BAYERN_HOME_PRODUCTS } from "./bayern-home-products.js";

const APPLY = process.argv.includes("--apply");
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_PIXELS = 50_000_000;

async function downloadAdidasImage(sourceUrl) {
  let currentUrl = sourceUrl;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== "https:" || parsed.hostname !== "assets.adidas.com") {
      throw new Error("The image source redirected outside the allowed Adidas host.");
    }
    const response = await fetch(currentUrl, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
    if (response.status >= 300 && response.status < 400) {
      if (redirects === 3) throw new Error("The image source redirected too many times.");
      const location = response.headers.get("location");
      if (!location) throw new Error("The image source returned an invalid redirect.");
      currentUrl = new URL(location, currentUrl).href;
      continue;
    }
    if (!response.ok || !response.body) throw new Error(`Image download returned HTTP ${response.status}.`);

    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > MAX_SOURCE_BYTES) throw new Error("The source image exceeds 20 MiB.");
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_SOURCE_BYTES) {
        await reader.cancel();
        throw new Error("The source image exceeds 20 MiB.");
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks, size);
  }
  throw new Error("Could not download the image.");
}

function buildObjectKey(buffer) {
  const digest = createHash("sha256").update(buffer).digest("hex");
  return `catalog/bayern-2627-home/${digest}.webp`;
}

const r2 = getR2Config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const preparedProducts = [];
  const imageObjects = new Map();

  for (const product of BAYERN_HOME_PRODUCTS) {
    const images = [];
    for (const sourceUrl of product.images) {
      const source = await downloadAdidasImage(sourceUrl);
      const optimized = await sharp(source, { limitInputPixels: MAX_PIXELS })
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toBuffer();
      const key = buildObjectKey(optimized);
      imageObjects.set(key, optimized);
      images.push(buildPublicImageUrl(key, r2.publicBaseUrl));
    }
    preparedProducts.push({
      product: { ...product, images },
      imageCount: images.length,
    });
  }

  const existing = await Product.find({ sku: { $in: BAYERN_HOME_PRODUCTS.map(({ sku }) => sku) } })
    .select("sku name")
    .lean();
  const existingSkus = new Set(existing.map(({ sku }) => sku));
  console.log(JSON.stringify({
    mode: APPLY ? "apply" : "dry-run",
    products: preparedProducts.map(({ product, imageCount }) => ({
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      images: imageCount,
      alreadyExists: existingSkus.has(product.sku),
    })),
    uniqueR2Images: imageObjects.size,
  }, null, 2));

  if (APPLY) {
    let uploaded = 0;
    for (const [key, body] of imageObjects) {
      await putImageObject({ key, body, contentType: "image/webp", contentLength: body.length });
      uploaded += 1;
      console.log(`R2: ${uploaded}/${imageObjects.size} images uploaded.`);
    }

    const operations = preparedProducts.map(({ product }) => {
      const update = existingSkus.has(product.sku)
        ? { $addToSet: { images: { $each: product.images } } }
        : { $setOnInsert: product };
      return {
        updateOne: {
          filter: { sku: product.sku },
          update,
          upsert: true,
        },
      };
    });
    const result = await Product.bulkWrite(operations, { ordered: true });
    console.log(JSON.stringify({
      inserted: result.upsertedCount,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    }));
  }
} finally {
  await mongoose.disconnect();
}
