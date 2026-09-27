import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { connectDB } from "../config/db.js";
import { PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";
import { Product } from "../models/Product.model.js";

export const LIVERPOOL_HOME_GROUP_ID = "LFC-2627-HOME";

export const LIVERPOOL_HOME_TEMPLATE = Object.freeze({
  groupId: LIVERPOOL_HOME_GROUP_ID,
  active: true,
  backImageUrl: "/images/personalization/liverpool-home-26-27-back.jpeg",
  viewBox: [0, 0, 1000, 1000],
  name: {
    x: 500,
    y: 255,
    fontId: "barlow-condensed-900",
    fontSize: 80,
    fontWeight: 900,
    letterSpacing: 4,
    fill: "#f8f6ed",
    stroke: "#7d1024",
    strokeWidth: 3,
  },
  number: {
    x: 500,
    y: 605,
    fontId: "barlow-condensed-900",
    fontSize: 315,
    fontWeight: 900,
    letterSpacing: 4,
    fill: "#f8f6ed",
    stroke: "#7d1024",
    strokeWidth: 5,
  },
  sleeveBadge: {
    x: 789,
    y: 293,
    rotate: -15,
    skewY: 8,
    scaleX: 0.684,
    scaleY: 1.032,
    zoomViewBox: [710, 175, 175, 310],
    clipPath: "M 740 175 L 787 175 Q 809 230 816 275 Q 828 335 841 421 L 740 460 Z",
  },
  sleeveBadgeOptions: ["none", "premier-league", "premier-league-racism"],
});

export async function seedPersonalizationTemplate() {
  await PersonalizationTemplate.findOneAndUpdate(
    { groupId: LIVERPOOL_HOME_GROUP_ID },
    { $set: LIVERPOOL_HOME_TEMPLATE },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  const liverpoolHomeProducts = {
    $or: [
      { groupId: LIVERPOOL_HOME_GROUP_ID },
      { sku: { $regex: "^(?:LFC-2627-HOME(?:-|$)|KA6852(?:-|$))", $options: "i" } },
      { name: { $regex: "Liverpool.*(?:2026\\s*[/ -]\\s*27|26\\s*[/ -]\\s*27).*Home", $options: "i" } },
    ],
  };
  return Product.updateMany(liverpoolHomeProducts, {
    $set: {
      groupId: LIVERPOOL_HOME_GROUP_ID,
      personalizationEnabled: true,
      personalizationGroupId: LIVERPOOL_HOME_GROUP_ID,
      backImageUrl: LIVERPOOL_HOME_TEMPLATE.backImageUrl,
    },
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await connectDB();
    const result = await seedPersonalizationTemplate();
    console.log(`Liverpool personalization template seeded; ${result.modifiedCount ?? 0} product(s) updated.`);
  } catch (error) {
    console.error("Failed to seed Liverpool personalization template:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
