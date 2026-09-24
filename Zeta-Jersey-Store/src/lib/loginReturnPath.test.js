import test from "node:test";
import assert from "node:assert/strict";
import { loginReturnPath } from "./loginReturnPath.js";

test("loginReturnPath preserves the Favorites tab after login", () => {
  assert.equal(
    loginReturnPath({ pathname: "/profile", search: "?tab=favorites", hash: "" }),
    "/profile?tab=favorites",
  );
});

test("loginReturnPath falls back to the store for an unsafe destination", () => {
  assert.equal(loginReturnPath({ pathname: "//other-site.example" }), "/");
  assert.equal(loginReturnPath(null), "/");
});

test("loginReturnPath accepts a saved local destination", () => {
  assert.equal(loginReturnPath("/profile?tab=favorites"), "/profile?tab=favorites");
});
