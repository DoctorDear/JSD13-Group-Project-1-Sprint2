const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";

function toAsciiDigits(value) {
  return String(value ?? "").replace(/[๐-๙]/g, (digit) => String(THAI_DIGITS.indexOf(digit)));
}

export function normalizeThaiPhone(value) {
  let digits = toAsciiDigits(value).replace(/[^\d]/g, "");
  if (digits.startsWith("66")) digits = `0${digits.slice(2)}`;
  return digits;
}

export function validateShippingAddress(address) {
  if (!address || typeof address !== "object") return "Shipping address is required";
  const recipientName = String(address.recipientName ?? "").trim();
  const addressLine = String(address.addressLine ?? "").trim();
  if (recipientName.length < 3 || recipientName.length > 161 || !/\p{L}/u.test(recipientName)) return "Enter a valid recipient name";
  if (addressLine.length < 5 || addressLine.length > 250) return "Enter a valid street address";
  if (!/^0\d{8,9}$/.test(normalizeThaiPhone(address.phone))) return "Enter a valid Thai phone number";
  for (const key of ["province", "district", "subdistrict"]) {
    if (typeof address[key] !== "string" || !address[key].trim() || address[key].trim().length > 100) return "Choose a complete Thai delivery address";
  }
  if (!/^\d{5}$/.test(toAsciiDigits(address.postalCode))) return "Enter a valid 5-digit postal code";
  return null;
}
