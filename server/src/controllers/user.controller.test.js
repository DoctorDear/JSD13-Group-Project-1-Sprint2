import test from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.model.js";
import { Product } from "../models/Product.model.js";
import { PersonalizationTemplate } from "../models/PersonalizationTemplate.model.js";
import { addToCart, updateProfile } from "./user.controller.js";

test("profile update persists the chosen district and subdistrict alongside an existing address", async (context) => {
  const user = new User({
    firstName: "Niran", lastName: "Jaidee", email: "niran@example.com", password: "hash",
    addresses: [{
      recipientName: "Niran Jaidee", phone: "0812345678", addressLine: "12 Main Road",
      province: "Bangkok", postalCode: "10200", isDefault: true,
    }],
  });
  context.mock.method(User, "findById", async () => user);
  context.mock.method(user, "save", async () => user);
  let statusCode;
  let body;
  const response = {
    status(code) { statusCode = code; return this; },
    json(payload) { body = payload; return this; },
  };

  await updateProfile(
    { user: { userId: "customer" }, body: { address: { district: "เขตพระนคร", subdistrict: "ชนะสงคราม" } } },
    response,
    (error) => { throw error; },
  );

  assert.equal(statusCode, 200);
  assert.equal(body.user.addresses[0].district, "เขตพระนคร");
  assert.equal(body.user.addresses[0].subdistrict, "ชนะสงคราม");
});

test("cart keeps different jersey personalization separate and merges identical personalization", async (context) => {
  const user = {
    cart: [],
    save: async () => {},
    populate: async () => {},
  };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => personalizedProduct());
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  const add = async (customName, customNumber) => {
    const response = createResponse();
    await addToCart({
      user: { userId: "customer" },
      body: { productId: "jersey", size: "M", quantity: 1, customName, customNumber },
    }, response);
    assert.equal(response.statusCode, 200);
  };

  await add("ALEX", "22");
  await add("JAMIE", "22");
  await add("ALEX", "22");

  assert.equal(user.cart.length, 2);
  assert.deepEqual(user.cart.map(({ customName, customNumber, quantity }) => ({ customName, customNumber, quantity })), [
    { customName: "ALEX", customNumber: "22", quantity: 2 },
    { customName: "JAMIE", customNumber: "22", quantity: 1 },
  ]);
});

test("cart rejects unsafe personalization before saving", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => personalizedProduct());
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  const response = createResponse();
  await addToCart({
    user: { userId: "customer" },
    body: { productId: "jersey", size: "M", quantity: 1, customName: "<script>alert(1)</script>", customNumber: 100 },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(user.cart.length, 0);
});

test("cart prices sleeve badges from the server catalog and keeps badge options separate", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => ({ ...personalizedProduct(), price: 2900 }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());
  const add = async (sleeveBadge, badgePrice) => {
    const response = createResponse();
    await addToCart({
      user: { userId: "customer" },
      body: { productId: "jersey", size: "M", quantity: 1, sleeveBadge, badgePrice, price: 1 },
    }, response);
    assert.equal(response.statusCode, 200);
  };

  await add("premier-league", 99999);
  await add("premier-league-racism", 0);
  await add("premier-league", 0);

  assert.equal(user.cart.length, 2);
  assert.deepEqual(user.cart.map(({ sleeveBadge, badgePrice, price, quantity }) => ({ sleeveBadge, badgePrice, price, quantity })), [
    { sleeveBadge: "premier-league", badgePrice: 450, price: 3350, quantity: 2 },
    { sleeveBadge: "premier-league-racism", badgePrice: 850, price: 3750, quantity: 1 },
  ]);
});

test("cart rejects sleeve badges outside the supported Liverpool home options", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => ({ ...personalizedProduct(), price: 2900 }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => ({ ...activeTemplate(), sleeveBadgeOptions: ["none"] }));

  const response = createResponse();
  await addToCart({
    user: { userId: "customer" },
    body: { productId: "jersey", size: "M", quantity: 1, sleeveBadge: "premier-league", badgePrice: 450 },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(user.cart.length, 0);
});

test("cart rejects unknown sleeve badge IDs for supported products", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => ({ ...personalizedProduct(), price: 2900 }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  const response = createResponse();
  await addToCart({
    user: { userId: "customer" },
    body: { productId: "jersey", size: "M", quantity: 1, sleeveBadge: "golden-badge" },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(user.cart.length, 0);
});

test("cart rejects an empty sleeve badge ID instead of silently treating it as none", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => ({ ...personalizedProduct(), price: 2900 }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  const response = createResponse();
  await addToCart({
    user: { userId: "customer" },
    body: { productId: "jersey", size: "M", quantity: 1, sleeveBadge: "" },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(user.cart.length, 0);
});

test("cart uses template eligibility instead of product-specific badge detection", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => ({ ...personalizedProduct(), price: 2900, name: "Real Madrid Away Jersey", sku: "RM-2026-AWAY" }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  const response = createResponse();
  await addToCart({
    user: { userId: "customer" },
    body: { productId: "jersey", size: "M", quantity: 1, sleeveBadge: "premier-league" },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(user.cart[0].badgePrice, 450);
});

test("cart uppercases names before matching personalized jerseys", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => personalizedProduct());
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  for (const customName of ["alexsmith", "AlexSmith"]) {
    const response = createResponse();
    await addToCart({
      user: { userId: "customer" },
      body: { productId: "jersey", size: "M", quantity: 1, customName, customNumber: "22" },
    }, response);
    assert.equal(response.statusCode, 200);
  }

  assert.equal(user.cart.length, 1);
  assert.equal(user.cart[0].customName, "ALEXSMITH");
  assert.equal(user.cart[0].quantity, 2);
});

test("cart identity includes product and size", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async (id) => ({ ...personalizedProduct(), _id: id }));
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  for (const [productId, size] of [["jersey-a", "M"], ["jersey-a", "L"], ["jersey-b", "M"]]) {
    const response = createResponse();
    await addToCart({
      user: { userId: "customer" },
      body: { productId, size, quantity: 1, customName: "ALEX", customNumber: "10" },
    }, response);
    assert.equal(response.statusCode, 200);
  }
  assert.deepEqual(user.cart.map(({ productId, size, quantity }) => ({ productId, size, quantity })), [
    { productId: "jersey-a", size: "M", quantity: 1 },
    { productId: "jersey-a", size: "L", quantity: 1 },
    { productId: "jersey-b", size: "M", quantity: 1 },
  ]);
});

test("cart preserves zero formatting, reprices submitted choices, and snapshots each personalization charge", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => personalizedProduct());
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  for (const customNumber of ["0", "00"]) {
    const response = createResponse();
    await addToCart({
      user: { userId: "customer" },
      body: { productId: "jersey", size: "M", quantity: 1, customName: "ALEX", customNumber, namePrice: 0, numberPrice: 0, badgePrice: 0, price: 1 },
    }, response);
    assert.equal(response.statusCode, 200);
  }

  assert.deepEqual(user.cart.map(({ customNumber, namePrice, numberPrice, badgePrice, price }) => ({ customNumber, namePrice, numberPrice, badgePrice, price })), [
    { customNumber: "0", namePrice: 320, numberPrice: 350, badgePrice: 0, price: 1310 },
    { customNumber: "00", namePrice: 320, numberPrice: 700, badgePrice: 0, price: 1660 },
  ]);
});

test("cart rejects submitted personalization when product eligibility or its active template is missing", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  let product = personalizedProduct();
  let template = activeTemplate();
  context.mock.method(Product, "findById", async () => product);
  context.mock.method(PersonalizationTemplate, "findOne", async () => template);

  for (const setup of [
    () => { product = { ...personalizedProduct(), personalizationEnabled: false }; },
    () => { product = personalizedProduct(); template = null; },
  ]) {
    setup();
    const response = createResponse();
    await addToCart({ user: { userId: "customer" }, body: { productId: "jersey", size: "M", quantity: 1, customName: "ALEX", customNumber: "7" } }, response);
    assert.equal(response.statusCode, 400);
  }
  assert.equal(user.cart.length, 0);
});

test("cart rejects an incomplete name and number print selection", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => personalizedProduct());
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());
  const response = createResponse();
  await addToCart({ user: { userId: "customer" }, body: { productId: "jersey", size: "M", quantity: 1, customName: "ALEX" } }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(user.cart.length, 0);
});

test("cart rejects surrounding whitespace and Unicode names before normalization", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => personalizedProduct());
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());

  for (const customName of [" ALEX ", "ß", "ﬀ"]) {
    const response = createResponse();
    await addToCart({
      user: { userId: "customer" },
      body: { productId: "jersey", size: "M", quantity: 1, customName, customNumber: "7" },
    }, response);
    assert.equal(response.statusCode, 400, `rejected ${JSON.stringify(customName)}`);
  }
  assert.equal(user.cart.length, 0);
});

test("cart supports badge-only personalization from the matching template", async (context) => {
  const user = { cart: [], save: async () => {}, populate: async () => {} };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => personalizedProduct());
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());
  const response = createResponse();
  await addToCart({ user: { userId: "customer" }, body: { productId: "jersey", size: "M", quantity: 1, sleeveBadge: "premier-league", badgePrice: 1 } }, response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual({ namePrice: user.cart[0].namePrice, numberPrice: user.cart[0].numberPrice, badgePrice: user.cart[0].badgePrice, price: user.cart[0].price }, { namePrice: 0, numberPrice: 0, badgePrice: 450, price: 1090 });
});

test("cart compares legacy numeric numbers as strings without merging 0 and 00", async (context) => {
  const user = {
    cart: [{ productId: "jersey", size: "M", customName: "ALEX", customNumber: 0, sleeveBadge: "none", quantity: 1, price: 100 }],
    save: async () => {}, populate: async () => {},
  };
  context.mock.method(User, "findById", async () => user);
  context.mock.method(Product, "findById", async () => personalizedProduct());
  context.mock.method(PersonalizationTemplate, "findOne", async () => activeTemplate());
  const response = createResponse();
  await addToCart({ user: { userId: "customer" }, body: { productId: "jersey", size: "M", quantity: 1, customName: "ALEX", customNumber: "00" } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(user.cart.length, 2);
  assert.equal(user.cart[0].customNumber, 0);
  assert.equal(user.cart[1].customNumber, "00");
});

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

const activeTemplate = () => ({
  groupId: "LFC-2627-HOME", active: true, backImageUrl: "/back.png", viewBox: [0, 0, 1000, 1000],
  name: { x: 500, y: 255, fontId: "barlow-condensed-900", fontSize: 80, fontWeight: 900, letterSpacing: 4, fill: "#fff", stroke: "#000", strokeWidth: 3 },
  number: { x: 500, y: 605, fontId: "barlow-condensed-900", fontSize: 315, fontWeight: 900, letterSpacing: 4, fill: "#fff", stroke: "#000", strokeWidth: 5 },
  sleeveBadge: { x: 789, y: 293, rotate: -15, skewY: 8, scaleX: 0.684, scaleY: 1.032, zoomViewBox: [710, 175, 175, 310], clipPath: "M 740 175 L 787 175 Z" },
  sleeveBadgeOptions: ["none", "premier-league", "premier-league-racism"],
});

const personalizedProduct = () => ({
  _id: "jersey", isActive: true, price: 640,
  personalizationEnabled: true, personalizationGroupId: "LFC-2627-HOME",
});
