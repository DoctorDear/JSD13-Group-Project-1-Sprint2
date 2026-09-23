import test from "node:test";
import assert from "node:assert/strict";
import { authUserFromResponse } from "./authUser.js";

test("accepts the backend's authenticated user response", () => {
  const user = { _id: "507f1f77bcf86cd799439011", email: "fan@example.com" };
  assert.equal(authUserFromResponse({ success: true, user }), user);
});

test("does not treat the SPA fallback response as a signed-in user", () => {
  assert.equal(authUserFromResponse({ message: "<!doctype html>" }), null);
});

test("does not treat an API error as a signed-in user", () => {
  assert.equal(authUserFromResponse({ success: false, message: "Unauthorized" }), null);
});
