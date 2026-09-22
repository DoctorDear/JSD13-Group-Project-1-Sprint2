// The desktop catalog uses four columns, so two complete rows fit per page.
export const PRODUCT_PAGE_SIZE = 8;

const normalise = (value) => String(value ?? "").trim().toLowerCase();

const TEAM_LEAGUES = {
  arsenal: "Premier League",
  bayern: "Bundesliga",
  "real madrid": "La Liga",
  liverpool: "Premier League",
};

export const getProductId = (product) => product._id || product.id;

export const getProductTags = (product) => {
  if (Array.isArray(product.tag)) return product.tag;
  return product.tag ? [product.tag] : [];
};

const getNameBeforeSeason = (product) => {
  const name = String(product.name || "");
  const seasonIndex = name.search(/\b(?:20\d{2}\/\d{2}|\d{2}\/\d{2})\b/);
  if (seasonIndex === -1) return "";

  return name
    .slice(0, seasonIndex)
    .trim()
    .replace(/\s+(?:fc|cf|sc)$/i, "")
    .trim();
};

export const getProductTeam = (product) =>
  product.team || product.club || product.teamName || getNameBeforeSeason(product) || "Other";

export const getProductLeague = (product) => {
  if (product.league) return product.league;
  if (product.category) return product.category;

  const team = normalise(getProductTeam(product));
  return TEAM_LEAGUES[team] || "Other";
};

export const getProductEditions = (product) => {
  if (product.edition) return [product.edition];
  return product.editions?.map((edition) => edition.name).filter(Boolean) || [];
};

export const getProductCollection = (product) => {
  if (product.collection) return product.collection;
  if (product.groupId) return product.groupId;

  const searchableText = `${product.name || ""} ${getProductTags(product).join(" ")}`;
  const season = searchableText.match(/\b\d{4}\/\d{2}\b/)?.[0];
  return season ? `${season} Collection` : "Core Collection";
};

export const isProductAvailable = (product) =>
  product.isAvailable ?? (product.isActive !== false && Number(product.quantity) > 0);

export const isProductOnSale = (product) =>
  Boolean(product.discount) || Number(product.originalPrice) > Number(product.price);

export const formatProductPrice = (value) => `฿${Number(value).toLocaleString()}`;

export function getProductPriceBounds(products) {
  const prices = products
    .map((product) => Number(product.price))
    .filter((price) => Number.isFinite(price));

  if (!prices.length) return { min: 0, max: 5000 };

  return {
    min: Math.floor(Math.min(...prices) / 100) * 100,
    max: Math.ceil(Math.max(...prices) / 100) * 100,
  };
}

export function buildProductFilterOptions(products) {
  const unique = (items) =>
    [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  return {
    teams: unique(products.map(getProductTeam)),
    leagues: unique(products.map(getProductLeague)),
    collections: unique(products.map(getProductCollection)),
    editions: unique(products.flatMap(getProductEditions)),
  };
}

export function filterProducts(products, filters) {
  const {
    search,
    team,
    league,
    collection,
    edition,
    minPrice,
    maxPrice,
    availableOnly,
    onSale,
  } = filters;
  const query = normalise(search);
  const minimum = minPrice === "" ? 0 : Number(minPrice);
  const maximum = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice);

  return products.filter((product) => {
    const productText = normalise(
      [
        product.name,
        product.description,
        getProductTeam(product),
        getProductLeague(product),
        product.groupId,
        getProductCollection(product),
        ...getProductTags(product),
        ...getProductEditions(product),
      ].join(" "),
    );
    const productPrice = Number(product.price) || 0;
    const hasEdition =
      !edition || getProductEditions(product).some((item) => item === edition);

    return (
      (!query || productText.includes(query)) &&
      (!team || getProductTeam(product) === team) &&
      (!league || getProductLeague(product) === league) &&
      (!collection || getProductCollection(product) === collection) &&
      hasEdition &&
      productPrice >= minimum &&
      productPrice <= maximum &&
      (!availableOnly || isProductAvailable(product)) &&
      (!onSale ||
        (onSale === "yes" ? isProductOnSale(product) : !isProductOnSale(product)))
    );
  });
}

export function sortProducts(products, sort) {
  const sorted = [...products];

  if (sort === "price-low") {
    return sorted.sort((a, b) => Number(a.price) - Number(b.price));
  }
  if (sort === "price-high") {
    return sorted.sort((a, b) => Number(b.price) - Number(a.price));
  }
  if (sort === "name") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === "newest") {
    return sorted.sort(
      (a, b) =>
        new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0),
    );
  }

  return sorted;
}
