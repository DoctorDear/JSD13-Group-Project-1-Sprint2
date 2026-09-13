import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import React from 'react';
import logo from "../assets/logo/Zeta_Green_and_Jersey_Logo.png"; // นำเข้าไฟล์รูปภาพ

const INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  agree: true,
};

/* ---------------- กฎการตรวจสอบ ---------------- */
function validate(values) {
  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "กรุณากรอกชื่อ";
  } else if (values.firstName.trim().length < 2) {
    errors.firstName = "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "กรุณากรอกนามสกุล";
  } else if (values.lastName.trim().length < 2) {
    errors.lastName = "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร";
  }

  if (!values.email.trim()) {
    errors.email = "กรุณากรอกอีเมล";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  if (!values.password) {
    errors.password = "กรุณากรอกรหัสผ่าน";
  } else if (values.password.length < 8) {
    errors.password = "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร";
  } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข";
  }

  if (!values.agree) {
    errors.agree = "กรุณายอมรับเงื่อนไขการใช้งาน";
  }

  return errors;
}

/* ---------------- ความแข็งแรงของรหัสผ่าน ---------------- */
function passwordStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: "อ่อน", color: "bg-red-500", width: "w-1/3", text: "text-red-600" };
  if (score <= 4) return { label: "ปานกลาง", color: "bg-amber-500", width: "w-2/3", text: "text-amber-600" };
  return { label: "แข็งแรง", color: "bg-green-600", width: "w-full", text: "text-green-700" };
}

export default function Register() {
  const navigate = useNavigate();

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strength = passwordStrength(values.password);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const next = { ...values, [name]: type === "checkbox" ? checked : value };
    setValues(next);

    // เช็คใหม่ทันที เฉพาะช่องที่เคยโดน error แล้ว
    if (touched[name]) {
      setErrors(validate(next));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validate(values);
    setErrors(found);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      agree: true,
    });

    if (Object.keys(found).length > 0) {
      // โฟกัสช่องแรกที่ผิด
      const firstKey = Object.keys(found)[0];
      document.getElementById(firstKey)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      // TODO: เรียก API สมัครสมาชิกที่นี่
      await new Promise((r) => setTimeout(r, 1200));
      navigate("/email-confirmation");
    } catch {
      setErrors({ form: "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid place-items-center px-5 py-10 font-[Poppins,'Segoe_UI',system-ui,sans-serif] bg-[linear-gradient(115deg,#3b0f96_0%,#6d2ae2_45%,#8b7bff_100%)]">
      <div className="w-[min(1180px,100%)] bg-white rounded-[26px] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.25)] grid grid-cols-1 lg:grid-cols-[0.88fr_1fr] gap-8">

        {/* ===== ฝั่งซ้าย: รูปภาพ ===== */}
        <div className="relative rounded-[20px] overflow-hidden min-h-[320px] lg:min-h-[640px]">
          <img
            src="https://plus.unsplash.com/premium_photo-1676736592730-bfd847c0c8c8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="นักฟุตบอลชุดเหลืองนั่งอยู่ข้างลูกบอล"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-6 top-6 flex items-center justify-between gap-3">
            <Logo />
            <Link
              to="/"
              className="rounded-full bg-[#b0b81f]/90 px-6 py-3 text-sm font-bold text-white backdrop-blur-[4px] transition duration-200 hover:bg-[#b0b81f] hover:-translate-y-0.5"
            >
              Back to website
            </Link>
          </div>
        </div>

        {/* ===== ฝั่งขวา: ข้อความ + ฟอร์ม ===== */}
        <div className="flex flex-col justify-center px-2 lg:px-6">
          <h1 className="text-[clamp(42px,5vw,64px)] font-extrabold leading-none tracking-[-2px] text-black [text-shadow:3px_3px_0_rgba(0,0,0,0.18)]">
            Register
          </h1>

          <p className="mt-4 text-xl text-black">
            Already have account?{" "}
            <Link to="/login" className="underline underline-offset-[3px]">Log in</Link>
          </p>

          <form className="mt-3" onSubmit={handleSubmit} noValidate>
            {/* error ระดับฟอร์ม */}
            {errors.form && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                id="firstName"
                label="First name"
                placeholder="First name"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && errors.firstName}
              />
              <Field
                id="lastName"
                label="Last name"
                placeholder="Last name"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && errors.lastName}
              />
            </div>

            <div className="mt-3">
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="Your email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email}
              />
            </div>

            <div className="mt-3">
              <Field
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#2a1080] hover:underline"
                  >
                    {showPassword ? "ซ่อน" : "แสดง"}
                  </button>
                }
              />

              {/* แถบความแข็งแรงของรหัสผ่าน */}
              {values.password && !errors.password && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <span className={`text-sm font-medium ${strength.text}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Checkbox */}
            <div className="mt-9">
              <label className="flex items-center gap-4 cursor-pointer select-none">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  checked={values.agree}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(touched.agree && errors.agree)}
                  className={`h-7 w-7 shrink-0 cursor-pointer appearance-none rounded-[3px] border-[3px] bg-white bg-center bg-no-repeat bg-[length:20px_20px] checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22black%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%2220 6 9 17 4 12%22/></svg>')] ${
                    touched.agree && errors.agree ? "border-red-500" : "border-black"
                  }`}
                />
                <span className="text-xl text-black">
                  I&apos;m agree to the Term &amp; Condition
                </span>
              </label>
              {touched.agree && errors.agree && (
                <p className="mt-1.5 text-sm text-red-600">{errors.agree}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-[6px] bg-[#2a1080] py-5 text-xl font-semibold text-white transition duration-200 hover:bg-[#37149c] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#2a1080]/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-[#2a1080]"
            >
              {submitting ? "กำลังสมัคร…" : "Create account"}
            </button>
          </form>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <SocialButton label="Google" icon={<GoogleIcon />} />
            <SocialButton label="Apple" icon={<AppleIcon />} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function Field({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  rightSlot,
}) {
  const hasError = Boolean(error);

  return (
    <div>
      <label htmlFor={id} className="block text-xl text-black">{label}</label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`mt-1.5 w-full rounded-[6px] px-6 py-5 text-lg text-gray-800 placeholder:text-[#6b6b6b] outline-none transition ${
            rightSlot ? "pr-20" : ""
          } ${
            hasError
              ? "bg-red-50 ring-2 ring-red-400 focus:ring-red-500"
              : "bg-[#d9d9d9] focus:ring-2 focus:ring-[#2a1080]/40"
          }`}
        />
        {rightSlot}
      </div>

      {hasError && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function SocialButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-4 rounded-[6px] bg-[#2a1080] py-4 text-xl font-medium text-white transition duration-200 hover:bg-[#37149c] active:scale-[0.99]"
    >
      {icon}
      {label}
    </button>
  );
}

function Logo() {
  return (
    
     <div>
      <img src={logo} alt="โลโก้เว็บไซต์" /> {/* เรียกใช้ตัวแปรที่ import มา */}
    </div>
  
  );
}

function GoogleIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-3.9 7.1-9.8 7.1-16.9z" />
      <path fill="#FBBC05" d="M10.4 28.7a14.5 14.5 0 0 1 0-9.4l-7.8-6.1a24 24 0 0 0 0 21.6l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.4 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-7 w-7 fill-white" viewBox="0 0 384 512" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}