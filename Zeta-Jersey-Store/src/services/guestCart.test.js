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
