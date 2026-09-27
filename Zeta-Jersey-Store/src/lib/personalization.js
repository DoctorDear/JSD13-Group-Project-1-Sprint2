import { getSleeveBadge } from './sleeveBadges.js';

export function preparePersonalization({ enabled, name = '', number = '', sleeveBadge = 'none', productPrice = 0 }) {
  const customName = enabled ? String(name).replace(/[^A-Za-z]/g, '').toUpperCase() : '';
  const printedNumber = enabled ? String(number).trim() : '';
  let error = '';

  if (enabled && !customName) error = 'Enter a name for the jersey.';
  else if (enabled && customName.length > 20) error = 'Use up to 20 English letters for the name.';
  else if (enabled && !printedNumber) error = 'Enter a number from 0 to 99.';
  else if (enabled && !/^\d{1,2}$/.test(printedNumber)) error = 'Enter a number from 0 to 99.';

  let badgePrice = 0;
  try {
    badgePrice = getSleeveBadge(sleeveBadge).price;
  } catch {
    error ||= 'Choose a valid sleeve badge.';
  }

  const namePrice = enabled && !error ? customName.length * 80 : 0;
  const numberPrice = enabled && !error ? (printedNumber.length === 1 ? 350 : 700) : 0;
  const validPrice = Number.isFinite(Number(productPrice)) && Number(productPrice) >= 0 ? Number(productPrice) : 0;
  return {
    customName,
    customNumber: enabled && printedNumber && /^\d{1,2}$/.test(printedNumber) ? printedNumber : null,
    namePrice,
    numberPrice,
    badgePrice,
    price: validPrice + namePrice + numberPrice + badgePrice,
    error,
  };
}
