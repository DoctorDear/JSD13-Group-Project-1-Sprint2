import { ChevronRight, House, LockKeyhole, Settings, UserRound } from "lucide-react";

function ProfileCategories({ user, onViewAll }) {
  const categories = [
    {
      icon: UserRound,
      title: "Personal Information",
      detail: `Name: ${user?.name || "—"}`,
    },
    {
      icon: House,
      title: "Shipping Address",
      detail: user?.address || "No address saved",
    },
    {
      icon: LockKeyhole,
      title: "Security",
      detail: "Account settings",
    },
    {
      icon: Settings,
      title: "Settings & Contact",
      detail: [user?.email, user?.phone].filter(Boolean).join(" • ") || "No contact details",
    },
  ];

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#8a948c]">EXPLORE</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Profile Information</h1>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="btn btn-ghost btn-sm text-[#777f79] hover:text-zeta-main hover:bg-zeta-main-lighter/40 transition cursor-pointer"
        >
          View all
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <div
            key={category.title}
            onClick={onViewAll}
            className="flex items-center gap-4 rounded-xl border border-zeta-main-lighter bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          >
            <div className="grid size-11 place-items-center rounded-sm bg-zeta-sub-lighter text-zeta-sub-dark">
              <category.icon size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black">{category.title}</h2>
              <p className="mt-1 truncate text-xs text-zeta-muted">{category.detail}</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-zeta-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProfileCategories;
