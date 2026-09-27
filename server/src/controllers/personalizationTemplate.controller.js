import { PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";
import { resolvePersonalizationTemplate } from "../lib/personalizationTemplate.js";

const PATCHABLE_TEMPLATE_FIELDS = new Set([
  "active",
  "backImageUrl",
  "viewBox",
  "name",
  "number",
  "sleeveBadge",
  "sleeveBadgeOptions",
]);

export const getPersonalizationTemplates = async (_req, res, next) => {
  try {
    const templates = await PersonalizationTemplate.find().sort({ groupId: 1 });
    return res.status(200).json({ templates });
  } catch (error) {
    return next(error);
  }
};

export const getPersonalizationTemplateByGroupId = async (req, res, next) => {
  try {
    const template = await resolvePersonalizationTemplate({
      personalizationEnabled: true,
      personalizationGroupId: req.params.groupId,
    });
    if (!template) return res.status(404).json({ error: "Personalization template not found" });
    return res.status(200).json({ template });
  } catch (error) {
    return next(error);
  }
};

export const createPersonalizationTemplate = async (req, res, next) => {
  try {
    const template = await PersonalizationTemplate.create(req.body);
    return res.status(201).json({ template });
  } catch (error) {
    return next(error);
  }
};

export const updatePersonalizationTemplate = async (req, res, next) => {
  try {
    const { groupId, ...updates } = req.body ?? {};
    if (typeof groupId !== "string" || !groupId.trim()) {
      return res.status(400).json({ error: "groupId is required" });
    }
    if (Object.keys(updates).some((field) => !PATCHABLE_TEMPLATE_FIELDS.has(field))) {
      return res.status(400).json({ error: "Unsupported template field" });
    }
    const template = await PersonalizationTemplate.findOneAndUpdate(
      { groupId },
      { $set: updates },
      { new: true, runValidators: true, strict: "throw" },
    );
    if (!template) return res.status(404).json({ error: "Personalization template not found" });
    return res.status(200).json({ template });
  } catch (error) {
    return next(error);
  }
};
