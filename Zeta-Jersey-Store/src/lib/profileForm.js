import { isValidLocation } from "./thaizipAddress.js";

const addressFields = ["recipientName", "addressPhone", "addressLine", "province", "district", "subdistrict", "postalCode"];
const requiredAddressFields = addressFields.filter((field) => !["district", "subdistrict"].includes(field));

export function toProfileView(profile) {
  if (!profile) return null;
  const defaultAddress = profile.addresses?.find((address) => address.isDefault) ?? null;
  return {
    ...profile,
    name: [profile.firstName, profile.lastName].filter(Boolean).join(" "),
    defaultAddress,
    address: defaultAddress
      ? [defaultAddress.addressLine, defaultAddress.subdistrict, defaultAddress.district, defaultAddress.province, defaultAddress.postalCode].filter(Boolean).join(", ")
      : "",
  };
}

export function toProfileForm(profile) {
  const address = profile.addresses?.find((item) => item.isDefault);
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    recipientName: address?.recipientName ?? "",
    addressPhone: address?.phone ?? "",
    addressLine: address?.addressLine ?? "",
    province: address?.province ?? "",
    district: address?.district ?? "",
    subdistrict: address?.subdistrict ?? "",
    postalCode: address?.postalCode ?? "",
  };
}

export function validateProfileForm(form, originalProfile = null) {
  const errors = {};
  for (const field of ["firstName", "lastName"]) {
    if (!form[field]?.trim() || form[field].trim().length < 2) {
      errors[field] = "Enter at least 2 characters";
    }
  }
  const phone = form.phone?.replace(/\D/g, "") ?? "";
  if (form.phone?.trim() && (phone.length < 9 || phone.length > 15)) {
    errors.phone = "Enter a valid phone number";
  } else if (!form.phone?.trim() && originalProfile?.phone) {
    errors.phone = "Phone cannot be removed here";
  }

  const originalAddress = originalProfile?.addresses?.find((item) => item.isDefault);
  const hasAddress = addressFields.some((field) => form[field]?.trim()) || Boolean(originalAddress);
  if (hasAddress) {
    for (const field of requiredAddressFields) {
      if (!form[field]?.trim()) errors[field] = "Required when adding an address";
    }
    const locationChanged = !originalAddress || ["province", "district", "subdistrict", "postalCode"].some(
      (field) => (form[field] ?? "").trim() !== (originalAddress[field] ?? "").trim(),
    );
    if (locationChanged) {
      if (!form.district?.trim()) {
        errors.district = "Select a district";
      }
      if (!form.subdistrict?.trim()) {
        errors.subdistrict = "Select a sub-district";
      }
      if (form.postalCode?.trim() && !/^\d{5}$/.test(form.postalCode.trim())) {
        errors.postalCode = "Enter a 5-digit postal code";
      } else if (form.province?.trim() && form.district?.trim() && form.subdistrict?.trim() &&
        form.postalCode?.trim() && !isValidLocation(form)) {
        errors.postalCode = "Postal code does not match this location";
      }
    }
    const addressPhone = form.addressPhone?.replace(/\D/g, "") ?? "";
    if (form.addressPhone?.trim() && (addressPhone.length < 9 || addressPhone.length > 15)) {
      errors.addressPhone = "Enter a valid phone number";
    }
  }
  return errors;
}

export function buildProfileUpdate(form) {
  const update = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
  };
  if (form.phone.trim()) update.phone = form.phone.trim();
  if (addressFields.some((field) => form[field]?.trim())) {
    update.address = {
      recipientName: form.recipientName.trim(),
      phone: form.addressPhone.trim(),
      addressLine: form.addressLine.trim(),
      province: form.province.trim(),
      postalCode: form.postalCode.trim(),
    };
    if (form.district?.trim()) update.address.district = form.district.trim();
    if (form.subdistrict?.trim()) update.address.subdistrict = form.subdistrict.trim();
  }
  return update;
}
