import { useState } from "react";
import ProductCard from "./components/ProductCard";
import productData from "./data/products.json";

const App = () => {
  const [products, setProducts] = useState(productData);

  const [selectedProduct, setSelectProduct] = useState(null);

  return (
    <div>
      <div>
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            onSelect={() => setSelectProduct(item)}
          />
        ))}
      </div>
    </div>
  );
};
export default App;
