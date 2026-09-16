import { useState } from "react";

/* ---------- Reusable logo ---------- */
function ZetaLogo({ className = "" }) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <span className="font-extrabold tracking-tight text-[#d9e04b] leading-none">
        Zeta
      </span>
      <span className="absolute -top-1 -right-6 rotate-[18deg] text-[0.28em] font-semibold text-[#d9e04b]">
        jersey
      </span>
    </div>
  );
}

/* ---------- Shared form ---------- */
function LoginForm({ onSubmit, email, setEmail, password, setPassword }) {
  return (
    <form onSubmit={onSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-base font-medium text-gray-900">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-gray-300/70 px-5 py-4 text-gray-900 placeholder-gray-500 outline-none transition focus:bg-gray-300 focus:ring-2 focus:ring-[#1b1178]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-base font-medium text-gray-900">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-gray-300/70 px-5 py-4 text-gray-900 placeholder-gray-500 outline-none transition focus:bg-gray-300 focus:ring-2 focus:ring-[#1b1178]"
        />
      </div>

      <a
        href="#forgot"
        className="inline-block text-base text-gray-900 underline underline-offset-4 md:no-underline hover:opacity-70"
      >
        Forget Password ?
      </a>

      <button
        type="submit"
        className="w-full rounded-lg bg-[#1b1178] py-4 text-lg font-medium text-white transition hover:bg-[#251a95] active:scale-[0.99]"
      >
        Log in
      </button>
    </form>
  );
}

/* ---------- Page ---------- */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  const formProps = { onSubmit: handleSubmit, email, setEmail, password, setPassword };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#3d0a9e] via-[#6b3fd4] to-[#7b8ef5] px-5 py-10 font-sans md:flex md:items-center md:justify-center">
      {/* ===== MOBILE (< md) ===== */}
      <div className="md:hidden">
        <ZetaLogo className="text-6xl" />

        <h1 className="mt-10 text-5xl font-extrabold text-white drop-shadow-md">
          Welcome back!
        </h1>
        <p className="mt-3 text-lg text-white/90">Please enter your details</p>

        <div className="mt-10 rounded-3xl bg-white p-7 shadow-2xl">
          <LoginForm {...formProps} />
        </div>
      </div>

      {/* ===== DESKTOP (>= md) ===== */}
      <div className="hidden w-full max-w-5xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl md:grid md:grid-cols-2 md:gap-10">
        {/* Left: image + logo overlay */}
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80"
            alt="Player sitting in stadium seats"
            className="h-full w-full object-cover"
          />
          <ZetaLogo className="absolute left-7 top-6 text-5xl" />
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-center py-8 pr-4">
          <h1 className="mb-12 text-6xl font-extrabold tracking-tight text-black drop-shadow-sm">
            Log in
          </h1>
          <LoginForm {...formProps} />
        </div>
      </div>
    </div>
  );
}