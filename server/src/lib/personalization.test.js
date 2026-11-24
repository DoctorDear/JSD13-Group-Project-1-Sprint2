import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizePersonalizationName,
  normalizePersonalizationNumber,
  normalizeSleeveBadge,
  samePersonalization,
  normalizeCartPersonalization,
} from "./personalization.js";

test("normalizePersonalizationName uppercases strings and returns empty string otherwise", () => {
  assert.equal(normalizePersonalizationName("salah"), "SALAH");
  assert.equal(normalizePersonalizationName("Messi"), "MESSI");
  assert.equal(normalizePersonalizationName(""), "");
  assert.equal(normalizePersonalizationName(null), "");
  assert.equal(normalizePersonalizationName(undefined), "");
  assert.equal(normalizePersonalizationName(123), "");
});

test("normalizePersonalizationNumber converts numbers/strings to string and keeps null/undefined as null", () => {
  assert.equal(normalizePersonalizationNumber(11), "11");
  assert.equal(normalizePersonalizationNumber("07"), "07");
  assert.equal(normalizePersonalizationNumber(0), "0");
  assert.equal(normalizePersonalizationNumber(null), null);
  assert.equal(normalizePersonalizationNumber(undefined), null);
});

test("normalizeSleeveBadge defaults falsy values to none", () => {
  assert.equal(normalizeSleeveBadge("premier-league"), "premier-league");
  assert.equal(normalizeSleeveBadge(""), "none");
  assert.equal(normalizeSleeveBadge(null), "none");
  assert.equal(normalizeSleeveBadge(undefined), "none");
});

test("samePersonalization matches case-insensitive names, string/number numbers, and default badges", () => {
  assert.equal(
    samePersonalization(
      { customName: "salah", customNumber: 11, sleeveBadge: undefined },
      { customName: "SALAH", customNumber: "11", sleeveBadge: "none" },
    ),
    true,
  );
  assert.equal(
    samePersonalization(
      { customName: "", customNumber: null, sleeveBadge: "none" },
      {},
    ),
    true,
  );
  assert.equal(
    samePersonalization(
      { customName: "SALAH", customNumber: "11", sleeveBadge: "none" },
      { customName: "SALAH", customNumber: "10", sleeveBadge: "none" },
    ),
    false,
  );
  assert.equal(
    samePersonalization(
      { customName: "SALAH", customNumber: "11", sleeveBadge: "ucl" },
      { customName: "SALAH", customNumber: "11", sleeveBadge: "none" },
    ),
    false,
  );
});

test("normalizeCartPersonalization validates name and 1-2 digit number together", () => {
  assert.deepEqual(normalizeCartPersonalization({}), { customName: "", customNumber: null });
  assert.deepEqual(normalizeCartPersonalization({ customName: "", customNumber: "" }), {
    customName: "",
    customNumber: null,
  });
  assert.deepEqual(normalizeCartPersonalization({ customName: "Salah", customNumber: "11" }), {
    customName: "Salah",
    customNumber: "11",
  });

  assert.equal(normalizeCartPersonalization({ customName: "Salah", customNumber: "" }), null);
  assert.equal(normalizeCartPersonalization({ customName: "", customNumber: "11" }), null);
  assert.equal(normalizeCartPersonalization({ customName: "Salah", customNumber: "100" }), null);
  assert.equal(normalizeCartPersonalization({ customName: "Salah", customNumber: "ab" }), null);
  assert.equal(normalizeCartPersonalization({ customName: "Salah", customNumber: 10 }), null);
  assert.equal(normalizeCartPersonalization({ customName: 123, customNumber: "10" }), null);
});
