import test from "node:test";
import assert from "node:assert/strict";
import { validateProfileUpdate } from "./profile.controller.js";
import userRouter from "../routes/v1/user.routes.js";

test("validateProfileUpdate trims valid fields and rejects invalid or empty inputs", () => {
  const valid = validateProfileUpdate({
    firstName: "  Somchai  ",
    lastName: "  Jaidee ",
    phone: " 081-234-5678 ",
  });
  assert.deepEqual(valid, {
    errors: [],
    updates: {
      firstName: "Somchai",
      lastName: "Jaidee",
      phone: "081-234-5678",
    },
  });

  const shortNames = validateProfileUpdate({
    firstName: "A",
    lastName: "",
    phone: "123",
  });
  assert.deepEqual(shortNames.updates, {});
  assert.equal(shortNames.errors.includes("firstName must be at least 2 characters"), true);
  assert.equal(shortNames.errors.includes("lastName cannot be empty"), true);
  assert.equal(shortNames.errors.includes("phone must be a valid phone number"), true);
  assert.equal(shortNames.errors[0], "Please provide at least one valid field to update");

  const empty = validateProfileUpdate({});
  assert.deepEqual(empty, {
    errors: ["Please provide at least one valid field to update"],
    updates: {},
  });
});

test("user.routes mounts all split domain controller routes cleanly", () => {
  assert.equal(typeof userRouter, "function");
  const routeLayers = userRouter.stack.filter((layer) => layer.route);
  assert.equal(routeLayers.length, 14);
});
