import test from "node:test";
import assert from "node:assert/strict";
import { normalizeThaiPhone, validateShippingAddress } from "./shippingAddressValidation.js";

const validAddress = {
  recipientName: "Jane Doe",
  phone: "0812345678",
  addressLine: "123 Main Street",
  province: "Bangkok",
  district: "เขตบางรัก",
  subdistrict: "สีลม",
  postalCode: "10500",
};

test("rejects invalid phone, address, or location fields", () => {
  for (const patch of [
    { phone: "กกกกก" },
    { phone: "0812345678ก" },
    { phone: "12345" },
    { addressLine: "abc" },
    { recipientName: "12345" },
    { district: " " },
    { postalCode: "ABCDE" },
  ]) assert.ok(validateShippingAddress({ ...validAddress, ...patch }));
});

test("accepts complete address and normalizes Thai phone formats", () => {
  assert.equal(validateShippingAddress(validAddress), null);
  assert.equal(normalizeThaiPhone("๐๘๑-๒๓๔-๕๖๗๘"), "0812345678");
  assert.equal(normalizeThaiPhone("+66 81 234 5678"), "0812345678");
});
