import test from "node:test";
import assert from "node:assert/strict";
import { normalizeThaiPhone, validateCheckoutForm } from "./checkoutValidation.js";

const validForm = {
  formData: { email: "user@example.com", firstName: "Jane", lastName: "Doe", address: "123 Main Street", telephone: "0812345678" },
  deliveryLocation: { province: "Bangkok", district: "เขตบางรัก", subdistrict: "สีลม", postalCode: "10500" },
};

test("rejects non-phone input and malformed contact email", () => {
  const errors = validateCheckoutForm({
    ...validForm,
    formData: { ...validForm.formData, telephone: "กกกกก", email: "not-an-email" },
  });
  assert.ok(errors.telephone);
  assert.ok(errors.email);
});

test("normalizes Thai numerals and the +66 country prefix", () => {
  assert.equal(normalizeThaiPhone("๐๘๑-๒๓๔-๕๖๗๘"), "0812345678");
  assert.equal(normalizeThaiPhone("+66 81 234 5678"), "0812345678");
});

test("rejects incomplete and malformed delivery fields", () => {
  const errors = validateCheckoutForm({
    formData: { ...validForm.formData, firstName: " ", lastName: "123", address: "abc", telephone: "12345" },
    deliveryLocation: { province: "Bangkok", district: "", subdistrict: "", postalCode: "abc" },
  });
  for (const field of ["firstName", "lastName", "address", "telephone", "location"]) assert.ok(errors[field], `${field} should fail validation`);
});

test("accepts valid checkout fields", () => {
  assert.deepEqual(validateCheckoutForm(validForm), {});
});
