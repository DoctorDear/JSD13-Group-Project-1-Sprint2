import test from 'node:test';
import assert from 'node:assert/strict';
import { getPersonalizationBreakdown } from './personalizationBreakdown.js';

test('breakdown uses price snapshots and reconciles components to the unit price', () => {
  const breakdown = getPersonalizationBreakdown({
    productId: { price: 2900 },
    price: 4850,
    customName: 'salah',
    customNumber: '11',
    sleeveBadge: 'premier-league-racism',
    namePrice: 400,
    numberPrice: 700,
    badgePrice: 850,
  });

  assert.deepEqual(breakdown, {
    name: 'SALAH', number: '11', badgeLabel: 'Premier League + No Room for Racism',
    basePrice: 2900, namePrice: 400, numberPrice: 700, badgePrice: 850, unitPrice: 4850,
  });
  assert.equal(breakdown.basePrice + breakdown.namePrice + breakdown.numberPrice + breakdown.badgePrice, breakdown.unitPrice);
});

test('legacy numeric zero and missing component prices remain readable and reconcile', () => {
  const breakdown = getPersonalizationBreakdown({
    productId: { price: 3300 },
    price: 4180,
    customName: 'i',
    customNumber: 0,
    sleeveBadge: 'premier-league',
  });

  assert.equal(breakdown.name, 'I');
  assert.equal(breakdown.number, '0');
  assert.equal(breakdown.basePrice, 3300);
  assert.equal(breakdown.namePrice, 80);
  assert.equal(breakdown.numberPrice, 350);
  assert.equal(breakdown.badgePrice, 450);
  assert.equal(breakdown.basePrice + breakdown.namePrice + breakdown.numberPrice + breakdown.badgePrice, breakdown.unitPrice);
});

test('double zero stays exact and uses the two digit fallback price', () => {
  const breakdown = getPersonalizationBreakdown({
    price: 2000,
    customName: 'I',
    customNumber: '00',
  });

  assert.equal(breakdown.number, '00');
  assert.equal(breakdown.numberPrice, 700);
  assert.equal(breakdown.basePrice + breakdown.namePrice + breakdown.numberPrice + breakdown.badgePrice, breakdown.unitPrice);
});
