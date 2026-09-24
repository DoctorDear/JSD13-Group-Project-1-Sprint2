import { useState } from "react";
import { toProfileForm, validateProfileForm } from "../../lib/profileForm.js";
import ThaiLocationFields from "../ThaiLocationFields.jsx";

const personalFields = [
  { name: "firstName", label: "First name", required: true },
  { name: "lastName", label: "Last name", required: true },
  { name: "phone", label: "Phone number", type: "tel" },
];

const addressFields = [
  { name: "recipientName", label: "Recipient name" },
  { name: "addressPhone", label: "Contact phone", type: "tel" },
  { name: "addressLine", label: "Address line" },
];

function EditProfilePage({ onCancel, onSave, initialData }) {
  const [form, setForm] = useState(() => toProfileForm(initialData));
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const handleLocationChange = (location) => {
    setForm((current) => ({ ...current, ...location }));
    setErrors((current) => ({ ...current, postalCode: "", province: "", district: "", subdistrict: "" }));
    setSaveError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSaveError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProfileForm(form, initialData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    setSaveError("");
    try {
      await onSave(form);
    } catch (error) {
      setSaveError(error.message || "Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = ({ name, label, type = "text", required = false }) => (
    <div key={name}>
      <label htmlFor={name} className="mb-1.5 block text-xs font-bold text-[#4a5551]">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="w-full rounded-lg border border-zeta-main-lighter bg-white px-4 py-2.5 text-sm outline-none focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30 aria-invalid:border-red-500"
      />
      {errors[name] && <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-bold tracking-widest text-zeta-muted">MY ACCOUNT</p>
      <h1 className="mt-1 text-2xl font-black sm:text-3xl">Edit Profile</h1>
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">{personalFields.map(renderField)}</div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-[#4a5551]">Email address</label>
          <input id="email" type="email" value={form.email} readOnly className="w-full rounded-lg border border-zeta-main-lighter bg-gray-50 px-4 py-2.5 text-sm text-zeta-muted" />
          <p className="mt-1 text-xs text-zeta-muted">Email cannot be changed here.</p>
        </div>
        <section aria-labelledby="shipping-address-title" className="border-t border-zeta-main-lighter pt-5">
          <h2 id="shipping-address-title" className="text-base font-bold">Default shipping address</h2>
          <p className="mt-2 text-xs text-zeta-muted">Fill all fields to add an address. You can leave them blank if you do not have one yet.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">{addressFields.map(renderField)}</div>
          <div className="mt-5">
            <ThaiLocationFields
              value={form}
              onChange={handleLocationChange}
              error={errors.subdistrict || errors.district || errors.province || errors.postalCode}
            />
          </div>
        </section>
        {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSaving} className="btn rounded-md border-0 bg-zeta-main px-8 text-white shadow-none disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={onCancel} disabled={isSaving} className="btn rounded-md border border-zeta-main-lighter bg-white px-8 text-[#4a5551] shadow-none disabled:opacity-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default EditProfilePage;
