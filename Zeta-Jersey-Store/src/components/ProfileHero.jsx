import { Star, UserRound } from "lucide-react";

function ProfileHero() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#d6df35] px-6 py-7 sm:px-10">
      <div className="absolute -right-10 -top-16 size-48 rounded-full border-24 border-[#e6ea78] opacity-70" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-[#e9ec9a] text-[#707900]">
            <UserRound size={30} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xl font-black">Somchai K.</p>
            <p className="mt-1 text-sm text-[#596000]">Online store · Member since 2024</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#657000]">
              <Star size={13} fill="currentColor" />
              <span>4.9</span>
              <span className="mx-1">·</span>
              <span>1,280</span>
            </p>
          </div>
        </div>
        <button className="btn rounded-md border-0 bg-[#20206b] px-7 text-white shadow-none hover:bg-[#15154f]">Edit profile</button>
      </div>
    </div>
  );
}

export default ProfileHero;
