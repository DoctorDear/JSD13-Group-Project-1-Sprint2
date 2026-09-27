import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleUser, LogIn, UserPlus } from "lucide-react";

export default function GuestUserMenu({ isHome }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const ref = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => navigate("/auth/login")}
        aria-label="Sign in"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`p-2 rounded-xl transition cursor-pointer hover:shadow-[inset_-1px_-1px_1px_rgba(255,255,255,0.2),inset_1px_1px_1px_rgba(255,255,255,0.2)] focus:outline-none focus:ring-2 focus:ring-white/70 ${
          isHome
            ? "hover:text-zeta-main hover:bg-zeta-sub/35"
            : "hover:text-zeta-sub hover:bg-[#FFFFFF]/10"
        }`}
      >
        <CircleUser className="w-6 h-6" />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl p-4 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 ${
            isHome
              ? "bg-[#242424]/95 backdrop-blur-xl border border-white/20 text-white"
              : "bg-white border border-gray-100 text-gray-900"
          }`}
        >
          <div
            className={`mb-3 pb-3 text-center border-b ${
              isHome ? "border-white/15" : "border-gray-100"
            }`}
          >
            <h4
              className={`font-bold text-sm ${
                isHome ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome to Zeta Jersey
            </h4>
            <p
              className={`text-xs mt-1 ${
                isHome ? "text-white/60" : "text-gray-500"
              }`}
            >
              Sign in to manage orders, wishlist & account
            </p>
          </div>

          <div className="space-y-2">
            <Link
              to="/auth/login"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                isHome
                  ? "bg-zeta-sub text-zeta-main hover:bg-zeta-sub-lighter shadow-md"
                  : "bg-zeta-main text-white hover:bg-zeta-main/90"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>

            <Link
              to="/auth/register"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                isHome
                  ? "bg-white/10 text-white border border-white/15 hover:bg-white/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
