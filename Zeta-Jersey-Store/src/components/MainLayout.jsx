import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import UserMenu from "./UserMenu";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jerseys", label: "Jerseys" },
  { to: "/orders", label: "Orders" },
];

export default function MainLayout() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition ${
      isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-indigo-900 shadow-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-2xl font-extrabold tracking-tight text-lime-400">
              Zeta
              <sup className="ml-0.5 text-[9px] font-semibold align-super">jersey</sup>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserMenu />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="rounded-lg p-2 text-white transition hover:bg-white/10 md:hidden"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                {open ? (
                  <path d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />
                ) : (
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        {open && (
          <div className="space-y-1 border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Zeta Jersey. All rights reserved.
      </footer>
    </div>
  );
}