import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Avatar from "./Avatar";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lime-400"
      >
        <Avatar user={user} />
        <span className="hidden text-sm font-medium text-white sm:block">
          {user?.firstName || user?.email}
        </span>
        <svg
          className={`h-4 w-4 fill-white transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M5.3 7.3l4.7 4.7 4.7-4.7 1.4 1.4-6.1 6.1-6.1-6.1z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate font-semibold text-gray-900">
              {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account"}
            </p>
            <p className="truncate text-sm text-gray-500">{user?.email}</p>
          </div>

          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Profile
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Settings
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full border-t border-gray-100 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}