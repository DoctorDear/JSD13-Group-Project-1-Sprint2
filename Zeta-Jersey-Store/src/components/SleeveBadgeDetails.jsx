import { SLEEVE_BADGES } from '../lib/sleeveBadges.js';

export default function SleeveBadgeDetails({ item }) {
  const badge = SLEEVE_BADGES.find((entry) => entry.id === item?.sleeveBadge);
  const name = typeof item?.customName === 'string' ? item.customName.toUpperCase() : '';
  const number = item?.customNumber === null || item?.customNumber === undefined
    ? ''
    : String(item.customNumber);
  const hasPrint = Boolean(name || number);
  const hasBadge = badge && badge.id !== 'none';
  if (!hasPrint && !hasBadge) return null;

  const price = (value) => `฿${Number(value ?? 0).toLocaleString()}`;
  return (
    <div className="mt-1 space-y-0.5 text-xs text-gray-600">
      {name && <p>Name: {name}{item.namePrice != null && ` (+${price(item.namePrice)})`}</p>}
      {number !== '' && <p>Number: {number}{item.numberPrice != null && ` (+${price(item.numberPrice)})`}</p>}
      {hasBadge && <p>Sleeve badge: {badge.label} (+{price(item.badgePrice ?? badge.price)})</p>}
    </div>
  );
}
