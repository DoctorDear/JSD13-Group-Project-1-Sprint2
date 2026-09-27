const FONT_FAMILIES = Object.freeze({
  'barlow-condensed-900': "'Barlow Condensed', Bahnschrift, 'Arial Narrow', sans-serif",
});

export function isPersonalizationEligible(product) {
  const template = product?.personalizationTemplate;
  return product?.personalizationEnabled === true &&
    Boolean(product.personalizationGroupId) &&
    template?.active === true &&
    template?.groupId === product.personalizationGroupId;
}

export function getBackPreviewImage(product) {
  if (isPersonalizationEligible(product)) return product.personalizationTemplate.backImageUrl;
  return product?.backImageUrl || product?.images?.[0] || '';
}

export function getPersonalizationTextAttributes(style) {
  return {
    x: style.x,
    y: style.y,
    fontFamily: FONT_FAMILIES[style.fontId] || 'sans-serif',
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    textAnchor: 'middle',
    paintOrder: 'stroke',
  };
}

export function normalizePersonalizationName(value) {
  return String(value).replace(/[^A-Za-z]/g, '').slice(0, 20).toUpperCase();
}
