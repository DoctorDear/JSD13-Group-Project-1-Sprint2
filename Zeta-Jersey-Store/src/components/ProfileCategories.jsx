import { House, LockKeyhole, Settings, UserRound } from "lucide-react";

const categories = [
  { icon: UserRound, title: "Personal Information", detail: "Name: Somchai K." },
  { icon: House, title: "Shipping Address", detail: "Bangkok, Thailand" },
  { icon: LockKeyhole, title: "Security", detail: "Password" },
  { icon: Settings, title: "Settings", detail: "Email" },
];

function ProfileCategories() {
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#8a948c]">EXPLORE</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Profile Information</h1>
        </div>
        <button className="btn btn-ghost btn-sm text-[#777f79]">View all →</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category.title} className="flex items-center gap-4 rounded-xl border border-[#e4e9dc] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="grid size-11 place-items-center rounded-sm bg-[#eff2bd] text-[#777f00]">
              <category.icon size={20} strokeWidth={2.5} />
            </div>
            <div><h2 className="text-sm font-black">{category.title}</h2><p className="mt-1 text-xs text-[#8b948e]">{category.detail}</p></div>
            <span className="ml-auto text-[#abb3ac]">→</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProfileCategories;
