import test from "node:test";
import assert from "node:assert/strict";
import { normalizeApiBase, normalizeApiPath } from "./apiBase.js";

test("adds the backend version to an /api base", () => {
  assert.equal(normalizeApiBase("http://localhost:3001/api"), "http://localhost:3001/api/v1");
  assert.equal(normalizeApiBase("/api/"), "/api/v1");
});

test("does not duplicate an existing backend version", () => {
  assert.equal(normalizeApiBase("https://example.com/api/v1"), "https://example.com/api/v1");
});

test("does not duplicate the version when a caller includes it in the path", () => {
  assert.equal(normalizeApiPath("/v1/products"), "/products");
  assert.equal(normalizeApiPath("/products"), "/products");
  assert.equal(normalizeApiPath("products"), "/products");
});
