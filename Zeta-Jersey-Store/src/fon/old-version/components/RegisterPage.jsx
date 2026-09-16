import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agree: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.agree) return alert("Please accept the Terms & Conditions.");
    console.log(form);
  };

  const inputClass =
    "w-full rounded-xl bg-gray-200/80 px-5 py-4 text-gray-800 placeholder-gray-500 " +
    "outline-none transition focus:bg-gray-200 focus:ring-2 focus:ring-indigo-900/40";

  const labelClass = "mb-2 block text-[15px] font-medium text-gray-900";

  const socialBtn =
    "flex flex-1 items-center justify-center gap-3 rounded-xl bg-[#2B1387] px-6 py-3.5 " +
    "font-semibold text-white transition hover:bg-[#37199f] active:scale-[.98]";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#3B1191] via-[#5A2BD4] to-[#7C6BFF] p-4 sm:p-8">
      {/* ---------- MOBILE HEADER (hidden on desktop) ---------- */}
      <div className="w-full max-w-md lg:max-w-6xl">
        <div className="mb-8 px-2 lg:hidden">
          <Logo className="text-5xl" />
          <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-white drop-shadow">
            Register
          </h1>
          <p className="mt-3 text-lg text-white">
            Already have account?{" "}
            <a href="#login" className="font-semibold underline underline-offset-2">
              Log in
            </a>
          </p>
        </div>

        {/* ---------- CARD ---------- */}
        <div className="flex flex-col gap-8 rounded-3xl bg-white p-6 shadow-2xl lg:flex-row lg:gap-10 lg:p-5">
          {/* Left image panel — desktop only */}
          <div className="relative hidden w-1/2 overflow-hidden rounded-2xl lg:block">
            <img
              src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80"
              alt="Young footballer sitting on the pitch"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6">
              <Logo className="text-4xl" />
              <a
                href="#home"
                className="rounded-full bg-black/25 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40"
              >
                Back to website
              </a>
            </div>
          </div>

          {/* Right form panel */}
          <div className="flex w-full flex-col lg:w-1/2 lg:py-6 lg:pr-6">
            {/* Desktop heading */}
            <div className="order-1 hidden lg:block">
              <h1 className="text-6xl font-extrabold tracking-tight text-gray-900">Register</h1>
              <p className="mt-3 text-lg text-gray-900">
                Already have account?{" "}
                <a href="#login" className="underline underline-offset-2">
                  Log in
                </a>
              </p>
            </div>

            {/* Social buttons — top on mobile, bottom on desktop */}
            <div className="order-2 flex gap-4 lg:order-4 lg:mt-8">
              <button type="button" className={socialBtn}>
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button type="button" className={socialBtn}>
                <AppleIcon />
                <span>Apple</span>
              </button>
            </div>

            {/* "or" divider — mobile only */}
            <div className="order-3 my-6 flex items-center gap-4 lg:hidden">
              <span className="h-px flex-1 bg-gray-400" />
              <span className="text-lg text-gray-700">or</span>
              <span className="h-px flex-1 bg-gray-400" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="order-4 lg:order-3 lg:mt-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>First name</label>
                  <input
                    id="firstName" name="firstName" type="text" placeholder="First name"
                    value={form.firstName} onChange={handleChange} className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>Last name</label>
                  <input
                    id="lastName" name="lastName" type="text" placeholder="Last name"
                    value={form.lastName} onChange={handleChange} className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="email" className={labelClass}>Email</label>
                <input
                  id="email" name="email" type="email" placeholder="Your email"
                  value={form.email} onChange={handleChange} className={inputClass}
                />
              </div>

              <div className="mt-5">
                <label htmlFor="password" className={labelClass}>Password</label>
                <input
                  id="password" name="password" type="password" placeholder="Enter your password"
                  value={form.password} onChange={handleChange} className={inputClass}
                />
              </div>

              <label className="mt-7 flex cursor-pointer items-center gap-3 select-none">
                <input
                  type="checkbox" name="agree" checked={form.agree} onChange={handleChange}
                  className="h-6 w-6 shrink-0 accent-[#2B1387]"
                />
                <span className="text-[15px] text-gray-900 sm:text-base">
                  I'm agree to the Term &amp; Condition
                </span>
              </label>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-[#2B1387] py-4 text-lg font-semibold text-white transition hover:bg-[#37199f] active:scale-[.99]"
              >
                Create account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small presentational pieces ---------- */

function Logo({ className = "" }) {
  return (
    <div className={`relative inline-block font-extrabold leading-none text-[#C4D82E] ${className}`}>
      Zeta
      <span className="absolute -top-3 -right-6 rotate-12 text-[0.22em] font-semibold tracking-wide">
        jersey
      </span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.2-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.4-4.6 7.1l7.2 5.6c4.2-3.9 6.6-9.7 6.6-16.6z"/>
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-7.8-6.1C1 17 0 20.4 0 24s1 7 2.6 10.1l7.8-5.4z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.7 2.3-8.7 2.3-6.3 0-11.7-3.7-13.6-9.2l-7.8 5.4C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.13 2.99-.85.96-2.24 1.7-3.4 1.6-.14-1.1.42-2.26 1.1-3.02.79-.9 2.19-1.57 3.43-1.57zM20.7 17.1c-.6 1.38-.9 2-1.67 3.22-1.08 1.7-2.6 3.82-4.48 3.83-1.67.02-2.1-1.1-4.37-1.08-2.27.01-2.74 1.1-4.41 1.09-1.88-.02-3.32-1.93-4.4-3.63C-1.7 16.1-2 9.6 1.24 6.72c1.28-1.15 2.94-1.83 4.5-1.83 1.6 0 2.6 1.09 4.36 1.09 1.7 0 2.74-1.09 4.6-1.09 1.4 0 2.88.76 3.94 2.07-3.46 1.9-2.9 6.84.06 8.14z"/>
    </svg>
  );
}