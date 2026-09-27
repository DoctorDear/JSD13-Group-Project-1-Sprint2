import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPersonalizationTemplatePayload,
  getProductPersonalizationFields,
  validatePersonalizationTemplate,
  validateProductForm,
} from './productForm.js';

test('product form reports each required field with a clear message', () => {
  const errors = validateProductForm({ name: ' ', description: '', price: '-1', stock: '1.5', date: '', tag: '' });
  assert.deepEqual(Object.keys(errors), ['name', 'description', 'price', 'stock', 'date', 'tag']);
  for (const message of Object.values(errors)) assert.ok(message.length > 10);
});

test('product form accepts valid values including zero stock', () => {
  assert.deepEqual(validateProductForm({ name: 'Jersey', description: 'Home kit', price: '1200', stock: '0', date: '2026-09-25', tag: 'football' }), {});
});

test('enabled products must select an existing template group', () => {
  const templates = [{ groupId: 'LFC-2627-HOME' }];
  assert.equal(
    validateProductForm({ name: 'Jersey', description: 'Home kit', price: '1200', stock: '0', date: '2026-09-25', tag: 'football', personalizationEnabled: true, personalizationGroupId: '' }, { templates }).personalizationGroupId,
    'Select a valid personalization template group.',
  );
  assert.equal(
    validateProductForm({ name: 'Jersey', description: 'Home kit', price: '1200', stock: '0', date: '2026-09-25', tag: 'football', personalizationEnabled: true, personalizationGroupId: 'UNKNOWN' }, { templates }).personalizationGroupId,
    'Select a valid personalization template group.',
  );
});

test('disabled products always clear personalization fields', () => {
  assert.deepEqual(
    getProductPersonalizationFields({ personalizationEnabled: false, personalizationGroupId: 'LFC-2627-HOME' }),
    { personalizationEnabled: false, personalizationGroupId: null },
  );
});

test('template validation rejects malformed group IDs and non-finite geometry', () => {
  const template = {
    groupId: 'bad group', active: true, backImageUrl: '/back.png', viewBox: [0, 0, 100, 100],
    name: { x: 50, y: 20, fontId: 'barlow-condensed-900', fontSize: 12, fontWeight: 900, letterSpacing: 1, fill: '#fff', stroke: '#000', strokeWidth: 1 },
    number: { x: 50, y: 70, fontId: 'barlow-condensed-900', fontSize: 32, fontWeight: 900, letterSpacing: 0, fill: '#fff', stroke: '#000', strokeWidth: 1 },
    sleeveBadge: { x: 1, y: 2, rotate: 0, skewY: 0, scaleX: 1, scaleY: 1, zoomViewBox: [0, 0, 100, 100], clipPath: 'M0 0L10 0L10 10Z' },
    sleeveBadgeOptions: ['none'],
  };

  assert.equal(validatePersonalizationTemplate(template).groupId, 'Use letters, numbers, and hyphens for the group ID.');
  assert.equal(validatePersonalizationTemplate({ ...template, groupId: 'VALID-GROUP', sleeveBadge: { ...template.sleeveBadge, x: Number.NaN } })['sleeveBadge.x'], 'Enter a finite number.');
});

test('template payload strips API metadata and keeps only editable fields', () => {
  const document = {
    _id: 'template-123', __v: 4, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-02T00:00:00.000Z',
    groupId: 'LFC-2627-HOME', active: true, backImageUrl: '/back.png', viewBox: [0, 0, 100, 100],
    name: { x: 50 }, number: { y: 70 }, sleeveBadge: { x: 1 }, sleeveBadgeOptions: ['none'],
  };
  assert.deepEqual(buildPersonalizationTemplatePayload(document), {
    groupId: 'LFC-2627-HOME', active: true, backImageUrl: '/back.png', viewBox: [0, 0, 100, 100],
    name: { x: 50 }, number: { y: 70 }, sleeveBadge: { x: 1 }, sleeveBadgeOptions: ['none'],
  });
});
