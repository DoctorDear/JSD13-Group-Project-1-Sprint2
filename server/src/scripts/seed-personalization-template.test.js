import test from "node:test";
import assert from "node:assert/strict";
import { Product } from "../models/Product.model.js";
import { PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";
import { seedPersonalizationTemplate } from "./seed-personalization-template.js";

test("seeding twice keeps one Liverpool template and stable product flags", async (t) => {
  const templateStore = new Map();
  const products = [
    { _id: "lfc-home", name: "Liverpool FC 2026/27 Home Jersey", groupId: "LFC-2627-HOME", personalizationEnabled: false },
    { _id: "other", name: "Arsenal Home Jersey", groupId: "ARS-2627-HOME", personalizationEnabled: false },
  ];
  const originals = {
    findOneAndUpdate: PersonalizationTemplate.findOneAndUpdate,
    updateMany: Product.updateMany,
  };
  t.after(() => {
    PersonalizationTemplate.findOneAndUpdate = originals.findOneAndUpdate;
    Product.updateMany = originals.updateMany;
  });

  PersonalizationTemplate.findOneAndUpdate = async (filter, update) => {
    const key = filter.groupId;
    const current = templateStore.get(key) || { ...update.$setOnInsert };
    Object.assign(current, update.$set);
    templateStore.set(key, current);
    return current;
  };
  Product.updateMany = async (filter, update) => {
    for (const product of products) {
      const matches = product.groupId === filter.$or[0].groupId ||
        (product.name.includes("Liverpool") && product.name.includes("Home"));
      if (matches) Object.assign(product, update.$set);
    }
    return { modifiedCount: 1 };
  };

  await seedPersonalizationTemplate();
  const firstTemplate = structuredClone(templateStore.get("LFC-2627-HOME"));
  const firstProducts = structuredClone(products);
  await seedPersonalizationTemplate();

  assert.equal(templateStore.size, 1);
  assert.deepEqual(templateStore.get("LFC-2627-HOME"), firstTemplate);
  assert.deepEqual(products, firstProducts);
  assert.equal(firstTemplate.backImageUrl, "/images/personalization/liverpool-home-26-27-back.jpeg");
  assert.deepEqual(firstTemplate.viewBox, [0, 0, 1000, 1000]);
  assert.deepEqual(firstTemplate.name, {
    x: 500, y: 255, fontId: "barlow-condensed-900", fontSize: 80, fontWeight: 900,
    letterSpacing: 4, fill: "#f8f6ed", stroke: "#7d1024", strokeWidth: 3,
  });
  assert.deepEqual(firstTemplate.number, {
    x: 500, y: 605, fontId: "barlow-condensed-900", fontSize: 315, fontWeight: 900,
    letterSpacing: 4, fill: "#f8f6ed", stroke: "#7d1024", strokeWidth: 5,
  });
  assert.deepEqual(firstTemplate.sleeveBadge, {
    x: 789, y: 293, rotate: -15, skewY: 8, scaleX: 0.684, scaleY: 1.032,
    zoomViewBox: [710, 175, 175, 310],
    clipPath: "M 740 175 L 787 175 Q 809 230 816 275 Q 828 335 841 421 L 740 460 Z",
  });
  assert.equal(products[0].personalizationEnabled, true);
  assert.equal(products[0].personalizationGroupId, "LFC-2627-HOME");
  assert.equal(products[1].personalizationEnabled, false);
});
