import { PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";

function asPlainObject(template) {
  return typeof template?.toObject === "function" ? template.toObject() : template;
}

export async function resolvePersonalizationTemplate(product) {
  if (product?.personalizationEnabled !== true) return null;
  const groupId = product.personalizationGroupId;
  if (typeof groupId !== "string" || !groupId.trim()) return null;

  const template = await PersonalizationTemplate.findOne({ groupId, active: true });
  if (!template) return null;

  const value = asPlainObject(template);
  if (value?.groupId !== groupId || value?.active !== true) return null;

  try {
    await new PersonalizationTemplate(value).validate();
  } catch {
    return null;
  }

  return template;
}
