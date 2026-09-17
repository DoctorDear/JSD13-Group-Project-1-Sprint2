const categories = [
  { icon: "🧑", title: "ข้อมูลส่วนตัว", detail: "ชื่อ: Somchai K." },
  { icon: "🏠", title: "ที่อยู่จัดส่ง", detail: "Bangkok, Thailand" },
  { icon: "🔒", title: "ความปลอดภัย", detail: "รหัสผ่าน" },
  { icon: "⚙️", title: "การตั้งค่า", detail: "อีเมล" },
];

function ProfileCategories() {
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#8a948c]">EXPLORE</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">ข้อมูลโปรไฟล์</h1>
        </div>
        <button className="btn btn-ghost btn-sm text-[#777f79]">ดูทั้งหมด →</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category.title} className="flex items-center gap-4 rounded-2xl border border-[#e4e9dc] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="grid size-11 place-items-center rounded-xl bg-[#eff2bd] font-black text-[#777f00]">{category.icon}</div>
            <div><h2 className="text-sm font-black">{category.title}</h2><p className="mt-1 text-xs text-[#8b948e]">{category.detail}</p></div>
            <span className="ml-auto text-[#abb3ac]">→</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProfileCategories;
