import {
  CreditCard,
  Heart,
  House,
  MessageSquareText,
  UserRound,
} from "lucide-react";

function Sidebar({ activeMenu, onMenuChange }) {
  const menuItems = [
    { label: "Home", icon: House },
    { label: "My Account", icon: UserRound },
    { label: "Favorites", icon: Heart },
    { label: "My Reviews", icon: MessageSquareText },
    { label: "Payment", icon: CreditCard },
  ];

  return (
    <aside className="hidden min-h-screen w-60 shrink-0 border-r border-[#dfe7df] bg-white px-6 py-8 lg:block">
      <div className="mb-12 flex items-center gap-3">
      </div>
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#849087]">Main Menu</p>
      <nav className="space-y-2">
        {menuItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition ${activeMenu === label ? "bg-zeta-sub-lighter text-zeta-sub-dark" : "text-zeta-muted hover:bg-zeta-main-lighter/40"}`}
            onClick={() => onMenuChange(label)}
          >
            <span className={`grid size-7 place-items-center rounded-sm ${activeMenu === label ? "bg-zeta-sub/40" : "bg-zeta-main-lighter"}`}>
              <Icon size={16} strokeWidth={2.5} />
            </span>
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
