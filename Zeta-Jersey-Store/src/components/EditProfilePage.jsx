import { useState } from "react";
import { AlertCircle, CheckCircle2, UserRound } from "lucide-react";

function EditProfilePage({ onCancel, onSave, initialData }) {
  const [form, setForm] = useState({
    name: initialData?.name || "Somchai K.",
    email: initialData?.email || "somchai@example.com",
    phone: initialData?.phone || "0812345678",
    address: initialData?.address || "Bangkok, Thailand",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name": {
        const trimmed = value.trim();
        if (!trimmed) {
          error = "กรุณากรอกชื่อ-นามสกุล (Full name is required)";
        } else if (trimmed.length < 2) {
          error = "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร";
        } else if (trimmed.length > 50) {
          error = "ชื่อต้องมีความยาวไม่เกิน 50 ตัวอักษร";
        }
        break;
      }
      case "email": {
        const trimmed = value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmed) {
          error = "กรุณากรอกอีเมล (Email is required)";
        } else if (!emailRegex.test(trimmed)) {
          error = "รูปแบบอีเมลไม่ถูกต้อง (เช่น example@domain.com)";
        }
        break;
      }
      case "phone": {
        const trimmed = value.trim();
        // รองรับเบอร์ไทย เช่น 0812345678, 081-234-5678, +66812345678
        const cleanPhone = trimmed.replace(/[\s-]/g, "");
        const phoneRegex = /^(\+66|0)[689]\d{8}$/;
        if (!trimmed) {
          error = "กรุณากรอกเบอร์โทรศัพท์ (Phone number is required)";
        } else if (!phoneRegex.test(cleanPhone)) {
          error = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (เช่น 0812345678 หรือ 081-234-5678)";
        }
        break;
      }
      case "address": {
        const trimmed = value.trim();
        if (!trimmed) {
          error = "กรุณากรอกที่อยู่จัดส่ง (Shipping address is required)";
        } else if (trimmed.length < 5) {
          error = "ที่อยู่ต้องมีความยาวอย่างน้อย 5 ตัวอักษร";
        } else if (trimmed.length > 200) {
          error = "ที่อยู่ต้องมีความยาวไม่เกิน 200 ตัวอักษร";
        }
        break;
      }
      default:
        break;
    }
    return error;
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      address: true,
    });

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitted(true);
      onSave({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest text-zeta-muted">MY ACCOUNT</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">Edit Profile</h1>
        <p className="mt-1 text-xs text-zeta-muted">
          จัดการและแก้ไขข้อมูลส่วนตัวของคุณ พร้อมระบบตรวจสอบความถูกต้อง
        </p>
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
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="name" className="block text-xs font-bold text-[#4a5551]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-zeta-muted">{form.name.length}/50</span>
            </div>
            <div className="relative">
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={50}
                placeholder="ชื่อ - นามสกุล"
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition ${
                  touched.name && errors.name
                    ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : touched.name && !errors.name
                    ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    : "border-zeta-main-lighter focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30"
                }`}
              />
              {touched.name && !errors.name && (
                <CheckCircle2 className="absolute right-3 top-3 size-4 text-green-500" />
              )}
            </div>
            {touched.name && errors.name && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="phone" className="block text-xs font-bold text-[#4a5551]">
                Phone Number <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                id="phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0812345678"
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition ${
                  touched.phone && errors.phone
                    ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : touched.phone && !errors.phone
                    ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    : "border-zeta-main-lighter focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30"
                }`}
              />
              {touched.phone && !errors.phone && (
                <CheckCircle2 className="absolute right-3 top-3 size-4 text-green-500" />
              )}
            </div>
            {touched.phone && errors.phone && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="email" className="block text-xs font-bold text-[#4a5551]">
              Email Address <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="relative">
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="example@mail.com"
              className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition ${
                touched.email && errors.email
                  ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : touched.email && !errors.email
                  ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  : "border-zeta-main-lighter focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30"
              }`}
            />
            {touched.email && !errors.email && (
              <CheckCircle2 className="absolute right-3 top-3 size-4 text-green-500" />
            )}
          </div>
          {touched.email && errors.email && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="address" className="block text-xs font-bold text-[#4a5551]">
              Shipping Address <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-zeta-muted">{form.address.length}/200</span>
          </div>
          <div className="relative">
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              maxLength={200}
              placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า เช่น บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              className={`w-full resize-none rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition ${
                touched.address && errors.address
                  ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : touched.address && !errors.address
                  ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  : "border-zeta-main-lighter focus:border-zeta-sub focus:ring-2 focus:ring-zeta-sub/30"
              }`}
            />
            {touched.address && !errors.address && (
              <CheckCircle2 className="absolute right-3 top-3 size-4 text-green-500" />
            )}
          </div>
          {touched.address && errors.address && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errors.address}</span>
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="btn rounded-md border-0 bg-zeta-main px-8 text-white shadow-none hover:opacity-90 transition"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn rounded-md border border-zeta-main-lighter bg-white px-8 text-[#4a5551] shadow-none hover:bg-zeta-main-lighter/40 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfilePage;

