import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const catalogPath = path.join(root, "src", "data", "products.json");
const imageDirectory = path.join(root, "public", "images", "nike-top5-2627");

// Official Nike or club pages, checked on 2026-09-23. Prices and stock are demo values.
const shirts = [
  ["chelsea", "Chelsea", "Premier League", "https://www.nike.com/t/chelsea-fc-2026-27-stadium-home-mens-nike-dri-fit-soccer-repica-jersey-iobrwJJt/II1904-453", "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/4bbcd923-0328-4361-9cd2-7005deb0974b/CFC+M+NK+DF+JSY+SS+STAD+HM.png"],
  ["tottenham", "Tottenham Hotspur", "Premier League", "https://www.nike.com/fr/t/maillot-de-foot-replica-nike-dri-fit-tottenham-hotspur-2026-27-stadium-domicile-pour-homme-8uf9sMGP", "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/bcfeb15d-6a9c-4610-a688-b9ebfd6d9a12/THFC+MNK+DF+JSY+SS+STAD+HM.png"],
  ["brighton", "Brighton & Hove Albion", "Premier League", "https://shop.brightonandhovealbion.com/new-in/new/new-in/7588_BHAFC-Adult-2627-Home-Shirt.html"],
  ["barcelona", "FC Barcelona", "La Liga", "https://www.nike.com/t/fc-barcelona-2026-27-stadium-home-mens-nike-dri-fit-soccer-replica-jersey-yT3tF8r4/II1872-683", "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/071fedcf-e1a3-410b-a0ca-6f960cae1d90/FCB+M+NK+DF+JSY+SS+STAD+HM.png"],
  ["atletico", "Atlético Madrid", "La Liga", "https://www.nike.com/at/en/t/atletico-madrid-2026-27-stadium-home-mens-nike-dri-fit-football-replica-jersey-htruianm/II1893-101"],
  ["elche", "Elche CF", "La Liga", "https://www.elchecf.es/noticias/home-kit-elche-cf-202627-less-new-more-true"],
  ["deportivo", "Deportivo de La Coruña", "La Liga", "https://www.rcdeportivo.es/es/noticias/el-rc-deportivo-y-nike-presentan-la-primera-equipacion-para-la-temporada-2026-27-una-nueva-era-v"],
  ["inter", "Inter Milan", "Serie A", "https://www.nike.com/t/inter-milan-2026-27-stadium-home-mens-nike-dri-fit-soccer-replica-jersey-8kKIpfQc/II1889-409"],
  ["monza", "AC Monza", "Serie A", "https://www.acmonza.com/en/news/nike-new-kits-home-away-2027/"],
  ["elversberg", "SV Elversberg", "Bundesliga", "https://sv07elversberg.de/unsere-farben-unsere-zeit-das-neue-heimtrikot-fuer-die-bundesliga-saison-2026-2027/"],
  ["freiburg", "SC Freiburg", "Bundesliga", "https://shop.scfreiburg.com/SC-Freiburg-Trikot-Heim-2627-rot/products/6974?locale=de", "https://e591dcd21c.edge.storage/res/product_200/SC-Freiburg-Trikot-Heim-2627-rot---8e02c929-fba7-4e85-b71f-efafcd670914.jpg"],
  ["psg", "Paris Saint-Germain", "Ligue 1", "https://www.nike.com/t/paris-saint-germain-2026-27-stadium-home-mens-nike-dri-fit-soccer-repica-jersey-G0RMdauR/II1885-417"],
  ["angers", "Angers SCO", "Ligue 1", "https://boutique.angers-sco.fr/products/maillot-domicile-ad-26-27"],
  ["toulouse", "Toulouse FC", "Ligue 1", "https://www.toulousefc.com/play/blog/2026/07/le-toulouse-football-club-devoile-son-nouveau-maillot-domicile-2026-2027", "https://www.toulousefc.com/media/pages/play/blog/ad3620b2c6-1783957252/tfc-maillot-retouche-13-6a5506c7438c9.webp"],
];

function imageFromHtml(html, baseUrl) {
  const tag = html.match(/<meta\s+[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/i)?.[0];
  const raw = tag?.match(/content=["']([^"']+)["']/i)?.[1];
  if (!raw) throw new Error(`No official image metadata: ${baseUrl}`);
  return new URL(raw.replaceAll("&amp;", "&"), baseUrl).href.replace(/^http:/, "https:");
}

function nikeGalleryImages(html, suffix) {
  const marker = '{"cardType":"image","properties":';
  const images = [];
  let position = 0;
  while ((position = html.indexOf(marker, position)) !== -1) {
    const nextCard = html.indexOf('{"cardType":', position + marker.length);
    const card = html.slice(position, nextCard === -1 ? position + 1500 : nextCard);
    const url = card.match(/"portrait":\{"aspectRatio":[^,]+,"url":"([^"]+)"/)?.[1];
    if (url?.includes(suffix)) {
      const fullSizeUrl = url.replace('/t_default/', '/t_web_pdp_936_v2/f_auto,');
      if (!images.includes(fullSizeUrl)) images.push(fullSizeUrl);
    }
    position += marker.length;
  }
  return images.slice(0, 5);
}

await mkdir(imageDirectory, { recursive: true });
const imported = [];
for (const [slug, team, league, sourceUrl, officialImageUrl] of shirts) {
  const page = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
  if (!page.ok) throw new Error(`Product page failed (${page.status}): ${sourceUrl}`);
  const html = await page.text();
  const gallerySuffix = {
    chelsea: 'CFC+M+NK+DF+JSY+SS+STAD+HM',
    tottenham: 'THFC+MNK+DF+JSY+SS+STAD+HM',
    barcelona: 'FCB+M+NK+DF+JSY+SS+STAD+HM',
    atletico: 'ATM+M+NK+DF+JSY+SS+STAD+HM',
    inter: 'INTER+M+NK+DF+JSY+SS+STAD+HM',
  }[slug];
  const imageUrls = gallerySuffix
    ? nikeGalleryImages(html, gallerySuffix)
    : [officialImageUrl || imageFromHtml(html, sourceUrl)];
  if (gallerySuffix && imageUrls.length < 2) throw new Error(`Missing Nike gallery photos: ${sourceUrl}`);
  const images = [];
  for (const [index, imageUrl] of imageUrls.entries()) {
    const image = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
    const contentType = image.headers.get("content-type") || "";
    if (!image.ok || !contentType.startsWith("image/")) {
      throw new Error(`Product image failed (${image.status}, ${contentType}): ${imageUrl}`);
    }
    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const fileName = gallerySuffix
      ? `${slug}-${index === 0 ? 'hd' : index + 1}.${extension}`
      : `${slug}.${extension}`;
    const bytes = Buffer.from(await image.arrayBuffer());
    if (bytes.length < 10000) throw new Error(`Suspiciously small product image: ${imageUrl}`);
    await writeFile(path.join(imageDirectory, fileName), bytes);
    images.push(`/images/nike-top5-2627/${fileName}`);
    console.log(`${team} image ${index + 1}: ${bytes.length} bytes`);
  }
  imported.push({
    id: `demo-nike-${slug}-2627`, sku: `NIKE-DEMO-${slug.toUpperCase()}-2627`,
    brand: "Nike", name: `${team} 26/27 Home Shirt`, team, league, category: league,
    collection: "2026/27 Collection", edition: "Stadium Edition", kitType: "home",
    fit: "regular", activity: "football", tag: ["2026/27", "Home Kit", "Demo"],
    price: 2990, originalPrice: 0,
    description: `${team}'s 2026/27 Nike home shirt. Demo catalog entry; price and stock are illustrative.`,
    quantity: 20, imageUrl: images[0], images,
    sizes: ["S", "M", "L", "XL", "2XL"], isAvailable: true, isActive: true, sourceUrl,
  });
}

const existing = JSON.parse(await readFile(catalogPath, "utf8"));
const importedById = new Map(imported.map((product) => [product.id, product]));
let updated = 0;
const refreshed = existing.map((product) => {
  const current = importedById.get(product.id);
  if (!current || JSON.stringify(product.images) === JSON.stringify(current.images)) return product;
  updated += 1;
  return { ...product, imageUrl: current.imageUrl, images: current.images };
});
const existingIds = new Set(existing.map((product) => product.id));
const additions = imported.filter((product) => !existingIds.has(product.id));
if (additions.length || updated) await writeFile(catalogPath, `${JSON.stringify([...refreshed, ...additions], null, 2)}\n`);
console.log(`Added ${additions.length} Nike products, refreshed ${updated} galleries; preserved ${existing.length} existing products.`);
