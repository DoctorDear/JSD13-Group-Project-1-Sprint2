import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const imageDirectory = path.join(projectRoot, "public", "images", "adidas-pl-2627");
const catalogPath = path.join(projectRoot, "src", "data", "products.json");

// These are men's 2026/27 home replica shirts. Source pages were checked on 2026-09-23.
// Prices and stock below are intentionally fictional THB demo values.
const shirts = [
  {
    sku: "JZ3168", team: "Arsenal", name: "Arsenal FC 26/27 Home Jersey", price: 2990,
    sourceUrl: "https://www.adidas.co.uk/arsenal-fc-26-27-home-jersey/JZ3168.html",
    description: "Arsenal's red 2026/27 home replica jersey by adidas.",
    images: [
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/e6528a9d23f348579a16aa05dba72d2b_9366/Arsenal_FC_26-27_Home_Jersey_Red_JZ3168_21_model.jpg",
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/1dd8c4b45da84663b65eaa7d2c27cb08_9366/Arsenal_FC_26-27_Home_Jersey_Red_JZ3168_01_laydown.jpg",
    ],
  },
  {
    sku: "JZ4736", team: "Aston Villa", name: "Aston Villa 26/27 Home Jersey", price: 2990,
    sourceUrl: "https://www.adidas.co.uk/aston-villa-26-27-home-jersey/JZ4736.html",
    description: "Aston Villa's claret 2026/27 home replica jersey by adidas.",
    images: [
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/1dfc7e10d6104ae5933d3bbfe1665b93_9366/Aston_Villa_26-27_Home_Jersey_Burgundy_JZ4736_21_model.jpg",
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/7592a63328eb44c390ec0a467cb4af87_9366/Aston_Villa_26-27_Home_Jersey_Burgundy_JZ4736_01_laydown.jpg",
    ],
  },
  {
    sku: "ADI01362", team: "Fulham", name: "Fulham 26/27 Adult Home Shirt", price: 2990,
    sourceUrl: "https://shop.fulhamfc.com/kit/kitviewall/mens/6906_fulham-2627-adult-home-shirt.html",
    description: "Fulham's white 2026/27 home replica jersey by adidas, inspired by the River Thames.",
    images: [
      "https://shop.fulhamfc.com/siteimg/productimages/6906-361.jpg?v=1784789677",
      "https://shop.fulhamfc.com/siteimg/extrapicsimages/7327.jpg?v=1784789651",
    ],
  },
  {
    sku: "JZ7169", team: "Leeds United", name: "Leeds United 26/27 Home Jersey", price: 2990,
    sourceUrl: "https://www.adidas.co.uk/leeds-united-26-27-home-jersey/JZ7169.html",
    description: "Leeds United's white 2026/27 home replica jersey by adidas.",
    images: [
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/845ac0eac1ee4b8c96e1b084f6efce44_9366/Leeds_United_26-27_Home_Jersey_White_JZ7169_21_model.jpg",
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/dbf2a04066b145fe8128d5800b90a737_9366/Leeds_United_26-27_Home_Jersey_White_JZ7169_23_hover_model.jpg",
    ],
  },
  {
    sku: "KA6852", team: "Liverpool", name: "Liverpool FC 26/27 Home Jersey", price: 2990,
    sourceUrl: "https://www.adidas.co.uk/liverpool-fc-26-27-home-jersey/KA6852.html",
    description: "Liverpool's burgundy 2026/27 home replica jersey by adidas.",
    images: [
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/7e083827b22844499db6244f9b547763_9366/Liverpool_FC_26-27_Home_Jersey_Burgundy_KA6852_21_model.jpg",
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/a2d25d8d058749669522b30326cbe800_9366/Liverpool_FC_26-27_Home_Jersey_Burgundy_KA6852_23_hover_model.jpg",
    ],
  },
  {
    sku: "KA6871", team: "Manchester United", name: "Manchester United 26/27 Home Jersey", price: 2990,
    sourceUrl: "https://www.adidas.co.uk/manchester-united-26-27-home-jersey/KA6871.html",
    description: "Manchester United's red 2026/27 home replica jersey by adidas.",
    images: [
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/f7eaae60d3ea488796a6be104acbe9a4_9366/Manchester_United_26-27_Home_Jersey_Red_KA6871_21_model.jpg",
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/5d6a6c6fce084d7eb258589177ac3b98_9366/Manchester_United_26-27_Home_Jersey_Red_KA6871_23_hover_model.jpg",
    ],
  },
  {
    sku: "JZ4707", team: "Newcastle United", name: "Newcastle United FC 26/27 Home Jersey", price: 2990,
    sourceUrl: "https://www.adidas.co.uk/newcastle-united-fc-26-27-home-jersey/JZ4707.html",
    description: "Newcastle United's black and white 2026/27 home replica jersey by adidas.",
    images: [
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/cf7c4420e6a44b6aaba7867cbae8daea_9366/Newcastle_United_FC_26-27_Home_Jersey_Black_JZ4707_21_model.jpg",
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fda21e697b8e45a692abc49703460cdd_9366/Newcastle_United_FC_26-27_Home_Jersey_Black_JZ4707_01_laydown.jpg",
    ],
  },
  {
    sku: "JY8110", team: "Nottingham Forest", name: "Nottingham Forest 26/27 Home Shirt", price: 2990,
    sourceUrl: "https://shop.nottinghamforest.co.uk/products/nffc-26-27-home-shirt",
    description: "Nottingham Forest's red 2026/27 home jersey by adidas, inspired by the River Trent.",
    images: [
      "https://shop.nottinghamforest.co.uk/cdn/shop/files/nffc-2627-home-shirt-nottingham-forest-fc-8773687_1000x.jpg?v=1785934826",
      "https://shop.nottinghamforest.co.uk/cdn/shop/files/nffc-2627-home-shirt-nottingham-forest-fc-5470957_1000x.jpg?v=1785934826",
    ],
  },
];

async function downloadImage(url, destination) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
    throw new Error(`Image download failed (${response.status}): ${url}`);
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

await mkdir(imageDirectory, { recursive: true });
const products = [];
for (const shirt of shirts) {
  const images = [];
  for (const [index, url] of shirt.images.entries()) {
    const fileName = `${shirt.sku.toLowerCase()}-${index + 1}.jpg`;
    await downloadImage(url, path.join(imageDirectory, fileName));
    images.push(`/images/adidas-pl-2627/${fileName}`);
  }
  products.push({
    id: `demo-pl-${shirt.sku.toLowerCase()}`,
    sku: shirt.sku,
    brand: "Adidas",
    name: shirt.name,
    team: shirt.team,
    league: "Premier League",
    category: "Premier League",
    collection: "2026/27 Collection",
    edition: "Stadium Edition",
    kitType: "home",
    fit: "regular",
    activity: "football",
    tag: ["2026/27", "Home Kit", "Demo"],
    price: shirt.price,
    originalPrice: 0,
    description: shirt.description,
    quantity: 20,
    imageUrl: images[0],
    images,
    sizes: ["S", "M", "L", "XL", "2XL"],
    isAvailable: true,
    isActive: true,
    sourceUrl: shirt.sourceUrl,
  });
  console.log(`Imported ${shirt.team}`);
}
const existingProducts = JSON.parse(await readFile(catalogPath, "utf8"));
const existingIds = new Set(existingProducts.map((product) => product.id));
const newProducts = products.filter((product) => !existingIds.has(product.id));
if (newProducts.length) {
  await writeFile(catalogPath, `${JSON.stringify([...existingProducts, ...newProducts], null, 2)}\n`);
}
console.log(`Added ${newProducts.length} demo products; kept ${existingProducts.length} existing products.`);
