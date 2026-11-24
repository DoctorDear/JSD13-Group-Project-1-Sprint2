import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cartService } from "../services/cart.js";
import { useAuth } from "./authContext.js";

const CartContext = createContext(null);

/**
 * Shared cart state provider so Navbar and pages do not re-fetch /users/cart on every route change.
 */
export function CartProvider({ children }) {
  const { isAuthenticated, booting } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const { cart = [] } = await cartService.get({ guest: !isAuthenticated });
      setCartItems(cart);
      setTotalItems(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    } catch {
      setCartItems([]);
      setTotalItems(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (booting) return;
    refreshCart();

    window.addEventListener("storage", refreshCart);
    window.addEventListener("cart-updated", refreshCart);
    return () => {
      window.removeEventListener("storage", refreshCart);
      window.removeEventListener("cart-updated", refreshCart);
    };
  }, [booting, refreshCart]);

  const value = useMemo(
    () => ({ cartItems, totalItems, refreshCart }),
    [cartItems, totalItems, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
