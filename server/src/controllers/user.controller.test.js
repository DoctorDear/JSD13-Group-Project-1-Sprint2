import test from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.model.js";
import { updateProfile } from "./user.controller.js";

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
