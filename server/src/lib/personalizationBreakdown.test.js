import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import { getPersonalizationBreakdown } from "../../../Zeta-Jersey-Store/src/lib/personalizationBreakdown.js";

test("breakdown recovers component prices defaulted by Mongoose for legacy personalized orders", () => {
  const order = Order.hydrate({
    orderNumber: "ZT-LEGACY",
    userId: new mongoose.Types.ObjectId(),
    totalAmount: 4180,
    items: [{
      productId: new mongoose.Types.ObjectId(),
      sku: "LFC-STADIUM",
      name: "Liverpool Home Jersey",
      size: "M",
      quantity: 1,
      customName: "I",
      customNumber: 0,
      sleeveBadge: "premier-league",
      price: 4180,
    }],
  });
  const item = order.items[0];

  assert.equal(item.namePrice, 0);
  assert.equal(item.numberPrice, 0);
  assert.equal(item.badgePrice, 0);
  assert.equal(item.$isDefault("namePrice"), true);
  assert.deepEqual(getPersonalizationBreakdown(item), {
    name: "I", number: "0", badgeLabel: "Premier League",
    basePrice: 3300, namePrice: 80, numberPrice: 350, badgePrice: 450, unitPrice: 4180,
  });
});

test("breakdown preserves Mongoose default zeros for a plain legacy order item", () => {
  const order = Order.hydrate({
    orderNumber: "ZT-PLAIN",
    userId: new mongoose.Types.ObjectId(),
    totalAmount: 1200,
    items: [{
      productId: new mongoose.Types.ObjectId(),
      sku: "PLAIN-SHIRT",
      name: "Plain Jersey",
      size: "M",
      quantity: 1,
      price: 1200,
    }],
  });

  const item = order.items[0];
  assert.deepEqual(getPersonalizationBreakdown(item), {
    name: "", number: "", badgeLabel: "",
    basePrice: 1200, namePrice: 0, numberPrice: 0, badgePrice: 0, unitPrice: 1200,
  });
});
