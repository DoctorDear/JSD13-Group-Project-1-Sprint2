import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.model.js";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");
const catalogPath = path.resolve(serverRoot, "../Zeta-Jersey-Store/src/data/products.json");
const products = JSON.parse(await readFile(catalogPath, "utf8"))
  .filter((product) => product.id?.startsWith("demo-puma-"));

if (products.length !== 8) {
  throw new Error(`Expected 8 Puma top-five-league demo products; found ${products.length}`);
}

await connectDB();
try {
  const result = await Product.bulkWrite(products.map((product) => ({
    updateOne: {
      filter: { sku: product.sku },
      update: {
        $set: { images: product.images },
        $setOnInsert: {
          sku: product.sku,
          brand: product.brand,
          team: product.team,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: product.quantity,
          tag: product.tag,
          category: product.category,
          edition: product.edition,
          fit: product.fit,
          kitType: product.kitType,
          activity: product.activity,
          sizes: product.sizes,
          isActive: true,
          sourceUrl: product.sourceUrl,
        },
      },
      upsert: true,
    },
  })));
  console.log(`Added ${result.upsertedCount} demo products; ${products.length - result.upsertedCount} already existed.`);
} finally {
  await mongoose.disconnect();
}
