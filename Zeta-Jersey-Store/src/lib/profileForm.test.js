import test from "node:test";
import assert from "node:assert/strict";
import { toProfileView, toProfileForm, validateProfileForm, buildProfileUpdate } from "./profileForm.js";

const profile = {
  firstName: "Niran",
  lastName: "Jaidee",
  email: "niran@example.com",
  phone: "0812345678",
  addresses: [{ _id: "a1", recipientName: "Niran Jaidee", phone: "0812345678", addressLine: "12 Main Road", province: "Bangkok", postalCode: "10110", isDefault: true }],
};

test("uses the default address and preserves separate name fields", () => {
  const view = toProfileView(profile);
  assert.equal(view.name, "Niran Jaidee");
  assert.equal(view.defaultAddress._id, "a1");
  assert.deepEqual(toProfileForm(profile), {
    firstName: "Niran", lastName: "Jaidee", email: "niran@example.com", phone: "0812345678",
    recipientName: "Niran Jaidee", addressPhone: "0812345678", addressLine: "12 Main Road", province: "Bangkok", district: "", subdistrict: "", postalCode: "10110",
  });
});

test("allows saving personal details when the user has no address", () => {
  const form = toProfileForm({ ...profile, addresses: [] });
  assert.deepEqual(validateProfileForm(form), {});
  assert.deepEqual(buildProfileUpdate(form), { firstName: "Niran", lastName: "Jaidee", phone: "0812345678" });
});

test("allows a new user without a phone to change their name", () => {
  const form = toProfileForm({ ...profile, phone: "", addresses: [] });
  assert.deepEqual(validateProfileForm(form), {});
  assert.deepEqual(buildProfileUpdate(form), { firstName: "Niran", lastName: "Jaidee" });
});

test("does not silently ignore removal of an existing phone or address", () => {
  const form = { ...toProfileForm(profile), phone: "", recipientName: "", addressPhone: "", addressLine: "", province: "", postalCode: "" };
  const errors = validateProfileForm(form, profile);
  assert.ok(errors.phone);
  assert.ok(errors.addressLine);
});

test("requires a complete address when any address field is entered", () => {
  const form = { ...toProfileForm({ ...profile, addresses: [] }), addressLine: "12 Main Road" };
  assert.equal(validateProfileForm(form).postalCode, "Required when adding an address");
});

test("sends all address fields and never sends email", () => {
  const form = toProfileForm(profile);
  assert.deepEqual(buildProfileUpdate(form), {
    firstName: "Niran", lastName: "Jaidee", phone: "0812345678",
    address: { recipientName: "Niran Jaidee", phone: "0812345678", addressLine: "12 Main Road", province: "Bangkok", postalCode: "10110" },
  });
});

test("a new address requires a matching district, subdistrict, and postal code", () => {
  const form = {
    ...toProfileForm({ ...profile, addresses: [] }),
    recipientName: "Niran Jaidee", addressPhone: "0812345678", addressLine: "12 Main Road",
    province: "Bangkok", postalCode: "10200", district: "",
  };
  assert.ok(validateProfileForm(form).district);
  assert.ok(validateProfileForm({ ...form, district: "เขตพระนคร" }).subdistrict);
  assert.deepEqual(validateProfileForm({ ...form, district: "เขตพระนคร", subdistrict: "ชนะสงคราม" }), {});
  assert.ok(validateProfileForm({ ...form, district: "เขตดุสิต", subdistrict: "ชนะสงคราม" }).postalCode);
});

test("a saved legacy address without a district stays editable", () => {
  const form = toProfileForm(profile);
  assert.equal(form.district, "");
  assert.deepEqual(validateProfileForm(form, profile), {});
  assert.equal(buildProfileUpdate(form).address.district, undefined);
  assert.equal(buildProfileUpdate(form).address.subdistrict, undefined);
  assert.ok(validateProfileForm({ ...form, postalCode: "10200" }, profile).district);
});

test("sends the selected district and subdistrict when saving a new address", () => {
  const form = {
    ...toProfileForm({ ...profile, addresses: [] }),
    recipientName: "Niran Jaidee", addressPhone: "0812345678", addressLine: "12 Main Road",
    province: "Bangkok", district: "เขตพระนคร", subdistrict: "ชนะสงคราม", postalCode: "10200",
  };
  assert.equal(buildProfileUpdate(form).address.district, "เขตพระนคร");
  assert.equal(buildProfileUpdate(form).address.subdistrict, "ชนะสงคราม");
});

test("rejects an unknown postal code before an address is saved", () => {
  const form = {
    ...toProfileForm({ ...profile, addresses: [] }),
    recipientName: "Niran Jaidee", addressPhone: "0812345678", addressLine: "12 Main Road",
    province: "Bangkok", district: "เขตพระนคร", subdistrict: "ชนะสงคราม", postalCode: "99999",
  };
  assert.equal(validateProfileForm(form).postalCode, "Postal code does not match this location");
});
