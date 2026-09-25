import { api } from "../lib/api.js";
import { addGuestItem, mergeGuestCart, readGuestCart, removeGuestItem, updateGuestItem } from './guestCart.js';

let syncPromise;

export const cartService = {
  get: ({ guest = false } = {}) => guest ? Promise.resolve({ cart: readGuestCart() }) : api.get("/users/cart"),
  add: (item, { guest = false } = {}) => guest ? Promise.resolve({ cart: addGuestItem(localStorage, item) }) : api.post("/users/cart", item),
  update: (id, quantity, { guest = false } = {}) => guest ? Promise.resolve({ cart: updateGuestItem(localStorage, id, quantity) }) : api.patch(`/users/cart/${id}`, { quantity }),
  remove: (id, { guest = false } = {}) => guest ? Promise.resolve({ cart: removeGuestItem(localStorage, id) }) : api.del(`/users/cart/${id}`),
  mergeGuest: () => {
    if (!syncPromise) syncPromise = mergeGuestCart(localStorage, (item) => api.post('/users/cart', item))
      .finally(() => {
        syncPromise = null;
        window.dispatchEvent(new Event('cart-updated'));
      });
    return syncPromise;
  },
};
