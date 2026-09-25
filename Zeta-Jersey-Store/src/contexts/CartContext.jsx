import { useState } from "react";
import productData from "../data/products.json";
import { CartContext } from "./cartContext.js";

export const CartProvider = ({ children }) => {
  const [products] = useState(productData);
  return (
    <CartContext.Provider value={{ products }}>{children}</CartContext.Provider>
  );
};
