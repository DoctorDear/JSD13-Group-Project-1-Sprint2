import { useState } from "react";
import { UserRound } from "lucide-react";

function EditProfilePage({ onCancel, onSave }) {
  const [form, setForm] = useState({
    name: "Somchai K.",
    email: "somchai@example.com",
    phone: "+66 81 234 5678",
    address: "Bangkok, Thailand",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest text-zeta-muted">MY ACCOUNT</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div className="mb-8 flex items-center gap-5">
        <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-zeta-sub-lighter text-zeta-sub-dark">
          <UserRound size={38} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold">Profile Photo</p>
          <p className="mt-0.5 text-xs text-zeta-muted">Click to upload a new photo</p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-zeta-main underline underline-offset-2 hover:opacity-80"
          >
            Change photo
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#4a5551]">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-zeta-main-lighter bg-white px-4 py-2.5 text-sm outline-none transition focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#4a5551]">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-zeta-main-lighter bg-white px-4 py-2.5 text-sm outline-none transition focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#4a5551]">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-zeta-main-lighter bg-white px-4 py-2.5 text-sm outline-none transition focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#4a5551]">
            Shipping Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full resize-none rounded-lg border border-zeta-main-lighter bg-white px-4 py-2.5 text-sm outline-none transition focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="btn rounded-md border-0 bg-zeta-main px-8 text-white shadow-none hover:opacity-90"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn rounded-md border border-zeta-main-lighter bg-white px-8 text-[#4a5551] shadow-none hover:bg-zeta-main-lighter/40"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfilePage;

