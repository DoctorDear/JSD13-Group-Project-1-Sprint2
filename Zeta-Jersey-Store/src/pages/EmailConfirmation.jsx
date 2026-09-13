import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo/Zeta_Green_and_Jersey_Logo.png"; // นำเข้าไฟล์รูปภาพ


export default function EmailConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#3A0CA3] via-[#6432D4] to-[#7B7BFF] flex items-center justify-center p-5 sm:p-8 lg:p-12">
      <div className="w-full max-w-6xl">
        {/* ---------- Mobile header (on gradient) ---------- */}
        <div className="lg:hidden mb-8 px-2">
          <Logo className="text-[#C6DE2E] text-6xl" />
          <h1 className="mt-12 text-5xl font-extrabold leading-[1.15] text-white drop-shadow-md">
            Email
            <br />
            Confirmation
          </h1>
        </div>

        {/* ---------- Card ---------- */}
        <div className="bg-white rounded-[32px] shadow-2xl p-4 lg:p-5 lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Image panel — desktop only */}
          <div className="relative hidden lg:block rounded-3xl overflow-hidden min-h-[620px]">
            <img
              src="https://plus.unsplash.com/premium_photo-1661893941582-3390d236d95f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Young footballer sitting on a ball holding a water bottle"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative flex items-start justify-between p-7">
              <Logo className="text-[#C6DE2E] text-4xl" />
              <Link
                to="/"
                className="rounded-full bg-[#A8B81F]/85 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-[#A8B81F] transition"
              >
                Back to website
              </Link>
            </div>
          </div>

          {/* Content panel */}
          <div className="flex flex-col justify-center px-6 py-8 sm:px-8 lg:py-8 lg:pr-6">
            <h1 className="hidden lg:block text-6xl font-extrabold leading-[1.1] tracking-tight text-black drop-shadow-sm">
              Email
              <br />
              Confirmation
            </h1>

            <div className="lg:mt-20 space-y-8">
              <ActionButton onClick={() => navigate("/login")}>Confirm email</ActionButton>
              <ActionButton onClick={() => alert("Verification email resent!")}>
                Resend email
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared sub-components ---------------- */

function ActionButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full rounded-lg bg-[#1E0A73] py-4 text-lg font-semibold text-white hover:bg-[#2A0F7A] focus:outline-none focus:ring-4 focus:ring-[#2A0F7A]/30 transition"
    >
      {children}
    </button>
  );
}

function Logo({ className = "" }) {
  return (
    <div>
          <img src={logo} alt="โลโก้เว็บไซต์" /> {/* เรียกใช้ตัวแปรที่ import มา */}
    </div>
  );
}