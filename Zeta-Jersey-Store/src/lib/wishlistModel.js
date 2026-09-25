export const isWishlistProductId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

export function readWishlist(response) {
  if (!Array.isArray(response?.wishlist)) {
    throw new Error("Invalid wishlist response");
  }
  return response.wishlist.filter(
    (product) => product && isWishlistProductId(product._id),
  );
}

export const wishlistHasProduct = (items, productId) =>
  items.some((product) => String(product._id) === productId);
