const reviews = [
  ["P", "Ploy S.", "เสื้อสวยมาก คุณภาพดีเกินราคา", "5.0"],
  ["T", "Tee K.", "จัดส่งไว แพ็กของดีมากครับ", "4.9"],
  ["M", "Mint N.", "ไซซ์พอดี สีตรงตามภาพ", "4.8"],
];
const stats = [["1,280", "รีวิวทั้งหมด"], ["4.9", "คะแนนเฉลี่ย"], ["96%", "แนะนำร้าน"], ["32", "สินค้า"]];

function ReviewsAndStats() {
  return (
    <section className="mt-12 grid gap-8 xl:grid-cols-[1fr_1.08fr]">
      <div>
        <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-widest text-[#8a948c]">OUR COLLECTION</p><h2 className="mt-1 text-2xl font-black">การจัดอันดับบัญชี</h2></div><span className="badge badge-outline border-[#cfd8cc] text-xs">เดือนนี้</span></div>
        <div className="rounded-2xl border border-[#e4e9dc] bg-white px-5">
          {reviews.map(([initial, name, quote, score]) => <div key={name} className="flex items-center gap-3 border-b border-[#edf0ea] py-4 last:border-0"><div className="grid size-9 place-items-center rounded-full bg-[#dfe7bc] text-xs font-black text-[#647000]">{initial}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold">{name}</p><p className="truncate text-xs text-[#929a93]">{quote}</p></div><span className="text-xs font-bold text-[#c19c00]">★ {score}</span></div>)}
        </div>
      </div>
      <div>
        <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-widest text-[#8a948c]">STATS</p><h2 className="mt-1 text-2xl font-black">รีวิวล่าสุดของคุณ</h2></div><button className="btn btn-ghost btn-sm text-[#777f79]">ดูรีวิวทั้งหมด →</button></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map(([value, label]) => <div key={label} className="rounded-2xl bg-[#e8edac] p-4"><p className="text-xl font-black text-[#4f5900]">{value}</p><p className="mt-2 text-xs font-semibold text-[#78803c]">{label}</p></div>)}</div>
      </div>
    </section>
  );
}

export default ReviewsAndStats;
