import mongoose from "mongoose";

export const PERSONALIZATION_FONT_IDS = Object.freeze(["barlow-condensed-900"]);
export const PERSONALIZATION_BADGE_IDS = Object.freeze([
  "none",
  "premier-league",
  "premier-league-racism",
]);

export const isSafeImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  const normalized = value.trim();
  if (normalized.startsWith("/") && !normalized.startsWith("//")) return true;
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === "https:" && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

const finiteNumber = {
  type: Number,
  required: true,
  validate: { validator: Number.isFinite, message: "Template geometry must use finite numbers" },
};

const numericBox = {
  type: [Number],
  required: true,
  validate: {
    validator: (value) => Array.isArray(value) && value.length === 4 && value.every(Number.isFinite),
    message: "View boxes must contain exactly four finite numbers",
  },
};

const safeSvgColor = (value) => typeof value === "string" && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value);
const safePathData = (value) => typeof value === "string" &&
  value.length > 0 && /^[MLQZmlqz0-9.,\s-]+$/.test(value) && /[MLQZmlqz]/.test(value);

const textStyleSchema = new mongoose.Schema({
  x: finiteNumber,
  y: finiteNumber,
  fontId: { type: String, required: true, enum: PERSONALIZATION_FONT_IDS },
  fontSize: finiteNumber,
  fontWeight: finiteNumber,
  letterSpacing: finiteNumber,
  fill: { type: String, required: true, validate: { validator: safeSvgColor, message: "Use a hex SVG color" } },
  stroke: { type: String, required: true, validate: { validator: safeSvgColor, message: "Use a hex SVG color" } },
  strokeWidth: finiteNumber,
}, { _id: false, strict: "throw" });

const sleeveBadgeSchema = new mongoose.Schema({
  x: finiteNumber,
  y: finiteNumber,
  rotate: finiteNumber,
  skewY: finiteNumber,
  scaleX: finiteNumber,
  scaleY: finiteNumber,
  zoomViewBox: numericBox,
  clipPath: {
    type: String,
    required: true,
    validate: { validator: safePathData, message: "Clip paths must contain only SVG path geometry" },
  },
}, { _id: false, strict: "throw" });

const personalizationTemplateSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true, trim: true },
  active: { type: Boolean, default: true, required: true },
  backImageUrl: {
    type: String,
    required: true,
    trim: true,
    validate: { validator: isSafeImageUrl, message: "Images must use HTTPS or a local path" },
  },
  viewBox: numericBox,
  name: { type: textStyleSchema, required: true },
  number: { type: textStyleSchema, required: true },
  sleeveBadge: { type: sleeveBadgeSchema, required: true },
  sleeveBadgeOptions: {
    type: [{ type: String, enum: PERSONALIZATION_BADGE_IDS }],
    required: true,
    validate: { validator: (value) => Array.isArray(value), message: "Badge options must be an array" },
  },
}, { timestamps: true, strict: "throw" });

export const PersonalizationTemplate = mongoose.model(
  "PersonalizationTemplate",
  personalizationTemplateSchema,
);
