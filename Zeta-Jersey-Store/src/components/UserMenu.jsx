import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Avatar from "./Avatar";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

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
    try {
      await logout();
    } finally {
      navigate("/auth/login", { replace: true });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1 pr-2 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
      >
        <Avatar user={user} />
        <span className="hidden max-w-32 text-left sm:block">
          <strong className="block truncate text-sm">{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email}</strong>
          <small className="block text-xs text-white/70">My account</small>
        </span>
        <ChevronDown className={`hidden size-4 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl ring-1 ring-black/5"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account"}</p>
              <p className="truncate text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-50"
          >
            <UserRound size={18} />
            Profile
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-50"
          >
            <Settings size={18} />
            Settings
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
