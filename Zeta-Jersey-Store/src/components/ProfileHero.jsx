function ProfileHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#d6df35] px-6 py-7 sm:px-10">
      <div className="absolute -right-10 -top-16 size-48 rounded-full border-24 border-[#e6ea78] opacity-70" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#e9ec9a] text-2xl font-black text-[#707900]">S</div>
          <div>
            <p className="text-xl font-black">Somchai K.</p>
            <p className="mt-1 text-sm text-[#596000]">ร้านค้าออนไลน์ · สมาชิกตั้งแต่ 2024</p>
            <p className="mt-2 text-xs font-semibold text-[#657000]">★ 4.9 &nbsp; · &nbsp; 1,280 รีวิว</p>
          </div>
        </div>
        <button className="btn border-0 bg-[#20206b] px-7 text-white shadow-none hover:bg-[#15154f]">แก้ไขโปรไฟล์</button>
      </div>
    </div>
  );
}

export default ProfileHero;
