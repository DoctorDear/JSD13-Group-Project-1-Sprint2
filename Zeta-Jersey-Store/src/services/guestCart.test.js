import test from 'node:test';
import assert from 'node:assert/strict';
import { addGuestItem, mergeGuestCart, readGuestCart, removeGuestItem, updateGuestItem } from './guestCart.js';

function storage() {
  const entries = new Map();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
}

test('badge choices keep separate cart lines and include their per-shirt surcharge when merging', async () => {
  const local = storage();
  const product = { price: 2900 };
  for (const sleeveBadge of ['none', 'premier-league', 'premier-league-racism', 'premier-league']) {
    addGuestItem(local, { productId: 'shirt', product, size: 'M', sleeveBadge });
  }
  assert.deepEqual(readGuestCart(local).map(({ price, quantity }) => [price, quantity]), [[2900, 1], [3350, 2], [3750, 1]]);
  const sent = [];
  await mergeGuestCart(local, async (item) => sent.push(item));
  assert.deepEqual(sent.map((item) => item.sleeveBadge), ['none', 'premier-league', 'premier-league-racism']);
  assert.equal(sent.some((item) => 'price' in item || 'badgePrice' in item), false);
});

test('guest personalization keeps zero formatting and separates complete line identities', () => {
  const local = storage();
  const product = { price: 1000 };
  for (const customNumber of ['0', '00', '0']) {
    addGuestItem(local, { productId: 'shirt', product, size: 'M', enabled: true, customName: 'ALEX', customNumber });
  }
  const items = readGuestCart(local);
  assert.deepEqual(items.map(({ customNumber, quantity, namePrice, numberPrice, price }) => ({ customNumber, quantity, namePrice, numberPrice, price })), [
    { customNumber: '0', quantity: 2, namePrice: 320, numberPrice: 350, price: 1670 },
    { customNumber: '00', quantity: 1, namePrice: 320, numberPrice: 700, price: 2020 },
  ]);
});

test('guest merge sends personalization choices without preview prices', async () => {
  const local = storage();
  addGuestItem(local, { productId: 'shirt', product: { price: 1000 }, size: 'M', enabled: true, customName: 'ALEX', customNumber: '00', sleeveBadge: 'premier-league' });
  let sent;
  await mergeGuestCart(local, async (item) => { sent = item; });
  assert.deepEqual(sent, { productId: 'shirt', size: 'M', quantity: 1, customName: 'ALEX', customNumber: '00', sleeveBadge: 'premier-league' });
});

test('guest cart combines the same product and size but keeps different sizes separate', () => {
  const local = storage();
  const product = { _id: 'product-1', name: 'Jersey', price: 2900, images: ['jersey.jpg'] };
  addGuestItem(local, { product, productId: product._id, size: 'M', quantity: 1 });
  addGuestItem(local, { product, productId: product._id, size: 'M', quantity: 2 });
  addGuestItem(local, { product, productId: product._id, size: 'L', quantity: 1 });
  assert.deepEqual(readGuestCart(local).map(({ size, quantity }) => [size, quantity]), [['M', 3], ['L', 1]]);
});

test('guest cart supports quantity changes and removal', () => {
  const local = storage();
  const [item] = addGuestItem(local, { productId: 'product-1', size: 'M', quantity: 1 });
  updateGuestItem(local, item._id, 4);
  assert.equal(readGuestCart(local)[0].quantity, 4);
  removeGuestItem(local, item._id);
  assert.deepEqual(readGuestCart(local), []);
});

test('merge keeps unsent guest items when a server request fails', async () => {
  const local = storage();
  addGuestItem(local, { productId: 'one', size: 'M', quantity: 2 });
  addGuestItem(local, { productId: 'two', size: 'L', quantity: 1 });
  const sent = [];
  await assert.rejects(mergeGuestCart(local, async (item) => {
    sent.push(item.productId);
    if (item.productId === 'two') throw new Error('network');
  }), /network/);
  assert.deepEqual(sent, ['one', 'two']);
  assert.deepEqual(readGuestCart(local).map((item) => item.productId), ['two']);
});
