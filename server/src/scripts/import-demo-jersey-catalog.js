import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import sharp from "sharp";
import { getR2Config } from "../config/r2.js";
import { buildPublicImageUrl, putImageObject } from "../services/r2Storage.js";
import { Product } from "../models/Product.model.js";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const SOURCE_REF = "codex/demo-jersey-catalog";
const CATALOG_PATH = "Zeta-Jersey-Store/src/data/products.json";
const PUBLIC_PREFIX = "Zeta-Jersey-Store/public";
const APPLY = process.argv.includes("--apply");
const MAX_PIXELS = 50_000_000;

function gitBlob(relativePath) {
  return execFileSync("git", ["show", `${SOURCE_REF}:${relativePath}`], {
    cwd: ROOT,
    maxBuffer: 128 * 1024 * 1024,
  });
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function seasonKey(value) {
  const match = String(value || "").match(/\b(?:20)?(\d{2})\/(\d{2})\b/);
  return match ? `${match[1]}/${match[2]}` : "";
}

function productKey({ team, name, kitType, edition }) {
  const sourceName = normalize(team || name);
  const normalizedName = normalize(name);
  const matchedTeam = team
    ? normalize(team)
    : [...teams].sort((a, b) => b.length - a.length).map(normalize).find((candidate) => normalizedName.includes(candidate)) || "";
  const season = seasonKey(name);
  const type = kitType || ["home", "away", "third", "goalkeeper", "training", "lifestyle"].find((candidate) => normalizedName.includes(candidate)) || "";
  const editionKey = normalize(edition || "");
  return [matchedTeam || sourceName, season, type, editionKey].join("|");
}

function sourceImagePaths(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  return images.length ? images : product.imageUrl ? [product.imageUrl] : [];
}

function validateSource(products) {
  const importable = products.filter((product) => product.sku);
  const seenSkus = new Set();
  for (const product of importable) {
    const sku = String(product.sku).trim();
    if (!sku || seenSkus.has(sku)) throw new Error(`Duplicate or empty source SKU: ${sku}`);
    seenSkus.add(sku);
    if (!product.name || !product.description || !Number.isFinite(Number(product.price)) || !Number.isFinite(Number(product.quantity))) {
      throw new Error(`Source product ${sku} is missing required product fields.`);
    }
    const images = sourceImagePaths(product);
    if (!images.length || images.some((image) => !image.startsWith("/images/"))) {
      throw new Error(`Source product ${sku} has a missing or non-local image reference.`);
    }
  }
  return importable;
}

const catalog = JSON.parse(gitBlob(CATALOG_PATH).toString("utf8"));
const importable = validateSource(catalog);
const teams = catalog.map((product) => product.team).filter(Boolean);
const r2 = getR2Config();
const uploadedBySource = new Map();
const imageObjects = new Map();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Product.find({}).select("sku name groupId edition kitType images").lean();
  const existingBySku = new Map(existing.map((product) => [product.sku, product]));
  const existingByKey = new Map(existing.map((product) => [productKey(product), product]));
  const inserts = [];
  const merges = [];
  let imageCount = 0;

  for (const product of importable) {
    const localImages = [];
    for (const sourcePath of sourceImagePaths(product)) {
      const gitPath = `${PUBLIC_PREFIX}${sourcePath}`;
      const original = gitBlob(gitPath);
      const optimized = await sharp(original, { limitInputPixels: MAX_PIXELS })
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toBuffer();
      const digest = createHash("sha256").update(optimized).digest("hex");
      const key = `catalog/demo-jersey-2627/${digest}.webp`;
      imageObjects.set(key, optimized);
      uploadedBySource.set(sourcePath, buildPublicImageUrl(key, r2.publicBaseUrl));
      localImages.push(uploadedBySource.get(sourcePath));
      imageCount += 1;
    }
    const matched = existingBySku.get(product.sku) || existingByKey.get(productKey(product));
    if (matched) {
      merges.push({ sku: product.sku, targetSku: matched.sku, name: product.name, images: localImages });
      continue;
    }

    const slug = normalize(product.team || product.name).replace(/\s+/g, "-");
    inserts.push({
      sku: product.sku,
      groupId: `${slug}-${seasonKey(product.name)}-${product.kitType || "kit"}`,
      edition: product.edition || null,
      brand: product.brand || "",
      name: product.name,
      description: product.description,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || 0),
      quantity: Number(product.quantity),
      tag: Array.isArray(product.tag) ? product.tag : product.tag ? [product.tag] : [],
      category: product.league || product.category || "Other",
      fit: product.fit || null,
      kitType: product.kitType || null,
      activity: product.activity || "football",
      images: localImages,
      sizes: product.sizes || ["S", "M", "L", "XL", "2XL"],
      isActive: product.isActive !== false,
    });
  }

  if (imageObjects.size) {
    console.log(`${APPLY ? "Uploading" : "Prepared"} ${imageObjects.size} unique optimized R2 image(s) from ${imageCount} catalog image reference(s).`);
    if (APPLY) {
      let uploaded = 0;
      for (const [key, body] of imageObjects) {
        await putImageObject({ key, body, contentType: "image/webp", contentLength: body.length });
        uploaded += 1;
        if (uploaded % 10 === 0 || uploaded === imageObjects.size) console.log(`R2: ${uploaded}/${imageObjects.size} images uploaded.`);
      }
    }
  }

  console.log(JSON.stringify({
    mode: APPLY ? "apply" : "dry-run",
    sourceRef: SOURCE_REF,
    sourceProducts: catalog.length,
    importableProducts: importable.length,
    uniqueImages: imageObjects.size,
    imageReferences: imageCount,
    productsToInsert: inserts.length,
    productsToMerge: merges.length,
    matches: merges.map(({ sku, targetSku, name }) => ({ sku, targetSku, name })),
  }, null, 2));

  if (APPLY) {
    const operations = [
      ...inserts.map((product) => ({
        updateOne: {
          filter: { sku: product.sku },
          update: { $setOnInsert: product },
          upsert: true,
        },
      })),
      ...merges.map(({ targetSku, images }) => ({
        updateOne: {
          filter: { sku: targetSku },
          update: { $addToSet: { images: { $each: images } } },
        },
      })),
    ];
    const result = operations.length ? await Product.bulkWrite(operations, { ordered: true }) : null;
    console.log(JSON.stringify({
      inserted: result?.upsertedCount || 0,
      matched: result?.matchedCount || 0,
      modified: result?.modifiedCount || 0,
    }));
  }
} finally {
  await mongoose.disconnect();
}
