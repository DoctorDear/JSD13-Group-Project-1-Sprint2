import { createHash } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import sharp from "sharp";
import { getR2Config } from "../config/r2.js";
import { buildPublicImageUrl, putImageObject } from "../services/r2Storage.js";
import { Product } from "../models/Product.model.js";
import { PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_PIXELS = 50_000_000;
const SOURCE_OVERRIDES = new Map([
  [
    "FC_Bayern_26-27_Away_JZ4560_21_model.jpg",
    "https://assets.adidas.com/images/w_1880%2Cf_auto%2Cq_auto/51bd64b7e93246a4805fbff5f3cbfe10_9366/JZ3069_21_model.jpg",
  ],
]);
const isAdidasAsset = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "assets.adidas.com";
  } catch {
    return false;
  }
};

async function downloadImage(sourceUrl) {
  let currentUrl = sourceUrl;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== "https:" || !(parsed.hostname === "assets.adidas.com" || parsed.hostname.endsWith(".adidas.com"))) {
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

function inspectImage(buffer) {
  return sharp(buffer, { limitInputPixels: MAX_PIXELS, animated: true }).metadata().then((metadata) => {
    const formats = {
      jpeg: { contentType: "image/jpeg", extension: "jpg" },
      png: { contentType: "image/png", extension: "png" },
      webp: { contentType: "image/webp", extension: "webp" },
    };
    const format = formats[metadata.format];
    if (!format || (metadata.pages || 1) > 1 || !metadata.width || !metadata.height || metadata.width * metadata.height > MAX_PIXELS) {
      throw new Error("The downloaded file is not a supported static image.");
    }
    return { ...format, width: metadata.width, height: metadata.height };
  });
}

function replaceUrl(url, replacements) {
  return replacements.get(url) || url;
}

const catalogPath = fileURLToPath(new URL("../../../Zeta-Jersey-Store/src/data/products.json", import.meta.url));
const catalogTempPath = `${catalogPath}.r2-migration.tmp`;
const apply = process.argv.includes("--apply");
const config = getR2Config();
const catalogSource = await readFile(catalogPath, "utf8");
const catalog = JSON.parse(catalogSource);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const [products, templates] = await Promise.all([
    Product.find({}, "images backImageUrl").lean(),
    PersonalizationTemplate.find({}, "backImageUrl").lean(),
  ]);
  const sourceUrls = new Set();
  for (const product of products) {
    for (const url of [...(product.images || []), product.backImageUrl || ""]) if (isAdidasAsset(url)) sourceUrls.add(url);
  }
  for (const template of templates) if (isAdidasAsset(template.backImageUrl)) sourceUrls.add(template.backImageUrl);
  for (const product of catalog) {
    for (const url of [...(product.images || []), product.imageUrl || "", product.backImageUrl || ""]) if (isAdidasAsset(url)) sourceUrls.add(url);
  }

  if (!sourceUrls.size) {
    console.log("No Adidas image references found.");
    process.exitCode = 0;
  } else {
    const replacements = new Map();
    const failures = [];
    for (const sourceUrl of sourceUrls) {
      try {
        const filename = new URL(sourceUrl).pathname.split("/").at(-1);
        const downloadUrl = SOURCE_OVERRIDES.get(filename) || sourceUrl;
        const buffer = await downloadImage(downloadUrl);
        const image = await inspectImage(buffer);
        const digest = createHash("sha256").update(downloadUrl).digest("hex");
        const key = `migrated/adidas/${digest}.${image.extension}`;
        if (apply) await putImageObject({ key, body: buffer, contentType: image.contentType, contentLength: buffer.length });
        replacements.set(sourceUrl, buildPublicImageUrl(key, config.publicBaseUrl));
        console.log(`${apply ? "Uploaded" : "Validated"} image ${replacements.size}/${sourceUrls.size} (${image.width}x${image.height}, ${buffer.length} bytes)`);
      } catch (error) {
        failures.push(`${filename}: ${error.message}`);
        console.error(`Could not migrate ${filename}: ${error.message}`);
      }
    }

    if (failures.length) throw new Error(`${failures.length} Adidas image(s) failed validation; no database or catalog references were changed.`);

    const changedProducts = products.map((product) => ({
      ...product,
      images: (product.images || []).map((url) => replaceUrl(url, replacements)),
      backImageUrl: replaceUrl(product.backImageUrl || "", replacements),
    })).filter((product, index) => {
      const previous = products[index];
      return JSON.stringify(product.images) !== JSON.stringify(previous.images || []) || product.backImageUrl !== (previous.backImageUrl || "");
    });
    const changedTemplates = templates.map((template) => ({
      ...template,
      backImageUrl: replaceUrl(template.backImageUrl, replacements),
    })).filter((template, index) => template.backImageUrl !== templates[index].backImageUrl);
    const updatedCatalog = catalog.map((product) => ({
      ...product,
      ...(Array.isArray(product.images) ? { images: product.images.map((url) => replaceUrl(url, replacements)) } : {}),
      ...(typeof product.imageUrl === "string" ? { imageUrl: replaceUrl(product.imageUrl, replacements) } : {}),
      ...(typeof product.backImageUrl === "string" ? { backImageUrl: replaceUrl(product.backImageUrl, replacements) } : {}),
    }));
    const updatedCatalogSource = [...replacements].reduce(
      (text, [source, destination]) => text.split(JSON.stringify(source)).join(JSON.stringify(destination)),
      catalogSource,
    );

    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", uniqueImages: sourceUrls.size, productsToUpdate: changedProducts.length, templatesToUpdate: changedTemplates.length, catalogProducts: updatedCatalog.filter((product, index) => JSON.stringify(product) !== JSON.stringify(catalog[index])).length }));
    if (apply) {
      await writeFile(catalogTempPath, updatedCatalogSource, { flag: "wx" });
      try {
        if (changedProducts.length || changedTemplates.length) {
          await mongoose.connection.transaction(async (session) => {
            if (changedProducts.length) {
              await Product.bulkWrite(changedProducts.map(({ _id, images, backImageUrl }) => ({
                updateOne: { filter: { _id }, update: { $set: { images, backImageUrl } } },
              })), { session });
            }
            if (changedTemplates.length) {
              await PersonalizationTemplate.bulkWrite(changedTemplates.map(({ _id, backImageUrl }) => ({
                updateOne: { filter: { _id }, update: { $set: { backImageUrl } } },
              })), { session });
            }
          });
        }
        await rename(catalogTempPath, catalogPath);
      } catch (error) {
        await rm(catalogTempPath, { force: true });
        throw error;
      }
      console.log("Updated MongoDB image references and local product catalog.");
    }
  }
} finally {
  await mongoose.disconnect();
}
