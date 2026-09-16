import { Star, UserRound } from "lucide-react";

function ProfileHero({ onEditClick }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-zeta-sub px-6 py-7 sm:px-10">
      <div className="absolute -right-10 -top-16 size-48 rounded-full border-24 border-zeta-sub-lighter opacity-70" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-zeta-sub-lighter text-zeta-sub-dark">
            <UserRound size={30} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xl font-black">Somchai K.</p>
            <p className="mt-1 text-sm text-zeta-sub-dark">Online store · Member since 2024</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-zeta-sub-dark">
              <Star size={13} fill="currentColor" />
              <span>4.9</span>
              <span className="mx-1">·</span>
              <span>1,280</span>
            </p>
          </div>
        </div>
        <button
          onClick={onEditClick}
          className="btn rounded-md border-0 bg-zeta-main px-7 text-white shadow-none hover:opacity-90"
        >
          Edit profile
        </button>
      </div>
    </div>
  );
}

export default ProfileHero;
