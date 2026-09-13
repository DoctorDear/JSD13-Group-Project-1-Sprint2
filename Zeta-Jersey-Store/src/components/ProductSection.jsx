import ProductCard from "./ProductCard";
import products from "../data/products.json";

function ProductSection({ activeProductTab, onProductTabChange, likedProducts, onToggleLike }) {
  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold tracking-widest text-[#8a948c]">SHOP FAVORITES</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Products You May Like</h2></div>
        <div className="join">
          {["Best Sellers", "New Arrivals"].map((tab) => <button key={tab} className={`join-item btn btn-sm ${activeProductTab === tab ? "bg-[#20206b] text-white" : "bg-white text-[#6e7770]"}`} onClick={() => onProductTabChange(tab)}>{tab}</button>)}
        </div>
      </div> 
      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            isLiked={likedProducts.includes(index)}
            onToggleLike={() => onToggleLike(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductSection;
