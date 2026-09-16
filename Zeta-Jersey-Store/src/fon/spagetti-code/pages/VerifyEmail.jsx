import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo/Zeta_Green_and_Jersey_Logo.png"; // นำเข้าไฟล์รูปภาพ


export default function VerifyEmail() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#3A0CA3] via-[#6432D4] to-[#7B7BFF] flex items-center justify-center p-5 sm:p-8 lg:p-12">
      <div className="w-full max-w-6xl">
        {/* ---------- Mobile header (on gradient) ---------- */}
        <div className="lg:hidden mb-8 px-2">
          <Logo className="text-[#C6DE2E] text-6xl" />
          <h1 className="mt-10 text-5xl font-extrabold text-white drop-shadow-md">
            Verify email
          </h1>
          <p className="mt-3 text-white text-lg font-medium">Please enter your e-mail</p>
        </div>

        {/* ---------- Card ---------- */}
        <div className="bg-white rounded-[32px] shadow-2xl p-4 lg:p-5 lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Image panel — desktop only */}
          <div className="relative hidden lg:block rounded-3xl overflow-hidden min-h-[620px]">
            <img
              src="https://plus.unsplash.com/premium_photo-1665673313491-22509937fc9f?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Football player resting on the pitch with a ball"
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

          {/* Form panel */}
          <div className="flex flex-col justify-center p-4 sm:p-6 lg:py-8 lg:pr-6">
            <div className="hidden lg:block">
              <h1 className="text-6xl font-extrabold tracking-tight text-black drop-shadow-sm">
                Verify email
              </h1>
              <p className="mt-5 text-lg text-gray-900">Please enter your email</p>
            </div>

            <form className="lg:mt-10" onSubmit={handleSubmit}>
              <Field
                id="email"
                type="email"
                placeholder="Your email"
                label="Email"
                desktopLabel="Your email"
              />

              <div className="mt-6 lg:mt-8">
                <Field
                  id="password"
                  type="password"
                  placeholder="Your password"
                  desktopPlaceholder="Enter your password"
                  label="New Password"
                  desktopLabel="Your password"
                />
              </div>

              <button
                type="submit"
                className="mt-8 lg:mt-10 w-full rounded-lg bg-[#1E0A73] py-4 text-lg font-semibold text-white hover:bg-[#2A0F7A] focus:outline-none focus:ring-4 focus:ring-[#2A0F7A]/30 transition"
              >
                Reset password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared sub-components ---------------- */

function Field({ id, label, desktopLabel, placeholder, desktopPlaceholder, type = "text" }) {
  return (
    <div>
      <label htmlFor={id} className="block text-lg text-gray-900">
        <span className="lg:hidden">{label}</span>
        <span className="hidden lg:inline">{desktopLabel ?? label}</span>
      </label>

      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className="lg:hidden mt-2 w-full rounded-lg bg-gray-300/70 px-5 py-4 text-gray-800 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#2A0F7A]/40 transition"
      />
      <input
        id={`${id}-lg`}
        name={id}
        type={type}
        placeholder={desktopPlaceholder ?? placeholder}
        className="hidden lg:block mt-2 w-full rounded-lg bg-gray-300/70 px-5 py-4 text-gray-800 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#2A0F7A]/40 transition"
      />
    </div>
  );
}

function Logo({ className = "" }) {
  return (
   <div>
         <img src={logo} alt="โลโก้เว็บไซต์" /> {/* เรียกใช้ตัวแปรที่ import มา */}
       </div>
    
  );
}