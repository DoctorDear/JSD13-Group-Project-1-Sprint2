import ThaiLocationFields from "./ThaiLocationFields.jsx";

/**
 * Delivery address selection, recipient inputs, and Thai location fields.
 */
export default function CheckoutDeliverySection({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  formData,
  onChange,
  deliveryLocation,
  onLocationChange,
  fieldErrors,
  saveAddress,
  onSaveAddressChange,
  inputClass,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery</h2>
      <div className="space-y-3">
        {savedAddresses.length > 0 && (
          <div>
            <label htmlFor="saved-address" className="mb-1 block text-sm font-medium text-gray-900">
              Shipping address
            </label>
            <select
              id="saved-address"
              value={selectedAddressId}
              onChange={onSelectAddress}
              className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
            >
              {savedAddresses.map((address) => (
                <option key={address._id} value={address._id}>
                  {address.isDefault ? "Default: " : ""}
                  {address.recipientName} — {address.addressLine}, {address.province} {address.postalCode}
                </option>
              ))}
              <option value="new">Use a new address</option>
            </select>
          </div>
        )}

        <div className="relative">
          <label className="absolute text-[10px] uppercase font-semibold text-gray-400 left-4 top-2 pointer-events-none">
            Country/Region
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={onChange}
            className="w-full h-14 pt-4 pb-1 px-4 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 appearance-none cursor-pointer"
          >
            <option value="Thailand">Thailand</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={onChange}
              placeholder="First name"
              maxLength={80}
              aria-invalid={Boolean(fieldErrors.firstName)}
              className={inputClass("firstName")}
            />
            {fieldErrors.firstName && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {fieldErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={onChange}
              placeholder="Last name"
              maxLength={80}
              aria-invalid={Boolean(fieldErrors.lastName)}
              className={inputClass("lastName")}
            />
            {fieldErrors.lastName && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {fieldErrors.lastName}
              </p>
            )}
          </div>
        </div>

        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={onChange}
          placeholder="Address"
          maxLength={250}
          aria-invalid={Boolean(fieldErrors.address)}
          className={inputClass("address")}
        />
        {fieldErrors.address && (
          <p className="-mt-2 text-xs text-red-600" role="alert">
            {fieldErrors.address}
          </p>
        )}

        <input
          type="text"
          name="apartment"
          value={formData.apartment}
          onChange={onChange}
          placeholder="Apartment, suite, etc (optional)"
          className="w-full h-14 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
        />

        <ThaiLocationFields
          value={deliveryLocation}
          onChange={onLocationChange}
          error={fieldErrors.location}
        />

        <input
          type="tel"
          name="telephone"
          value={formData.telephone}
          onChange={onChange}
          placeholder="Telephone"
          autoComplete="tel"
          maxLength={24}
          aria-invalid={Boolean(fieldErrors.telephone)}
          className={inputClass("telephone")}
        />
        {fieldErrors.telephone && (
          <p className="-mt-2 text-xs text-red-600" role="alert">
            {fieldErrors.telephone}
          </p>
        )}

        {selectedAddressId === "new" && (
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(event) => onSaveAddressChange(event.target.checked)}
              className="w-4 h-4 rounded text-indigo-900 focus:ring-indigo-900"
            />
            Save this address to my account
          </label>
        )}
      </div>
    </div>
  );
}
