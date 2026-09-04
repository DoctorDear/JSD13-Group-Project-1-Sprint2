import { useState } from "react";

const categories = [
	{ icon: "J", title: "เสื้อฟุตบอล", detail: "เสื้อทีมแท้และเสื้อแฟนบอล" },
	{ icon: "C", title: "เสื้อบาสเกตบอล", detail: "เสื้อแข่งสไตล์ NBA" },
	{ icon: "N", title: "เสื้อวิ่ง", detail: "น้ำหนักเบา ระบายอากาศดี" },
	{ icon: "K", title: "เครื่องแต่งกาย", detail: "หมวก ถุงเท้า และอุปกรณ์" },
];

const products = [
	{ name: "Liverpool FC 26/27 Home Jersey", type: "เสื้อฟุตบอล", price: "฿2,800", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=85", color: "#dfebbf" },
	{ name: "Manchester City 26/27 Away", type: "เสื้อฟุตบอล", price: "฿2,650", image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=600&q=85", color: "#c9e6f5" },
	{ name: "Real Madrid 26/27 Third", type: "เสื้อฟุตบอล", price: "฿2,800", image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=600&q=85", color: "#e8d8d4" },
];

const reviews = [
	["P", "Ploy S.", "เสื้อสวยมาก คุณภาพดีเกินราคา", "5.0"],
	["T", "Tee K.", "จัดส่งไว แพ็กของดีมากครับ", "4.9"],
	["M", "Mint N.", "ไซซ์พอดี สีตรงตามภาพ", "4.8"],
];

function Body() {
	const [activeTab, setActiveTab] = useState("สินค้า");
	const [liked, setLiked] = useState([]);

	const toggleLike = (index) => {
		setLiked((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
	};

	return (
		<main className="min-h-screen bg-[#f5f7f2] text-[#18251e]">
			<div className="mx-auto flex max-w-7xl">
				<aside className="hidden min-h-screen w-60 shrink-0 border-r border-[#dfe7df] bg-white px-6 py-8 lg:block">
					<div className="mb-12 flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-[#d6df35] text-lg font-black">Z</div><span className="text-lg font-black tracking-tight">ZETA<span className="text-[#7b8500]">.</span></span></div>
					<p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#849087]">เมนูหลัก</p>
					<nav className="space-y-2">{["หน้าหลัก", "สินค้า", "คำสั่งซื้อ", "ข้อความ", "ตั้งค่าร้านค้า"].map((item) => <button key={item} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeTab === item ? "bg-[#ebf0b1] text-[#404900]" : "text-[#738078] hover:bg-[#f4f6ef]"}`} onClick={() => setActiveTab(item)}><span className="grid size-7 place-items-center rounded-lg bg-[#f1f4ec] text-xs font-black">{item.slice(0, 1)}</span>{item}</button>)}</nav>
					<div className="mt-16 rounded-2xl bg-[#eff3ca] p-4"><p className="text-xs font-bold text-[#566000]">อัปเกรดร้านค้าของคุณ</p><p className="mt-1 text-xs leading-5 text-[#78803c]">ปลดล็อกฟีเจอร์พิเศษสำหรับร้านค้า</p><button className="btn btn-sm mt-4 w-full border-0 bg-[#20206b] text-white hover:bg-[#15154f]">ดูรายละเอียด</button></div>
				</aside>

				<section className="min-w-0 flex-1">
					<header className="flex items-center justify-between border-b border-[#dfe7df] bg-white px-5 py-4 sm:px-10"><div className="flex items-center gap-2 lg:hidden"><div className="grid size-8 place-items-center rounded-lg bg-[#d6df35] font-black">Z</div><b>ZETA.</b></div><div className="hidden text-sm font-semibold text-[#748078] sm:block">สวัสดี, Somchai K.</div><div className="flex items-center gap-3"><button className="btn btn-circle btn-ghost btn-sm text-lg" aria-label="แจ้งเตือน">◌</button><div className="avatar placeholder"><div className="w-9 rounded-full bg-[#d9df91] text-sm font-bold text-[#596000]">SK</div></div></div></header>

					<div className="px-5 py-6 sm:px-10 sm:py-9">
						<div className="relative overflow-hidden rounded-3xl bg-[#d6df35] px-6 py-7 sm:px-10"><div className="absolute -right-10 -top-16 size-48 rounded-full border-[24px] border-[#e6ea78] opacity-70" /><div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#e9ec9a] text-2xl font-black text-[#707900]">S</div><div><p className="text-xl font-black">Somchai K.</p><p className="mt-1 text-sm text-[#596000]">ร้านค้าออนไลน์ · สมาชิกตั้งแต่ 2024</p><p className="mt-2 text-xs font-semibold text-[#657000]">★ 4.9 &nbsp; · &nbsp; 1,280 รีวิว</p></div></div><button className="btn border-0 bg-[#20206b] px-7 text-white shadow-none hover:bg-[#15154f]">แก้ไขโปรไฟล์</button></div></div>

						<section className="mt-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-widest text-[#8a948c]">EXPLORE</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">ข้อมูลโปรไฟล์</h1></div><button className="btn btn-ghost btn-sm text-[#777f79]">ดูทั้งหมด →</button></div><div className="grid gap-3 sm:grid-cols-2">{categories.map((category) => <div key={category.title} className="flex items-center gap-4 rounded-2xl border border-[#e4e9dc] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"><div className="grid size-11 place-items-center rounded-xl bg-[#eff2bd] font-black text-[#777f00]">{category.icon}</div><div><h2 className="text-sm font-black">{category.title}</h2><p className="mt-1 text-xs text-[#8b948e]">{category.detail}</p></div><span className="ml-auto text-[#abb3ac]">→</span></div>)}</div></section>

						<section className="mt-12 grid gap-8 xl:grid-cols-[1fr_1.08fr]"><div><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-widest text-[#8a948c]">OUR COLLECTION</p><h2 className="mt-1 text-2xl font-black">การจัดอันดับบัญชี</h2></div><span className="badge badge-outline border-[#cfd8cc] text-xs">เดือนนี้</span></div><div className="rounded-2xl border border-[#e4e9dc] bg-white px-5">{reviews.map(([initial, name, quote, score]) => <div key={name} className="flex items-center gap-3 border-b border-[#edf0ea] py-4 last:border-0"><div className="grid size-9 place-items-center rounded-full bg-[#dfe7bc] text-xs font-black text-[#647000]">{initial}</div><div className="min-w-0 flex-1"><p className="text-sm font-bold">{name}</p><p className="truncate text-xs text-[#929a93]">{quote}</p></div><span className="text-xs font-bold text-[#c19c00]">★ {score}</span></div>)}</div></div><div><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-widest text-[#8a948c]">STATS</p><h2 className="mt-1 text-2xl font-black">รีวิวล่าสุดของคุณ</h2></div><button className="btn btn-ghost btn-sm text-[#777f79]">ดูรีวิวทั้งหมด →</button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["1,280", "รีวิวทั้งหมด"], ["4.9", "คะแนนเฉลี่ย"], ["96%", "แนะนำร้าน"], ["32", "สินค้า"]].map(([value, label]) => <div key={label} className="rounded-2xl bg-[#e8edac] p-4"><p className="text-xl font-black text-[#4f5900]">{value}</p><p className="mt-2 text-xs font-semibold text-[#78803c]">{label}</p></div>)}</div></div></section>

						<section className="mt-14"><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold tracking-widest text-[#8a948c]">SHOP FAVORITES</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">สินค้าที่คุณกำลังสนใจ</h2></div><div className="join">{["สินค้าขายดี", "มาใหม่"].map((tab) => <button key={tab} className={`join-item btn btn-sm ${activeTab === tab ? "bg-[#20206b] text-white" : "bg-white text-[#6e7770]"}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((product, index) => <article key={product.name} className="group overflow-hidden rounded-2xl border border-[#e4e9dc] bg-white"><div className="relative aspect-[1.05] overflow-hidden" style={{ backgroundColor: product.color }}><img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" /><button className="btn btn-circle btn-sm absolute right-3 top-3 border-0 bg-white/80 text-[#555f57] shadow-none" onClick={() => toggleLike(index)} aria-label="เพิ่มรายการโปรด">{liked.includes(index) ? "♥" : "♡"}</button></div><div className="p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-[#98a198]">{product.type}</p><h3 className="mt-2 min-h-10 text-sm font-black leading-5">{product.name}</h3><div className="mt-3 flex items-center justify-between"><p className="text-base font-black text-[#20206b]">{product.price}</p><button className="btn btn-sm border-0 bg-[#20206b] text-xs text-white hover:bg-[#15154f]">เพิ่มลงตะกร้า</button></div></div></article>)}</div></section>
					</div>
				</section>
			</div>
		</main>
	);
}

export default Body;
