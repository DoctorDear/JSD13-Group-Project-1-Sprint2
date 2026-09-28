import { preparePersonalization } from '../lib/personalization/personalization.js';

const KEY = 'zeta_guest_cart';

export function readGuestCart(storage = localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed
        .filter((item) => item && item.productId && item.size && Number.isInteger(item.quantity) && item.quantity > 0)
        .map((item) => ({
          ...item,
          customNumber: typeof item.customNumber === 'number' ? String(item.customNumber) : item.customNumber ?? null,
        }))
      : [];
  } catch {
    return [];
  }
}

function writeGuestCart(storage, items) {
  storage.setItem(KEY, JSON.stringify(items));
  return items;
}

export function addGuestItem(storage, { productId, product, size, quantity = 1, enabled, customName = '', customNumber = null, sleeveBadge = 'none' }) {
  const count = Number(quantity);
  if (!productId || !size || !Number.isInteger(count) || count < 1) throw new Error('Invalid cart item');
  const personalization = preparePersonalization({
    enabled: enabled ?? Boolean(customName || customNumber !== null),
    name: customName,
    number: customNumber ?? '',
    sleeveBadge,
    productPrice: product?.price ?? 0,
  });
  if (personalization.error) throw new Error(personalization.error);
  const items = readGuestCart(storage);
  const existing = items.find((item) => String(item.productId?._id || item.productId) === String(productId) && item.size === size && (item.customName || '') === personalization.customName && (item.customNumber ?? null) === personalization.customNumber && (item.sleeveBadge || 'none') === sleeveBadge);
  if (existing) existing.quantity += count;
  else items.push({
    _id: crypto.randomUUID(),
    productId: product ? { _id: productId, name: product.name, images: product.images || [], price: product.price } : productId,
    size, quantity: count,
    customName: personalization.customName,
    customNumber: personalization.customNumber,
    sleeveBadge,
    namePrice: personalization.namePrice,
    numberPrice: personalization.numberPrice,
    badgePrice: personalization.badgePrice,
    price: personalization.price,
  });
  return writeGuestCart(storage, items);
}

export function updateGuestItem(storage, id, quantity) {
  const count = Number(quantity);
  if (!Number.isInteger(count) || count < 1) throw new Error('Quantity must be at least 1');
  const items = readGuestCart(storage);
  const item = items.find((entry) => entry._id === id);
  if (!item) throw new Error('Cart item not found');
  item.quantity = count;
  return writeGuestCart(storage, items);
}

export function removeGuestItem(storage, id) {
  return writeGuestCart(storage, readGuestCart(storage).filter((item) => item._id !== id));
}

export async function mergeGuestCart(storage, addToAccount) {
  for (const item of readGuestCart(storage)) {
    await addToAccount({
      productId: item.productId?._id || item.productId,
      size: item.size,
      quantity: item.quantity,
      customName: item.customName,
      customNumber: item.customNumber,
      sleeveBadge: item.sleeveBadge || 'none',
    });
    removeGuestItem(storage, item._id);
  }
}
