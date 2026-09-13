import { useState } from "react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reset request for:", email);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-800 via-violet-700 to-indigo-500 flex items-center justify-center p-0 md:p-8 lg:p-12">
      {/* ============ CARD SHELL ============ */}
      <div className="w-full max-w-6xl bg-transparent md:bg-white md:rounded-3xl md:shadow-2xl md:p-4 lg:p-5 flex flex-col md:flex-row gap-0 md:gap-6">

        {/* ---------- LEFT: hero image (desktop only) ---------- */}
        <div className="hidden md:block relative md:w-1/2 rounded-2xl overflow-hidden">
          <img
            src="/images/player.jpg"
            alt="Athlete in a blue jersey"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 lg:p-8">
            <Logo className="text-lime-300" />
            <button
              type="button"
              className="rounded-full bg-yellow-600/80 px-5 py-2.5 text-sm lg:text-base font-medium text-white backdrop-blur-sm transition hover:bg-yellow-600"
            >
              Back to website
            </button>
          </div>
        </div>

        {/* ---------- RIGHT: form ---------- */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-10 md:px-8 lg:px-14">

          {/* Mobile-only logo + heading (picture 2 style) */}
          <div className="md:hidden mb-8">
            <Logo className="text-lime-300 mb-10" />
            <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
              Reset password
            </h1>
            <p className="mt-3 text-base text-white/90">
              Password problem ? We got you!
            </p>
          </div>

          {/* Desktop-only heading */}
          <div className="hidden md:block mb-8">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-black drop-shadow-sm">
              Reset password
            </h1>
            <p className="mt-5 text-lg text-neutral-800">
              Password problem ? We got you!
            </p>
          </div>

          {/* Form — white card on mobile, plain on desktop */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-6 shadow-xl md:rounded-none md:bg-transparent md:p-0 md:shadow-none"
          >
            <label
              htmlFor="email"
              className="block text-base lg:text-lg font-medium text-neutral-900"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="mt-3 w-full rounded-lg bg-neutral-200 px-5 py-4 text-base text-neutral-900 placeholder-neutral-500 outline-none transition focus:bg-neutral-100 focus:ring-2 focus:ring-indigo-900"
            />

            <button
              type="submit"
              className="mt-8 md:mt-10 w-full rounded-lg bg-indigo-950 px-6 py-4 text-lg font-medium text-white transition hover:bg-indigo-900 active:scale-[0.99]"
            >
              Submit email address
            </button>

            <a
              href="#login"
              className="md:hidden mt-6 block text-center text-sm font-medium text-neutral-700 underline underline-offset-4"
            >
              Back to log in
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- Logo ---------- */
function Logo({ className = "" }) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <span className="text-5xl font-extrabold tracking-tight">Zeta</span>
      <span className="absolute -top-2 -right-6 rotate-12 text-xs font-semibold">
        jersey
      </span>
    </div>
  );
}