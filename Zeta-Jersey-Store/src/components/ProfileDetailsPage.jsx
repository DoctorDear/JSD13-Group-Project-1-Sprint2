import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  House,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  User,
  UserRound,
} from "lucide-react";

function ProfileDetailsPage({ user, onBack, onEditClick }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zeta-main transition hover:bg-zeta-main-lighter/40"
        >
          <ArrowLeft size={18} />
          <span>Back to Profile</span>
        </button>

        <button
          onClick={onEditClick}
          className="btn rounded-md border-0 bg-zeta-main px-6 text-sm text-white shadow-none hover:opacity-90 transition"
        >
          Edit Information
        </button>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-zeta-main-lighter bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-zeta-sub-lighter text-zeta-sub-dark shadow-xs">
            <UserRound size={42} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#18251e] sm:text-3xl">
                {user?.name || "Somchai K."}
              </h1>
              <span className="badge border-0 bg-zeta-sub-lighter px-2.5 py-1 text-xs font-bold text-zeta-sub-dark">
                Verified Account
              </span>
            </div>
            <p className="text-sm text-zeta-muted">
              Member ID: ZT-892410 • Member since October 2024
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-[#525e56]">
              <span className="flex items-center gap-1">
                <Mail size={14} className="text-zeta-main" /> {user?.email || "somchai@example.com"}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={14} className="text-zeta-main" /> {user?.phone || "0812345678"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-zeta-main" /> {user?.address || "Bangkok, Thailand"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Personal Information */}
        <div className="rounded-2xl border border-zeta-main-lighter bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-zeta-main-lighter pb-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-zeta-sub-lighter text-zeta-sub-dark">
                <User size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-black text-[#18251e]">Personal Information</h2>
            </div>
          </div>
          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Full Name</p>
              <p className="font-bold text-[#18251e]">{user?.name || "Somchai K."}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Date of Birth</p>
              <p className="font-bold text-[#18251e]">15 March 1996</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Gender</p>
              <p className="font-bold text-[#18251e]">Male</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Language</p>
              <p className="font-bold text-[#18251e]">Thai, English (Fluent)</p>
            </div>
          </div>
        </div>

        {/* 2. Shipping Address */}
        <div className="rounded-2xl border border-zeta-main-lighter bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-zeta-main-lighter pb-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-zeta-sub-lighter text-zeta-sub-dark">
                <House size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-black text-[#18251e]">Shipping Address</h2>
            </div>
            <span className="badge badge-sm border-0 bg-green-100 text-green-700 font-bold">Default</span>
          </div>
          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Primary Address</p>
              <p className="font-bold leading-relaxed text-[#18251e]">
                {user?.address || "Bangkok, Thailand"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Recipient Name</p>
              <p className="font-bold text-[#18251e]">{user?.name || "Somchai K."}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Contact Phone</p>
              <p className="font-bold text-[#18251e]">{user?.phone || "0812345678"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Delivery Note</p>
              <p className="text-xs text-zeta-muted">ฝากไว้ที่นิติบุคคลหรือป้อม รปภ. ได้เลยครับ</p>
            </div>
          </div>
        </div>

        {/* 3. Security & Authentication */}
        <div className="rounded-2xl border border-zeta-main-lighter bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-zeta-main-lighter pb-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-zeta-sub-lighter text-zeta-sub-dark">
                <LockKeyhole size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-black text-[#18251e]">Security & Login</h2>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
              <ShieldCheck size={16} /> Secured
            </span>
          </div>
          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zeta-muted">Password</p>
                <p className="font-bold text-[#18251e]">••••••••••••••</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-zeta-main underline underline-offset-2 hover:opacity-80"
              >
                Change
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zeta-muted">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-green-600 font-semibold">Enabled (Authenticator App)</p>
              </div>
              <CheckCircle2 size={16} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Recent Login Activity</p>
              <p className="text-xs text-zeta-muted">Bangkok, Thailand • Chrome on Windows • Today 13:40</p>
            </div>
          </div>
        </div>

        {/* 4. Settings & Preferences */}
        <div className="rounded-2xl border border-zeta-main-lighter bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-zeta-main-lighter pb-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-zeta-sub-lighter text-zeta-sub-dark">
                <CreditCard size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-black text-[#18251e]">Preferences & Notifications</h2>
            </div>
          </div>
          <div className="space-y-3.5 text-sm">
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Email Notifications</p>
              <p className="font-bold text-[#18251e]">Order status, Promotions & Discounts</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">SMS Alerts</p>
              <p className="font-bold text-[#18251e]">Active for Delivery Tracking</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zeta-muted">Currency & Region</p>
              <p className="font-bold text-[#18251e]">THB (฿) • Thailand (GMT+7)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetailsPage;
