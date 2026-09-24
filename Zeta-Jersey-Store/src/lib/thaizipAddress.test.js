import test from "node:test";
import assert from "node:assert/strict";
import { addressToFields, fieldsToAddress, isValidLocation } from "./thaizipAddress.js";

const location = {
  province: "Bangkok",
  district: "เขตพระนคร",
  subdistrict: "ชนะสงคราม",
  postalCode: "10200",
};

test("maps a selected thaizip address to the existing backend fields", () => {
  const resolved = fieldsToAddress(location);
  assert.equal(resolved.province, "กรุงเทพมหานคร");
  assert.equal(resolved.districtEn, "Khet Phra Nakhon");
  assert.deepEqual(addressToFields(resolved), location);
});

test("validates the full province, district, subdistrict, and postcode", () => {
  assert.equal(isValidLocation(location), true);
  assert.equal(isValidLocation({ ...location, postalCode: "10500" }), false);
  assert.equal(isValidLocation({ ...location, subdistrict: "" }), false);
});
