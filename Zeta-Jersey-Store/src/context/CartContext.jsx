import { createContext, useContext, useState } from "react";
import productData from "../data/products.json";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState(productData);
  return (
    <CartContext.Provider value={{ products }}>{children}</CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
