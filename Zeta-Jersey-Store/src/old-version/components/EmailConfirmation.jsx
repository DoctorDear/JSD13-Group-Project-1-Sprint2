import React from "react";

/* Zeta logo — "jersey" sits as a small tilted tag above the "a" */
function ZetaLogo({ className = "" }) {
  return (
    <div className={`relative inline-flex items-start ${className}`}>
      <span className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
        Zeta
      </span>
      <span className="ml-0.5 -mt-1 rotate-[18deg] text-[10px] font-semibold tracking-wide sm:text-xs">
        jersey
      </span>
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8">
      <button
        type="button"
        className="w-full rounded-md bg-[#1E1B7E] py-4 text-base font-medium text-white shadow-md transition
                   hover:bg-[#2A26A0] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:scale-[0.99]
                   sm:text-lg"
      >
        Confirm email
      </button>

      <button
        type="button"
        className="w-full rounded-md bg-[#1E1B7E] py-4 text-base font-medium text-white shadow-md transition
                   hover:bg-[#2A26A0] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:scale-[0.99]
                   sm:text-lg"
      >
        Resend email
      </button>
    </div>
  );
}

export default function EmailConfirmation() {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br
                 from-[#4B1FB0] via-[#6A3BE0] to-[#7C7BF5] px-6 py-12 font-sans md:px-10"
    >
      <div className="w-full max-w-6xl">
        {/* ---------- MOBILE HEADER (hidden on desktop) ---------- */}
        <header className="md:hidden">
          <ZetaLogo className="text-[#D3E04B]" />
          <h1 className="mt-12 text-5xl font-extrabold leading-[1.05] text-white [text-shadow:0_3px_10px_rgba(0,0,0,0.25)]">
            Email
            <br />
            Confirmation
          </h1>
        </header>

        {/* ---------- CARD ---------- */}
        <section
          className="mt-10 rounded-3xl bg-white p-8 shadow-2xl
                     md:mt-0 md:grid md:grid-cols-2 md:items-center md:gap-12 md:p-6"
        >
          {/* Image panel — desktop only */}
          <div className="relative hidden aspect-[3/4] overflow-hidden rounded-2xl md:block">
            <img
              src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=900&q=80"
              alt="Young footballer sitting on a ball holding a water bottle"
              className="h-full w-full object-cover"
            />
            <ZetaLogo className="absolute left-6 top-6 text-[#D3E04B] drop-shadow" />
            <a
              href="#"
              className="absolute right-6 top-6 rounded-full bg-[#A5A72B]/90 px-5 py-2.5 text-sm
                         font-semibold text-white backdrop-blur transition hover:bg-[#8E9024]"
            >
              Back to website
            </a>
          </div>

          {/* Content panel */}
          <div className="md:py-6 md:pr-8">
            <h1 className="hidden text-6xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 [text-shadow:0_4px_12px_rgba(0,0,0,0.25)] md:block">
              Email
              <br />
              Confirmation
            </h1>

            <div className="md:mt-20">
              <ActionButtons />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}