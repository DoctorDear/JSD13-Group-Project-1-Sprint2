const products = [
  { name: "Liverpool FC 26/27 Home Jersey", type: "เสื้อฟุตบอล", price: "฿2,800", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=85", color: "#dfebbf" },
  { name: "Manchester City 26/27 Away", type: "เสื้อฟุตบอล", price: "฿2,650", image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=600&q=85", color: "#c9e6f5" },
  { name: "Real Madrid 26/27 Third", type: "เสื้อฟุตบอล", price: "฿2,800", image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=600&q=85", color: "#e8d8d4" },
];

function ProductSection({ activeProductTab, onProductTabChange, likedProducts, onToggleLike }) {
  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold tracking-widest text-[#8a948c]">SHOP FAVORITES</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">สินค้าที่คุณกำลังสนใจ</h2></div>
        <div className="join">
          {["สินค้าขายดี", "มาใหม่"].map((tab) => <button key={tab} className={`join-item btn btn-sm ${activeProductTab === tab ? "bg-[#20206b] text-white" : "bg-white text-[#6e7770]"}`} onClick={() => onProductTabChange(tab)}>{tab}</button>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => <article key={product.name} className="group overflow-hidden rounded-2xl border border-[#e4e9dc] bg-white">
          <div className="relative aspect-[1.05] overflow-hidden" style={{ backgroundColor: product.color }}>
            <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" />
            <button className="btn btn-circle btn-sm absolute right-3 top-3 border-0 bg-white/80 text-[#555f57] shadow-none" onClick={() => onToggleLike(index)} aria-label="เพิ่มรายการโปรด">{likedProducts.includes(index) ? "♥" : "♡"}</button>
          </div>
          <div className="p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-[#98a198]">{product.type}</p><h3 className="mt-2 min-h-10 text-sm font-black leading-5">{product.name}</h3><div className="mt-3 flex items-center justify-between"><p className="text-base font-black text-[#20206b]">{product.price}</p><button className="btn btn-sm border-0 bg-[#20206b] text-xs text-white hover:bg-[#15154f]">เพิ่มลงตะกร้า</button></div></div>
        </article>)}
      </div>
    </section>
  );
}

export default ProductSection;
