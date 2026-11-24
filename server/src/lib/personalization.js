import { getTemplateSleeveBadgePricing } from "./sleeveBadges.js";

const NAME_PRICE_PER_LETTER = 80;
const NUMBER_PRICE_ONE_DIGIT = 350;
const NUMBER_PRICE_TWO_DIGITS = 700;

export const normalizePersonalizationName = (value) =>
  typeof value === "string" ? value.toUpperCase() : "";

export const normalizePersonalizationNumber = (value) =>
  value === undefined || value === null ? null : String(value);

export const normalizeSleeveBadge = (value) => value || "none";

export const samePersonalization = (left = {}, right = {}) =>
  normalizePersonalizationName(left.customName) === normalizePersonalizationName(right.customName) &&
  normalizePersonalizationNumber(left.customNumber) === normalizePersonalizationNumber(right.customNumber) &&
  normalizeSleeveBadge(left.sleeveBadge) === normalizeSleeveBadge(right.sleeveBadge);

/**
 * Validate and normalize cart customName/customNumber pairs (both present or both empty).
 */
export function normalizeCartPersonalization({ customName, customNumber } = {}) {
  const name = customName === undefined || customName === null ? "" : customName;
  if (typeof name !== "string") return null;

  let number = customNumber;
  if (number === undefined || number === null || number === "") number = null;
  if (number !== null && (typeof number !== "string" || !/^\d{1,2}$/.test(number))) return null;
  if (Boolean(name) !== Boolean(number)) return null;

  return { customName: name, customNumber: number };
}

export function pricePersonalization({
  product,
  template,
  printEnabled,
  customName,
  customNumber,
  sleeveBadge = "none",
} = {}) {
  const basePrice = product?.price;
  if (typeof basePrice !== "number" || !Number.isFinite(basePrice) || basePrice < 0) return null;
  if (!template || typeof printEnabled !== "boolean") return null;

  const badgePricing = getTemplateSleeveBadgePricing(template, sleeveBadge);
  if (!badgePricing) return null;

  let normalizedName = "";
  let printedNumber = null;
  let namePrice = 0;
  let numberPrice = 0;

  if (printEnabled) {
    if (typeof customName !== "string" || !/^[A-Za-z]{1,20}$/.test(customName)) return null;
    if (typeof customNumber !== "string" || !/^\d{1,2}$/.test(customNumber)) return null;
    normalizedName = customName.toUpperCase();
    printedNumber = customNumber;
    namePrice = normalizedName.length * NAME_PRICE_PER_LETTER;
    numberPrice = customNumber.length === 1 ? NUMBER_PRICE_ONE_DIGIT : NUMBER_PRICE_TWO_DIGITS;
  }

  const customizationPrice = namePrice + numberPrice + badgePricing.badgePrice;
  return {
    customName: normalizedName,
    customNumber: printedNumber,
    namePrice,
    numberPrice,
    sleeveBadge: badgePricing.sleeveBadge,
    badgePrice: badgePricing.badgePrice,
    customizationPrice,
    unitPrice: basePrice + customizationPrice,
  };
}
