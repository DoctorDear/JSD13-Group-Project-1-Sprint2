import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProductForm } from './productForm.js';

test('product form reports each required field with a clear message', () => {
  const errors = validateProductForm({ name: ' ', description: '', price: '-1', stock: '1.5', date: '', tag: '' });
  assert.deepEqual(Object.keys(errors), ['name', 'description', 'price', 'stock', 'date', 'tag']);
  for (const message of Object.values(errors)) assert.ok(message.length > 10);
});

test('product form accepts valid values including zero stock', () => {
  assert.deepEqual(validateProductForm({ name: 'Jersey', description: 'Home kit', price: '1200', stock: '0', date: '2026-09-25', tag: 'football' }), {});
});
