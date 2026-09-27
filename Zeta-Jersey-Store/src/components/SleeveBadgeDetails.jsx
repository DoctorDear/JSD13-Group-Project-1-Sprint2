import { getPersonalizationBreakdown } from '../lib/personalizationBreakdown.js';

export default function SleeveBadgeDetails({ item }) {
  const breakdown = getPersonalizationBreakdown(item);
  const { name, number, badgeLabel, basePrice, namePrice, numberPrice, badgePrice } = breakdown;
  const hasPrint = Boolean(name || number);
  const hasBadge = Boolean(badgeLabel);
  if (!hasPrint && !hasBadge) return null;

  const price = (value) => `฿${Number(value).toLocaleString()}`;
  return (
    <div className="mt-1 space-y-0.5 text-xs text-gray-600">
      <p>Jersey: {price(basePrice)}</p>
      {name && <p>Name: {name} (+{price(namePrice)})</p>}
      {number !== '' && <p>Number: {number} (+{price(numberPrice)})</p>}
      {hasBadge && <p>Sleeve badge: {badgeLabel} (+{price(badgePrice)})</p>}
    </div>
  );
}
