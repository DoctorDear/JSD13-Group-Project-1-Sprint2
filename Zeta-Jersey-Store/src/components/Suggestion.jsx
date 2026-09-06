import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";

const Suggestion = () => {
  const { products } = useCart();
  return (
    <div>
      <h1>You May Also Like</h1>
      <div>
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
};
export default Suggestion;
