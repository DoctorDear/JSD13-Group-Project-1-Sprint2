import { SLEEVE_BADGES } from './sleeveBadges.js';

const hasPrice = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

export function getPersonalizationBreakdown(item = {}) {
  const name = typeof item.customName === 'string' ? item.customName.toUpperCase() : '';
  const number = item.customNumber === null || item.customNumber === undefined || item.customNumber === ''
    ? ''
    : String(item.customNumber);
  const badge = SLEEVE_BADGES.find((entry) => entry.id === (item.sleeveBadge || 'none'));

  const namePrice = name ? Number(hasPrice(item.namePrice) ? item.namePrice : name.length * 80) : 0;
  const numberPrice = number
    ? Number(hasPrice(item.numberPrice) ? item.numberPrice : number.length === 1 ? 350 : 700)
    : 0;
  const badgePrice = badge && badge.id !== 'none'
    ? Number(hasPrice(item.badgePrice) ? item.badgePrice : badge.price)
    : 0;
  const componentTotal = namePrice + numberPrice + badgePrice;
  const productBasePrice = hasPrice(item.productId?.price)
    ? Number(item.productId.price)
    : hasPrice(item.product?.price) ? Number(item.product.price) : null;
  const unitPrice = hasPrice(item.price)
    ? Number(item.price)
    : hasPrice(item.unitPrice)
      ? Number(item.unitPrice)
      : (productBasePrice ?? 0) + componentTotal;
  const basePrice = hasPrice(item.basePrice)
    ? Number(item.basePrice)
    : hasPrice(item.price) || hasPrice(item.unitPrice)
      ? unitPrice - componentTotal
      : productBasePrice ?? 0;

  return {
    name,
    number,
    badgeLabel: badge?.id !== 'none' ? badge?.label ?? '' : '',
    basePrice,
    namePrice,
    numberPrice,
    badgePrice,
    unitPrice,
  };
}
