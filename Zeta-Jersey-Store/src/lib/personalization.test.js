import test from 'node:test';
import assert from 'node:assert/strict';
import { preparePersonalization } from './personalization.js';

test('a plain jersey sends no printed name or number', () => {
  assert.deepEqual(preparePersonalization({ enabled: false, name: 'OLD', number: '10' }), {
    customName: '', customNumber: null, namePrice: 0, numberPrice: 0, badgePrice: 0, price: 0, error: '',
  });
});

test('a personalized jersey filters its name and preserves the number text', () => {
  assert.deepEqual(preparePersonalization({ enabled: true, name: ' van d!ijk  ', number: '04', productPrice: 1000 }), {
    customName: 'VANDIJK', customNumber: '04', namePrice: 560, numberPrice: 700, badgePrice: 0, price: 2260, error: '',
  });
});

test('a personalized jersey requires a printable name and number', () => {
  assert.match(preparePersonalization({ enabled: true, name: '', number: '7' }).error, /name/i);
  assert.match(preparePersonalization({ enabled: true, name: 'SMITH', number: '' }).error, /number/i);
});

test('calculates preview price for partial name or number while flagging missing required field', () => {
  const nameOnly = preparePersonalization({ enabled: true, name: 'DD', number: '', productPrice: 2900 });
  assert.equal(nameOnly.namePrice, 160);
  assert.equal(nameOnly.numberPrice, 0);
  assert.equal(nameOnly.price, 3060);
  assert.match(nameOnly.error, /number/i);

  const numberOnly = preparePersonalization({ enabled: true, name: '', number: '10', productPrice: 2900 });
  assert.equal(numberOnly.namePrice, 0);
  assert.equal(numberOnly.numberPrice, 700);
  assert.equal(numberOnly.price, 3600);
  assert.match(numberOnly.error, /name/i);
});

test('badge-only personalization is valid and receives a display-only price preview', () => {
  assert.deepEqual(preparePersonalization({ enabled: false, name: '', number: '', sleeveBadge: 'premier-league', productPrice: 1000 }), {
    customName: '', customNumber: null, namePrice: 0, numberPrice: 0, badgePrice: 450, price: 1450, error: '',
  });
});

test('a personalized jersey rejects names and numbers outside print limits', () => {
  assert.ok(preparePersonalization({ enabled: true, name: 'A'.repeat(21), number: '7' }).error);
  assert.ok(preparePersonalization({ enabled: true, name: '123', number: '7' }).error);
  assert.ok(preparePersonalization({ enabled: true, name: 'SMITH', number: '100' }).error);
  assert.ok(preparePersonalization({ enabled: true, name: 'SMITH', number: '-1' }).error);
});
