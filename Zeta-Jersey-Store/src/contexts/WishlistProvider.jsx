import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { WishlistContext } from "./wishlistContext.js";
import { readWishlist, wishlistHasProduct } from "../lib/wishlistModel.js";
import { wishlistService } from "../services/wishlist.js";

const guestWishlist = {
  items: [],
  loading: false,
  error: "",
  busyId: null,
  reload: () => {},
  toggle: async () => false,
};

function AuthenticatedWishlist({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const updating = useRef(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await wishlistService.get();
      setItems(readWishlist(response));
    } catch (err) {
      setError(err.message || "Could not load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    wishlistService.get({ signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setItems(readWishlist(response));
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || "Could not load your wishlist.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const toggle = useCallback(async (productId) => {
    if (updating.current || loading) return false;
    updating.current = true;
    setBusyId(productId);
    setError("");
    try {
      const response = wishlistHasProduct(items, productId)
        ? await wishlistService.remove(productId)
        : await wishlistService.add(productId);
      setItems(readWishlist(response));
      return true;
    } catch (err) {
      setError(err.message || "Could not update your wishlist.");
      return false;
    } finally {
      updating.current = false;
      setBusyId(null);
    }
  }, [items, loading]);

  const value = useMemo(() => ({ items, loading, error, busyId, reload, toggle }),
    [items, loading, error, busyId, reload, toggle]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function WishlistProvider({ children }) {
  const { user, booting } = useAuth();
  const userId = user?._id ?? user?.id;

  if (booting || !userId) {
    return <WishlistContext.Provider value={guestWishlist}>{children}</WishlistContext.Provider>;
  }
  return <AuthenticatedWishlist key={userId}>{children}</AuthenticatedWishlist>;
}
