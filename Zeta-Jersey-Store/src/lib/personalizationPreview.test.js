import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBackPreviewImage,
  getAvailableSleeveBadges,
  getPersonalizationTextAttributes,
  getPreferredSleeveBadge,
  isPersonalizationEligible,
  normalizePersonalizationName,
} from './personalizationPreview.js';

const product = {
  name: 'Liverpool FC 2026/27 Home Jersey',
  sku: 'KA6852',
  images: ['/images/front.jpg'],
  personalizationEnabled: true,
  personalizationGroupId: 'LFC-2627-HOME',
  personalizationTemplate: {
    active: true,
    groupId: 'LFC-2627-HOME',
    backImageUrl: '/images/back.jpg',
    name: { x: 500, y: 255, fontId: 'barlow-condensed-900', fontSize: 80, fontWeight: 900, letterSpacing: 4, fill: '#f8f6ed', stroke: '#7d1024', strokeWidth: 3 },
  },
};

test('only an enabled product with its active matching template is eligible', () => {
  assert.equal(isPersonalizationEligible(product), true);
  assert.equal(isPersonalizationEligible({ ...product, personalizationEnabled: false }), false);
  assert.equal(isPersonalizationEligible({ ...product, personalizationTemplate: null }), false);
  assert.equal(isPersonalizationEligible({ ...product, personalizationTemplate: { ...product.personalizationTemplate, active: false } }), false);
  assert.equal(isPersonalizationEligible({ ...product, personalizationTemplate: { ...product.personalizationTemplate, groupId: 'OTHER' } }), false);
});

test('Liverpool name, season, SKU, and image values do not enable personalization', () => {
  for (const candidate of [
    { name: product.name, images: product.images },
    { name: 'Liverpool Home Jersey', sku: 'KA6852' },
    { name: 'Another kit', images: ['/liverpool-home-26-27-back.jpeg'] },
  ]) {
    assert.equal(isPersonalizationEligible(candidate), false);
  }
});

test('resolved template supplies its back image', () => {
  assert.equal(getBackPreviewImage(product), '/images/back.jpg');
});

test('one-letter preview text uses the fixed template font size without stretching', () => {
  const attributes = getPersonalizationTextAttributes(product.personalizationTemplate.name);
  assert.equal(attributes.fontSize, 80);
  assert.equal(attributes.fontFamily, "'Barlow Condensed', Bahnschrift, 'Arial Narrow', sans-serif");
  assert.equal(Object.hasOwn(attributes, 'textLength'), false);
});

test('name input accepts only ASCII letters and uppercases keystrokes or paste', () => {
  assert.equal(normalizePersonalizationName('a-lé x!'), 'ALX');
});

test('a single non-none template badge remains selectable and is selected by default', () => {
  const badges = getAvailableSleeveBadges(['premier-league']);
  assert.deepEqual(badges.map(({ id }) => id), ['premier-league']);
  assert.equal(getPreferredSleeveBadge(['premier-league']), 'premier-league');
});
