import test from "node:test";
import assert from "node:assert/strict";
import { reserveAndPriceItems, rollbackReservedStock } from "./checkoutReservation.js";

function makeProduct(overrides = {}) {
  return {
    _id: "prod-1",
    sku: "SKU-1",
    name: "Zeta Home Jersey",
    size: "M",
    price: 2500,
    quantity: 5,
    isActive: true,
    personalizationEnabled: true,
    personalizationGroupId: "group-1",
    ...overrides,
  };
}

test("reserveAndPriceItems queries Product once per item, prices personalization, and reserves stock (COD)", async () => {
  let findByIdCalls = 0;
  const reserveCalls = [];
  const templateObj = {
    groupId: "group-1",
    active: true,
    sleeveBadges: [{ key: "premier-league", price: 150 }],
  };

  const ProductModel = {
    async findById(id) {
      findByIdCalls += 1;
      assert.equal(id, "prod-1");
      return makeProduct();
    },
    async findOneAndUpdate(filter, update) {
      reserveCalls.push({ filter, update });
      return makeProduct({ quantity: 3 });
    },
    async findByIdAndUpdate() {
      throw new Error("rollback should not be called on success");
    },
  };

  const result = await reserveAndPriceItems(
    [
      {
        _id: "cart-item-1",
        productId: { _id: "prod-1" },
        size: "L",
        quantity: 2,
        customName: "salah",
        customNumber: 11,
        sleeveBadge: "premier-league",
      },
    ],
    {
      mode: "cod",
      deps: {
        ProductModel,
        resolveTemplate: async () => templateObj,
        priceItem: ({ product, customName, customNumber, sleeveBadge }) => {
          assert.equal(product._id, "prod-1");
          assert.equal(customName, "salah");
          assert.equal(customNumber, "11");
          assert.equal(sleeveBadge, "premier-league");
          return {
            customName: "SALAH",
            customNumber: "11",
            namePrice: 400,
            numberPrice: 700,
            sleeveBadge: "premier-league",
            badgePrice: 150,
            unitPrice: 3750,
          };
        },
      },
    },
  );

  assert.equal(findByIdCalls, 1);
  assert.equal(result.ok, true);
  assert.equal(result.totalAmount, 7500);
  assert.equal(result.items.length, 1);
  assert.equal(result.reserved.length, 1);
  assert.deepEqual(result.items[0], {
    productId: "prod-1",
    sku: "SKU-1",
    name: "Zeta Home Jersey",
    price: 3750,
    size: "L",
    quantity: 2,
    customName: "SALAH",
    customNumber: "11",
    sleeveBadge: "premier-league",
    namePrice: 400,
    numberPrice: 700,
    badgePrice: 150,
  });
  assert.deepEqual(reserveCalls, [
    {
      filter: { _id: "prod-1", quantity: { $gte: 2 } },
      update: { $inc: { quantity: -2 } },
    },
  ]);
});

test("reserveAndPriceItems preserves existing pricing on Stripe retry without calling resolveTemplate", async () => {
  let resolveCalled = false;
  let priceCalled = false;

  const ProductModel = {
    async findById() {
      return makeProduct({ price: 9999 });
    },
    async findOneAndUpdate() {
      return makeProduct();
    },
  };

  const result = await reserveAndPriceItems(
    [
      {
        _id: "order-item-1",
        productId: "prod-1",
        size: "XL",
        price: 2900,
        quantity: 1,
        customName: "SON",
        customNumber: "7",
        sleeveBadge: "ucl",
        namePrice: 240,
        numberPrice: 350,
        badgePrice: 100,
      },
    ],
    {
      mode: "stripe",
      preservePricing: true,
      includeCartItemId: false,
      deps: {
        ProductModel,
        resolveTemplate: async () => {
          resolveCalled = true;
          return null;
        },
        priceItem: () => {
          priceCalled = true;
          return null;
        },
      },
    },
  );

  assert.equal(result.ok, true);
  assert.equal(resolveCalled, false);
  assert.equal(priceCalled, false);
  assert.equal(result.totalAmount, 2900);
  assert.equal("cartItemId" in result.items[0], false);
  assert.equal(result.items[0].price, 2900);
  assert.equal(result.items[0].customName, "SON");
  assert.equal(result.items[0].namePrice, 240);
});

test("reserveAndPriceItems includes cartItemId for new Stripe cart checkouts", async () => {
  const ProductModel = {
    async findById() {
      return makeProduct({ personalizationEnabled: false, personalizationGroupId: "" });
    },
    async findOneAndUpdate() {
      return makeProduct();
    },
  };

  const result = await reserveAndPriceItems(
    [{ _id: "cart-entry-99", productId: "prod-1", quantity: 1 }],
    {
      mode: "stripe",
      preservePricing: false,
      includeCartItemId: true,
      deps: {
        ProductModel,
        resolveTemplate: async () => null,
      },
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.items[0].cartItemId, "cart-entry-99");
  assert.equal(result.items[0].price, 2500);
});

test("reserveAndPriceItems rolls back already reserved items when a subsequent atomic update fails", async () => {
  const rollbackCalls = [];
  let reserveAttempt = 0;

  const ProductModel = {
    async findById(id) {
      return makeProduct({
        _id: id,
        name: id === "prod-1" ? "First Jersey" : "Second Jersey",
        personalizationEnabled: false,
      });
    },
    async findOneAndUpdate({ _id }) {
      reserveAttempt += 1;
      if (_id === "prod-1") return makeProduct({ _id });
      return null;
    },
    async findByIdAndUpdate(id, update) {
      rollbackCalls.push({ id, update });
    },
  };

  const cart = [
    { productId: "prod-1", quantity: 2 },
    { productId: "prod-2", quantity: 3 },
  ];

  const codResult = await reserveAndPriceItems(cart, {
    mode: "cod",
    deps: { ProductModel, resolveTemplate: async () => null },
  });

  assert.deepEqual(codResult, {
    ok: false,
    status: 400,
    message: "Insufficient stock for product: Second Jersey",
  });
  assert.equal(reserveAttempt, 2);
  assert.deepEqual(rollbackCalls, [
    { id: "prod-1", update: { $inc: { quantity: 2 } } },
  ]);

  rollbackCalls.length = 0;
  const stripeResult = await reserveAndPriceItems(cart, {
    mode: "stripe",
    deps: { ProductModel, resolveTemplate: async () => null },
  });

  assert.deepEqual(stripeResult, {
    ok: false,
    status: 409,
    message: "Insufficient stock for Second Jersey",
  });
  assert.deepEqual(rollbackCalls, [
    { id: "prod-1", update: { $inc: { quantity: 2 } } },
  ]);
});

test("reserveAndPriceItems rejects invalid items in Pass 1 without reserving stock", async () => {
  let reserveCalled = false;
  const ProductModelFactory = (product) => ({
    async findById() {
      return product;
    },
    async findOneAndUpdate() {
      reserveCalled = true;
      return product;
    },
  });

  const missingCod = await reserveAndPriceItems([{ productId: "missing", quantity: 1 }], {
    mode: "cod",
    deps: { ProductModel: ProductModelFactory(null), resolveTemplate: async () => null },
  });
  assert.deepEqual(missingCod, { ok: false, status: 404, message: "Product not found" });

  const inactiveStripe = await reserveAndPriceItems([{ productId: "inactive", quantity: 1 }], {
    mode: "stripe",
    deps: { ProductModel: ProductModelFactory(makeProduct({ isActive: false })), resolveTemplate: async () => null },
  });
  assert.deepEqual(inactiveStripe, { ok: false, status: 400, message: "An item is unavailable or invalid" });

  const noTemplate = await reserveAndPriceItems(
    [{ productId: "prod-1", quantity: 1, customName: "MESSI", customNumber: "10" }],
    {
      mode: "cod",
      deps: { ProductModel: ProductModelFactory(makeProduct()), resolveTemplate: async () => null },
    },
  );
  assert.deepEqual(noTemplate, {
    ok: false,
    status: 400,
    message: "Personalization is not available for this product",
  });

  const invalidPersonalizationCod = await reserveAndPriceItems(
    [{ productId: "prod-1", quantity: 1, customName: "BAD123" }],
    {
      mode: "cod",
      deps: {
        ProductModel: ProductModelFactory(makeProduct()),
        resolveTemplate: async () => ({ groupId: "group-1", active: true }),
        priceItem: () => null,
      },
    },
  );
  assert.deepEqual(invalidPersonalizationCod, {
    ok: false,
    status: 400,
    message: "Invalid personalization choices",
  });

  const invalidPersonalizationStripe = await reserveAndPriceItems(
    [{ productId: "prod-1", quantity: 1, customName: "BAD123" }],
    {
      mode: "stripe",
      deps: {
        ProductModel: ProductModelFactory(makeProduct()),
        resolveTemplate: async () => ({ groupId: "group-1", active: true }),
        priceItem: () => null,
      },
    },
  );
  assert.deepEqual(invalidPersonalizationStripe, {
    ok: false,
    status: 400,
    message: "An item has invalid personalization choices",
  });

  assert.equal(reserveCalled, false);
});

test("rollbackReservedStock restores all reserved quantities and clears the array", async () => {
  const updates = [];
  const reserved = [
    { productId: "prod-1", quantity: 1 },
    { productId: "prod-2", quantity: 4 },
  ];
  const ProductModel = {
    async findByIdAndUpdate(id, update) {
      updates.push({ id, update });
    },
  };

  await rollbackReservedStock(reserved, ProductModel);

  assert.deepEqual(updates, [
    { id: "prod-1", update: { $inc: { quantity: 1 } } },
    { id: "prod-2", update: { $inc: { quantity: 4 } } },
  ]);
  assert.equal(reserved.length, 0);
});
