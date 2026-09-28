const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";

function toAsciiDigits(value) {
  return String(value ?? "").replace(/[๐-๙]/g, (digit) => String(THAI_DIGITS.indexOf(digit)));
}

export function normalizeThaiPhone(value) {
  let digits = toAsciiDigits(value).replace(/[^\d]/g, "");
  if (digits.startsWith("66")) digits = `0${digits.slice(2)}`;
  return digits;
}

function requiredText(value, min, max) {
  const text = String(value ?? "").trim();
  return text.length >= min && text.length <= max;
}

function validName(value) {
  return requiredText(value, 2, 80) && /\p{L}/u.test(String(value).trim());
}

export function validateCheckoutForm({ formData, deliveryLocation }) {
  const errors = {};
  const email = String(formData.email ?? "").trim();
  const phone = normalizeThaiPhone(formData.telephone);

  if (!validName(formData.firstName)) errors.firstName = "Enter a valid first name (2–80 characters).";
  if (!validName(formData.lastName)) errors.lastName = "Enter a valid last name (2–80 characters).";
  if (!requiredText(formData.address, 5, 250)) errors.address = "Enter a valid street address (5–250 characters).";
  if (!/^0\d{8,9}$/.test(phone)) errors.telephone = "Enter a valid Thai phone number, for example 0812345678.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!deliveryLocation.province || !deliveryLocation.district || !deliveryLocation.subdistrict || !/^\d{5}$/.test(toAsciiDigits(deliveryLocation.postalCode))) {
    errors.location = "Choose a complete Thai address with province, district, sub-district and postal code.";
  }

  return errors;
}
