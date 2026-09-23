import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const catalogPath = path.join(root, "src", "data", "products.json");
const imageDirectory = path.join(root, "public", "images", "puma-top5-2627");

// Men's 2026/27 home fan jerseys from Puma's official store, checked 2026-09-23.
// Prices and stock in the resulting catalog are fictional THB demo values.
const shirts = [
  ["man-city", "Manchester City", "Premier League", "784326", "https://eu.puma.com/de/en/pd/manchester-city-26-27-home-jersey-men/784326"],
  ["valencia", "Valencia CF", "La Liga", "784523", "https://eu.puma.com/de/de/pd/valencia-cf-26-27-heimtrikot-herren/784523"],
  ["girona", "Girona FC", "La Liga", "786186", "https://eu.puma.com/de/de/pd/girona-f.c.-26%2F27-heimtrikot-herren/786186"],
  ["ac-milan", "AC Milan", "Serie A", "784121", "https://eu.puma.com/de/en/pd/ac-milan-26-27-home-jersey-men/784121"],
  ["dortmund", "Borussia Dortmund", "Bundesliga", "784088", "https://eu.puma.com/de/en/pd/borussia-dortmund-26-27-home-jersey-men/784088"],
  ["leipzig", "RB Leipzig", "Bundesliga", "784042", "https://eu.puma.com/de/en/pd/rb-leipzig-26-27-home-jersey-men/784042"],
  ["marseille", "Olympique de Marseille", "Ligue 1", "784252", "https://eu.puma.com/de/de/pd/olympique-de-marseille-26%2F27-heimtrikot-herren/784252"],
  ["rennes", "Stade Rennais", "Ligue 1", "784305", "https://eu.puma.com/de/en/pd/stade-rennais-26%2F27-home-jersey/784305"],
];

function productImages(html, style) {
  const urls = [...html.matchAll(/https:\/\/images\.puma\.com\/image\/upload\/[^" ]+/g)]
    .map((match) => match[0].replaceAll("&amp;", "&"))
    .filter((url) => url.includes("w_2000,h_2000") && url.includes(`/global/${style}/01/`));
  const unique = [...new Set(urls)];
  const choices = [
    unique.find((url) => url.includes("/01/mod01/")),
    unique.find((url) => url.includes("/01/fnd/")),
    unique.find((url) => url.includes("/01/bv/")),
  ].filter(Boolean);
  return choices.length >= 2 ? choices : unique.slice(0, 3);
}

await mkdir(imageDirectory, { recursive: true });
const imported = [];
for (const [slug, team, league, style, sourceUrl] of shirts) {
  const page = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
  if (!page.ok) throw new Error(`Puma page failed (${page.status}): ${sourceUrl}`);
  const html = await page.text();
  if (!html.includes(style) || !html.includes("26/27")) {
    throw new Error(`Could not confirm 2026/27 style ${style}: ${sourceUrl}`);
  }
  const sourceImages = productImages(html, style);
  if (sourceImages.length < 2) throw new Error(`Missing Puma gallery images: ${sourceUrl}`);
  const images = [];
  for (const [index, sourceImage] of sourceImages.entries()) {
    const response = await fetch(sourceImage, {
      headers: { "user-agent": "Mozilla/5.0", accept: "image/jpeg,image/png,image/*;q=0.8" },
      signal: AbortSignal.timeout(30000),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.startsWith("image/")) {
      throw new Error(`Puma image failed (${response.status}, ${contentType}): ${sourceImage}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 10000) throw new Error(`Suspiciously small Puma image: ${sourceImage}`);
    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const fileName = `${slug}-${index + 1}.${extension}`;
    await writeFile(path.join(imageDirectory, fileName), bytes);
    images.push(`/images/puma-top5-2627/${fileName}`);
  }
  imported.push({
    id: `demo-puma-${slug}-2627`, sku: `PUMA-DEMO-${style}-01`,
    brand: "Puma", name: `${team} 26/27 Home Jersey`, team, league, category: league,
    collection: "2026/27 Collection", edition: "Fan Edition", kitType: "home",
    fit: "regular", activity: "football", tag: ["2026/27", "Home Kit", "Demo"],
    price: 2990, originalPrice: 0,
    description: `${team}'s 2026/27 Puma home fan jersey. Demo catalog entry; price and stock are illustrative.`,
    quantity: 20, imageUrl: images[0], images,
    sizes: ["S", "M", "L", "XL", "2XL"], isAvailable: true, isActive: true, sourceUrl,
  });
  console.log(`${team}: ${images.length} official images`);
}

const existing = JSON.parse(await readFile(catalogPath, "utf8"));
const existingIds = new Set(existing.map((product) => product.id));
const additions = imported.filter((product) => !existingIds.has(product.id));
if (additions.length) await writeFile(catalogPath, `${JSON.stringify([...existing, ...additions], null, 2)}\n`);
console.log(`Added ${additions.length} Puma products; preserved ${existing.length} existing products.`);
