import { useState } from "react";

export default function VerifyEmail() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#3a10a0] via-[#6b3fd4] to-[#7c8cf8] flex items-center justify-center p-0 lg:p-10 font-sans">
      {/* ---------- MOBILE HEADER (hidden on desktop) ---------- */}
      <div className="w-full max-w-md px-6 pt-16 pb-8 lg:hidden">
        <Logo className="text-[#c8e01f] text-6xl" />

        <h1 className="mt-14 text-5xl font-extrabold text-white drop-shadow-md tracking-tight">
          Verify email
        </h1>
        <p className="mt-3 text-white/95 text-base">Please enter your e-mail</p>

        {/* Mobile card */}
        <div className="mt-10 bg-white rounded-3xl shadow-xl p-7">
          <Form form={form} onChange={handleChange} onSubmit={handleSubmit} mobile />
        </div>
      </div>

      {/* ---------- DESKTOP CARD (hidden on mobile) ---------- */}
      <div className="hidden lg:flex w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-5 gap-4">
        {/* Left: image panel */}
        <div className="relative w-1/2 rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80"
            alt="Football player sitting on the pitch"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-start justify-between p-7">
            <Logo className="text-[#c8e01f] text-5xl" />
            <button
              type="button"
              className="bg-black/25 backdrop-blur-sm text-[#e9f27a] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-black/40 transition"
            >
              Back to website
            </button>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="w-1/2 flex flex-col justify-center px-10 xl:px-14">
          <h1 className="text-6xl font-extrabold text-black tracking-tight">
            Verify email
          </h1>
          <p className="mt-4 text-lg text-neutral-800">Please enter your email</p>

          <div className="mt-10">
            <Form form={form} onChange={handleChange} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared sub-components ---------------- */

function Logo({ className = "" }) {
  return (
    <div className={`relative inline-block font-extrabold leading-none ${className}`}>
      Zeta
      <span className="absolute -top-2 -right-7 text-[0.2em] font-semibold -rotate-12">
        jersey
      </span>
    </div>
  );
}

function Form({ form, onChange, onSubmit, mobile = false }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block mb-2 text-lg text-neutral-900">
          {mobile ? "Email" : "Your email"}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Your email"
          className="w-full rounded-xl bg-neutral-200/80 px-5 py-4 text-neutral-800 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-[#1e1080] transition"
        />
      </div>

      <div>
        <label htmlFor="password" className="block mb-2 text-lg text-neutral-900">
          {mobile ? "New Password" : "Your password"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder={mobile ? "Your password" : "Enter your password"}
          className="w-full rounded-xl bg-neutral-200/80 px-5 py-4 text-neutral-800 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-[#1e1080] transition"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-[#1e1080] py-4 text-white text-lg font-medium hover:bg-[#2a1aa8] active:scale-[0.99] transition"
      >
        Reset password
      </button>
    </form>
  );
}