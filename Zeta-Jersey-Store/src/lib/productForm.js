const GROUP_ID_PATTERN = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const FONT_IDS = new Set(["barlow-condensed-900"]);
const BADGE_IDS = new Set(["none", "premier-league", "premier-league-racism"]);

export function getProductPersonalizationFields(form = {}) {
  const enabled = form.personalizationEnabled === true || form.personalizationEnabled === "true" || form.personalizationEnabled === "on";
  return {
    personalizationEnabled: enabled,
    personalizationGroupId: enabled ? String(form.personalizationGroupId || "").trim() : null,
  };
}

export function validateProductForm(form, { templates = [] } = {}) {
  const errors = {};
  if (!form.name?.trim()) errors.name = "Enter a product name.";
  else if (form.name.length > 120) errors.name = "Name must be 120 characters or fewer.";
  if (!form.description?.trim()) errors.description = "Enter a description.";
  if (form.price === "" || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) errors.price = "Enter a valid price of zero or more.";
  if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = "Enter a whole number of zero or more.";
  if (!form.date || Number.isNaN(new Date(form.date).getTime())) errors.date = "Select a valid date.";
  if (!form.tag?.trim()) errors.tag = "Enter at least one tag.";
  const personalization = getProductPersonalizationFields(form);
  if (personalization.personalizationEnabled) {
    const groupId = personalization.personalizationGroupId;
    const exists = templates.some((template) => template.groupId === groupId);
    if (!groupId || !GROUP_ID_PATTERN.test(groupId) || !exists) {
      errors.personalizationGroupId = "Select a valid personalization template group.";
    }
  }
  return errors;
}

const isFiniteField = (value) => value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));

export function validatePersonalizationTemplate(template = {}) {
  const errors = {};
  const groupId = String(template.groupId || "").trim();
  if (!GROUP_ID_PATTERN.test(groupId)) errors.groupId = "Use letters, numbers, and hyphens for the group ID.";
  if (!template.backImageUrl?.trim()) errors.backImageUrl = "Enter a back image URL.";

  const checkBox = (name, value) => {
    if (!Array.isArray(value) || value.length !== 4 || !value.every(isFiniteField)) {
      errors[name] = "Enter exactly four finite numbers.";
    }
  };
  checkBox("viewBox", template.viewBox);
  checkBox("sleeveBadge.zoomViewBox", template.sleeveBadge?.zoomViewBox);

  for (const styleName of ["name", "number"]) {
    const style = template[styleName] || {};
    for (const field of ["x", "y", "fontSize", "fontWeight", "letterSpacing", "strokeWidth"]) {
      if (!isFiniteField(style[field])) errors[`${styleName}.${field}`] = "Enter a finite number.";
    }
    if (!FONT_IDS.has(style.fontId)) errors[`${styleName}.fontId`] = "Choose an approved font.";
  }

  const badge = template.sleeveBadge || {};
  for (const field of ["x", "y", "rotate", "skewY", "scaleX", "scaleY"]) {
    if (!isFiniteField(badge[field])) errors[`sleeveBadge.${field}`] = "Enter a finite number.";
  }
  if (!badge.clipPath?.trim()) errors["sleeveBadge.clipPath"] = "Enter badge clip path geometry.";
  if (!Array.isArray(template.sleeveBadgeOptions) || template.sleeveBadgeOptions.some((id) => !BADGE_IDS.has(id))) {
    errors.sleeveBadgeOptions = "Choose supported badge options.";
  }
  return errors;
}
