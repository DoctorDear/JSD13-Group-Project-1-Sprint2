import { useMemo } from "react";
import { ThaiAddressAutocomplete } from "./thai-address-autocomplete.jsx";
import { ThaiAddressCascadeSelect } from "./thai-address-cascade-select.jsx";
import { addressToFields, fieldsToAddress } from "../lib/thaizipAddress.js";

function ThaiLocationFields({ value, onChange, error }) {
  const { province, district, subdistrict, postalCode } = value;
  const selectedAddress = useMemo(
    () => fieldsToAddress({ province, district, subdistrict, postalCode }),
    [province, district, subdistrict, postalCode],
  );
  const handleSelect = (address) => onChange(addressToFields(address));
  const hasLegacyAddress = province && postalCode && !selectedAddress;

  return (
    <div className="space-y-4">
      {hasLegacyAddress && (
        <p className="text-xs text-zeta-muted">
          Saved address: {[district, province, postalCode].filter(Boolean).join(", ")}. Select a complete location to update it.
        </p>
      )}
      <div>
        <label htmlFor="thai-address-search" className="mb-1.5 block text-xs font-bold text-[#4a5551]">
          Find address or postal code
        </label>
        <ThaiAddressAutocomplete
          id="thai-address-search"
          locale="en"
          value={selectedAddress}
          onValueChange={handleSelect}
          texts={{ placeholder: "Search by postcode, province, district, or sub-district" }}
          inputClassName={`h-11 px-4 ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-zeta-main-lighter'}`}
        />
      </div>
      <ThaiAddressCascadeSelect
        locale="en"
        value={selectedAddress}
        onValueChange={handleSelect}
        aria-invalid={Boolean(error)}
        labelClassName="text-xs font-bold text-[#4a5551]"
        triggerClassName={`h-11 px-4 ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-zeta-main-lighter'}`}
      />
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default ThaiLocationFields;
