import { getTemplateSleeveBadgePricing } from "./sleeveBadges.js";

const NAME_PRICE_PER_LETTER = 80;
const NUMBER_PRICE_ONE_DIGIT = 350;
const NUMBER_PRICE_TWO_DIGITS = 700;

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
