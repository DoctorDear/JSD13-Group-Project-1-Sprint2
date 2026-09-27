export const SLEEVE_BADGE_PRICES = Object.freeze({
  none: 0,
  "premier-league": 450,
  "premier-league-racism": 850,
});

export function getTemplateSleeveBadgePricing(template, requestedBadge = "none") {
  const sleeveBadge = requestedBadge === undefined || requestedBadge === null ? "none" : requestedBadge;
  if (typeof sleeveBadge !== "string" || !Object.hasOwn(SLEEVE_BADGE_PRICES, sleeveBadge)) return null;
  if (!Array.isArray(template?.sleeveBadgeOptions) || !template.sleeveBadgeOptions.includes(sleeveBadge)) return null;
  return { sleeveBadge, badgePrice: SLEEVE_BADGE_PRICES[sleeveBadge] };
}

export function getSleeveBadgePricing(product, requestedBadge = "none") {
  const sleeveBadge = requestedBadge === undefined || requestedBadge === null ? "none" : requestedBadge;
  if (typeof sleeveBadge !== "string") return null;
  if (!Object.hasOwn(SLEEVE_BADGE_PRICES, sleeveBadge)) return null;

  const name = product?.name || "";
  const isLiverpoolHome = /\bliverpool\b/i.test(name) && /\bhome\b/i.test(name);
  const hasDemoSeason = /(?:20)?26\s*[/ -]\s*27/.test(name);
  const hasDemoKitCode = [product?.sku, ...(product?.images || [])]
    .some((value) => /KA6852/i.test(value || ""));
  const isLiverpoolHomeDemo = product?.groupId === "LFC-2627-HOME" ||
    (isLiverpoolHome && (hasDemoSeason || hasDemoKitCode));
  if (sleeveBadge !== "none" && !isLiverpoolHomeDemo) return null;

  return { sleeveBadge, badgePrice: SLEEVE_BADGE_PRICES[sleeveBadge] };
}
