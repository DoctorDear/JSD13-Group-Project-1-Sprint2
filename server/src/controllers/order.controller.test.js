import test from "node:test";
import assert from "node:assert/strict";
import Order from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import User from "../models/User.model.js";
import { PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";
import { createOrder } from "./order.controller.js";

const activeTemplate = {
  groupId: "LFC-2627-HOME", active: true, backImageUrl: "/images/back.jpeg", viewBox: [0, 0, 1000, 1000],
  name: { x: 500, y: 250, fontId: "barlow-condensed-900", fontSize: 80, fontWeight: 900, letterSpacing: 4, fill: "#fff", stroke: "#000", strokeWidth: 3 },
  number: { x: 500, y: 600, fontId: "barlow-condensed-900", fontSize: 315, fontWeight: 900, letterSpacing: 4, fill: "#fff", stroke: "#000", strokeWidth: 5 },
  sleeveBadge: { x: 789, y: 293, rotate: -15, skewY: 8, scaleX: 0.684, scaleY: 1.032, zoomViewBox: [710, 175, 175, 310], clipPath: "M 740 175 L 787 175 Q 809 230 816 275 Q 828 335 841 421 L 740 460 Z" },
  sleeveBadgeOptions: ["none", "premier-league", "premier-league-racism"],
};

test("COD checkout uses catalog sleeve badge pricing and persists the price snapshot", async (context) => {
  const user = {
    cart: [{ productId: "jersey", size: "M", quantity: 1, sleeveBadge: "premier-league", badgePrice: 1, price: 1 }],
    save: async () => {},
    populate: async () => user,
  };
  context.mock.method(User, "findById", () => ({ populate: async () => user }));
  context.mock.method(Product, "findById", async () => ({
    _id: "jersey", sku: "LFC-STADIUM", name: "Liverpool FC 2026/27 Home Jersey", groupId: "LFC-2627-HOME",
    price: 2900, quantity: 5, isActive: true, personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME",
  }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate);
  context.mock.method(Product, "findOneAndUpdate", async () => ({ _id: "jersey" }));
  context.mock.method(Order, "create", async (input) => input);
  const response = createResponse();

  await createOrder({
    user: { userId: "customer" },
    body: { shippingAddress: { recipientName: "Jane", phone: "123", addressLine: "Road", province: "Bangkok", postalCode: "10000" } },
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.data.totalAmount, 3350);
  assert.deepEqual(response.body.data.items[0], {
    productId: "jersey", sku: "LFC-STADIUM", name: "Liverpool FC 2026/27 Home Jersey", price: 3350,
    size: "M", quantity: 1, customName: "", customNumber: null, sleeveBadge: "premier-league", namePrice: 0, numberPrice: 0, badgePrice: 450,
  });
});

test("COD checkout re-prices personalization from the active template and ignores cart prices", async (context) => {
  const user = {
    cart: [{ productId: "jersey", size: "M", quantity: 1, customName: "salah", customNumber: "11", sleeveBadge: "premier-league-racism", namePrice: 0, numberPrice: 0, badgePrice: 0, price: 1 }],
    save: async () => {},
    populate: async () => user,
  };
  context.mock.method(User, "findById", () => ({ populate: async () => user }));
  context.mock.method(Product, "findById", async () => ({
    _id: "jersey", sku: "LFC-STADIUM", name: "Liverpool FC 2026/27 Home Jersey", groupId: "LFC-2627-HOME",
    price: 2900, quantity: 5, isActive: true, personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME",
  }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate);
  context.mock.method(Product, "findOneAndUpdate", async () => ({ _id: "jersey" }));
  context.mock.method(Order, "create", async (input) => input);
  const response = createResponse();

  await createOrder({
    user: { userId: "customer" },
    body: { shippingAddress: { recipientName: "Jane", phone: "123", addressLine: "Road", province: "Bangkok", postalCode: "10000" } },
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.data.totalAmount, 4850);
  assert.deepEqual(response.body.data.items[0], {
    productId: "jersey", sku: "LFC-STADIUM", name: "Liverpool FC 2026/27 Home Jersey", price: 4850,
    size: "M", quantity: 1, customName: "SALAH", customNumber: "11", sleeveBadge: "premier-league-racism",
    namePrice: 400, numberPrice: 700, badgePrice: 850,
  });
});

test("COD checkout rejects personalization when the active template is unavailable", async (context) => {
  const user = { cart: [{ productId: "jersey", size: "M", quantity: 1, customName: "SALAH", customNumber: "11" }], save: async () => {}, populate: async () => user };
  context.mock.method(User, "findById", () => ({ populate: async () => user }));
  context.mock.method(Product, "findById", async () => ({ _id: "jersey", sku: "LFC-STADIUM", name: "Liverpool Home", price: 2900, quantity: 5, isActive: true, personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => ({ ...activeTemplate, active: false }));
  let reserved = false;
  context.mock.method(Product, "findOneAndUpdate", async () => { reserved = true; return { _id: "jersey" }; });
  const response = createResponse();

  await createOrder({ user: { userId: "customer" }, body: { shippingAddress: {} } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(reserved, false);
});

test("COD checkout applies the catalog price for every badge choice on printed shirts", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => user };
  context.mock.method(User, "findById", () => ({ populate: async () => user }));
  context.mock.method(Product, "findById", async () => ({ _id: "jersey", sku: "LFC-STADIUM", name: "Liverpool Home", price: 2900, quantity: 20, isActive: true, personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate);
  context.mock.method(Product, "findOneAndUpdate", async () => ({ _id: "jersey" }));
  context.mock.method(Order, "create", async (input) => input);

  for (const [sleeveBadge, expectedPrice] of [["none", 4000], ["premier-league", 4450], ["premier-league-racism", 4850]]) {
    user.cart = [{ productId: "jersey", size: "M", quantity: 1, customName: "salah", customNumber: "11", sleeveBadge }];
    const response = createResponse();
    await createOrder({ user: { userId: "customer" }, body: { shippingAddress: {} } }, response);
    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.totalAmount, expectedPrice);
    assert.equal(response.body.data.items[0].price, expectedPrice);
  }
});

test("COD prices each line immediately before reserving it and rolls back when a later template is inactive", async (context) => {
  const user = {
    cart: [
      { productId: "first", size: "M", quantity: 1, customName: "SALAH", customNumber: "11" },
      { productId: "second", size: "L", quantity: 1, customName: "SALAH", customNumber: "11" },
    ],
    save: async () => {},
    populate: async () => user,
  };
  const events = [];
  context.mock.method(User, "findById", () => ({ populate: async () => user }));
  context.mock.method(Product, "findById", async (id) => ({ _id: id, sku: id, name: "Liverpool Home", price: 2900, quantity: 5, isActive: true, personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME" }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => {
    events.push("resolve");
    return events.filter((event) => event === "resolve").length === 1 ? activeTemplate : { ...activeTemplate, active: false };
  });
  context.mock.method(Product, "findOneAndUpdate", async () => { events.push("reserve"); return { _id: "first" }; });
  context.mock.method(Product, "findByIdAndUpdate", async () => { events.push("rollback"); });
  const response = createResponse();

  await createOrder({ user: { userId: "customer" }, body: { shippingAddress: {} } }, response);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(events, ["resolve", "reserve", "resolve", "rollback"]);
});

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}
