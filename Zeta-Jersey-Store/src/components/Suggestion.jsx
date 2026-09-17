import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";

const Suggestion = () => {
  const { products } = useCart();
  return (
    <div className="">
      <div className="text-3xl font-bold px-5 pt-4">
        <h1>You May Also Like</h1>
      </div>
      <div className="flex">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
};
export default Suggestion;
