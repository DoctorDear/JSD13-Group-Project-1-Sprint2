import { useState } from "react";
import ProductCard from "./components/ProductCard";
import productData from "./data/products.json";

const App = () => {
  const [products, setProducts] = useState(productData);

  return (
    <div>
      <div>
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
};
export default App;
