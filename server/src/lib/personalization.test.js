import test from "node:test";
import assert from "node:assert/strict";
import { pricePersonalization } from "./personalization.js";

const product = { name: "Any Club Home Shirt", price: 2400 };
const template = {
  groupId: "ANY-CLUB-HOME",
  active: true,
  sleeveBadgeOptions: ["none", "premier-league", "premier-league-racism"],
};

test("prices one-letter and one-digit personalization", () => {
  assert.deepEqual(pricePersonalization({
    product,
    template,
    printEnabled: true,
    customName: "I",
    customNumber: "7",
  }), {
    customName: "I",
    customNumber: "7",
    namePrice: 80,
    numberPrice: 350,
    sleeveBadge: "none",
    badgePrice: 0,
    customizationPrice: 430,
    unitPrice: 2830,
  });
});

test("normalizes lowercase names and prices every letter and two printed digits", () => {
  const result = pricePersonalization({
    product,
    template,
    printEnabled: true,
    customName: "salah",
    customNumber: "11",
  });
  assert.equal(result.customName, "SALAH");
  assert.equal(result.customNumber, "11");
  assert.equal(result.namePrice, 400);
  assert.equal(result.numberPrice, 700);
});

test("preserves 0 and 00 as distinct printed number strings", () => {
  for (const customNumber of ["0", "00"]) {
    const result = pricePersonalization({ product, template, printEnabled: true, customName: "I", customNumber });
    assert.equal(result.customNumber, customNumber);
    assert.equal(result.numberPrice, customNumber.length === 1 ? 350 : 700);
  }
});

test("clears all print choices and prices when printing is disabled", () => {
  assert.deepEqual(pricePersonalization({
    product,
    template,
    printEnabled: false,
    customName: "SALAH",
    customNumber: "11",
  }), {
    customName: "",
    customNumber: null,
    namePrice: 0,
    numberPrice: 0,
    sleeveBadge: "none",
    badgePrice: 0,
    customizationPrice: 0,
    unitPrice: 2400,
  });
});

test("prices a supported badge without printing and includes all surcharges", () => {
  const result = pricePersonalization({
    product,
    template,
    printEnabled: false,
    sleeveBadge: "premier-league-racism",
  });
  assert.equal(result.customName, "");
  assert.equal(result.customNumber, null);
  assert.equal(result.badgePrice, 850);
  assert.equal(result.customizationPrice, 850);
  assert.equal(result.unitPrice, 3250);
});

test("ignores browser supplied price fields", () => {
  const result = pricePersonalization({
    product: { ...product, price: 1000 },
    template,
    printEnabled: true,
    customName: "I",
    customNumber: "7",
    namePrice: 0,
    numberPrice: 0,
    badgePrice: 999999,
    customizationPrice: 0,
    unitPrice: 1,
  });
  assert.equal(result.namePrice, 80);
  assert.equal(result.numberPrice, 350);
  assert.equal(result.badgePrice, 0);
  assert.equal(result.customizationPrice, 430);
  assert.equal(result.unitPrice, 1430);
});

test("rejects missing print pairs and invalid names or numbers", () => {
  const invalid = [
    { customName: "I", customNumber: "" },
    { customName: "", customNumber: "7" },
    { customName: "I", customNumber: undefined },
    { customName: "", customNumber: "" },
    ...["A B", " A", "A ", "É", "ก", "A!", "A1", "A-", "A'", "A".repeat(21)].map((customName) => ({ customName, customNumber: "7" })),
    ...["", "123", "1x", " 7", "7 ", "-1", "１"].map((customNumber) => ({ customName: "I", customNumber })),
  ];

  for (const choices of invalid) {
    assert.equal(pricePersonalization({ product, template, printEnabled: true, ...choices }), null, JSON.stringify(choices));
  }
});

test("rejects badges not supported by the resolved template", () => {
  assert.equal(pricePersonalization({
    product: { ...product, name: "Liverpool Home" },
    template: { ...template, sleeveBadgeOptions: ["none"] },
    printEnabled: false,
    sleeveBadge: "premier-league",
  }), null);
  assert.equal(pricePersonalization({ product, template, printEnabled: false, sleeveBadge: "unsupported" }), null);
});
