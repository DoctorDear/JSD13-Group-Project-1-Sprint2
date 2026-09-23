import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const catalogPath = path.join(root, "src", "data", "products.json");
const imageDirectory = path.join(root, "public", "images", "thai-league-2627");

// 2026/27 Thai League 1 home kits, checked against the season kit index on 2026-09-23.
// Images are hosted by Football Kit Archive. Price and stock are demo values.
const shirts = [
  ["pt-prachuap", "PT Prachuap FC", "Ari", "https://www.arionline.com/products/aap3396-30-ari-pt-prachuap-fc-2026-2027-home-player-jersey-orange-green-black", "https://www.arionline.com/cdn/shop/files/ARIPTPRACHUAPFC2026_2027HOMEPLAYERJERSEY_01_2fbb9d94-9575-4331-ad83-59625592ad8f.jpg?v=1790070954&width=1200"],
  ["bg-pathum", "BG Pathum United", "Nike", "https://www.footballkitarchive.com/bg-pathum-united-2026-27-home-kit-518582/", "https://cdn.footballkitarchive.com/2026/09/14/cflfSJ53f8VKlbT.jpg"],
  ["bangkok", "Bangkok United", "Adidas", "https://www.footballkitarchive.com/bangkok-united-2026-27-home-kit-513678/", "https://cdn.footballkitarchive.com/2026/09/18/uJlLohzh2RKwHMA.jpg"],
  ["buriram", "Buriram United", "In-House", "https://www.footballkitarchive.com/buriram-united-2026-27-home-kit-493588/", "https://cdn.footballkitarchive.com/2026/09/14/zlEtjiQFRYhvJem.jpg"],
  ["chonburi", "Chonburi FC", "FBT", "https://www.footballkitarchive.com/chonburi-fc-2026-27-home-kit-511912/", "https://cdn.footballkitarchive.com/2026/08/24/DaUgNdxJhfhwLdZ.jpg"],
  ["lamphun", "Lamphun Warriors", "Kelme", "https://www.footballkitarchive.com/lamphun-warriors-2026-27-home-kit-513798/", "https://cdn.footballkitarchive.com/2026/08/28/jBw1M4vq3IjmPwt.jpg"],
  ["port", "Port FC", "Mizuno", "https://www.portfcstore.com/products/26-27-home-port-tpl-player-m-copy", "https://www.portfcstore.com/cdn/shop/files/PORT_KITLAUNCH_HOME_Packshot_3x4_01.jpg?v=1785481683&width=900"],
  ["ratchaburi", "Ratchaburi FC", "Mizuno", "https://www.footballkitarchive.com/ratchaburi-fc-2026-27-home-kit-514105/", "https://cdn.footballkitarchive.com/2026/09/01/cDmXxK8nIFghH1E.jpg"],
  ["sukhothai", "Sukhothai FC", "Warrix", "https://www.footballkitarchive.com/sukhothai-fc-2026-27-home-kit-505611/", "https://cdn.footballkitarchive.com/2026/08/10/X2hz8rr2Bu5ZeBr.jpg"],
  ["uthai-thani", "Uthai Thani FC", "Hummel", "https://www.footballkitarchive.com/uthai-thani-fc-2026-27-home-kit-514727/", "https://cdn.footballkitarchive.com/2026/09/01/kfCsTcPrhkywAiy.jpg"],
];

await mkdir(imageDirectory, { recursive: true });
for (const [slug, , , , sourceImageUrl] of shirts) {
  const imagePath = path.join(imageDirectory, `${slug}.jpg`);
  try {
    if ((await stat(imagePath)).size > 10000) continue;
  } catch {
    // Download images missing from the local catalog.
  }
  const response = await fetch(sourceImageUrl, { signal: AbortSignal.timeout(30000) });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`Kit image failed (${response.status}, ${contentType}): ${sourceImageUrl}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 10000) throw new Error(`Suspiciously small kit image: ${sourceImageUrl}`);
  await writeFile(imagePath, bytes);
  console.log(`${slug}: saved ${bytes.length} bytes`);
}

const existing = JSON.parse(await readFile(catalogPath, "utf8"));
const imported = shirts.map(([slug, team, brand, sourceUrl]) => ({
  id: `demo-thai-${slug}-2627`,
  sku: `THAI-DEMO-${slug.toUpperCase()}-2627`,
  brand,
  name: `${team} 26/27 Home Jersey`,
  team,
  league: "Thai League 1",
  category: "Thai League 1",
  collection: "2026/27 Collection",
  edition: slug === "pt-prachuap" ? "Player Edition" : "Fan Edition",
  kitType: "home",
  fit: "regular",
  activity: "football",
  tag: ["2026/27", "Home Kit", "Demo"],
  price: slug === "pt-prachuap" ? 890 : 990,
  originalPrice: 0,
  description: `${team}'s 2026/27 home jersey. Demo catalog entry; ${slug === "pt-prachuap" || slug === "port" ? "stock is illustrative" : "price and stock are illustrative"}.`,
  quantity: 20,
  imageUrl: `/images/thai-league-2627/${slug}.jpg`,
  images: [`/images/thai-league-2627/${slug}.jpg`],
  sizes: ["S", "M", "L", "XL", "2XL"],
  isAvailable: true,
  isActive: true,
  sourceUrl,
}));

const importedById = new Map(imported.map((product) => [product.id, product]));
const updated = existing
  .filter((product) => !product.id?.startsWith("demo-thai-") || importedById.has(product.id))
  .map((product) => importedById.get(product.id) || product);
const existingIds = new Set(existing.map((product) => product.id));
const additions = imported.filter((product) => !existingIds.has(product.id));
await writeFile(catalogPath, `${JSON.stringify([...updated, ...additions], null, 2)}\n`);
console.log(`Added ${additions.length} Thai League demo products; catalog now has ${updated.length + additions.length} products.`);
