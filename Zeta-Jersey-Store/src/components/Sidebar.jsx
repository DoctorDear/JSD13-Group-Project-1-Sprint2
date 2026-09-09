function Sidebar({ activeMenu, onMenuChange }) {
  const menuItems = ["หน้าหลัก", "สินค้า", "คำสั่งซื้อ", "ข้อความ", "ตั้งค่าร้านค้า"];

  return (
    <aside className="hidden min-h-screen w-60 shrink-0 border-r border-[#dfe7df] bg-white px-6 py-8 lg:block">
      <div className="mb-12 flex items-center gap-3">
      </div>
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#849087]">เมนูหลัก</p>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button key={item} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeMenu === item ? "bg-[#ebf0b1] text-[#404900]" : "text-[#738078] hover:bg-[#f4f6ef]"}`} onClick={() => onMenuChange(item)}>
            <span className="grid size-7 place-items-center rounded-lg bg-[#f1f4ec] text-xs font-black">{item.slice(0, 1)}</span>
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
