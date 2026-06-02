import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, productId, variantId, name, color, size, price, image, qty, slug }

      // ── Add to cart ──────────────────────────────────────────────────────────
      // If same variantId + size already exists, increment qty
      addItem: (newItem) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) =>
            i.variantId === newItem.variantId &&
            i.size === newItem.size
        );

        if (existingIndex !== -1) {
          const updated = [...items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            qty: updated[existingIndex].qty + (newItem.qty || 1),
          };
          set({ items: updated });
        } else {
          set({
            items: [
              ...items,
              {
                ...newItem,
                id: `${newItem.variantId}-${newItem.size}-${Date.now()}`,
                qty: newItem.qty || 1,
              },
            ],
          });
        }
      },

      // ── Remove item ──────────────────────────────────────────────────────────
      removeItem: (cartItemId) =>
        set({ items: get().items.filter((i) => i.id !== cartItemId) }),

      // ── Update quantity ──────────────────────────────────────────────────────
      updateQty: (cartItemId, qty) => {
        if (qty < 1) {
          get().removeItem(cartItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === cartItemId ? { ...i, qty } : i
          ),
        });
      },

      // ── Clear cart ───────────────────────────────────────────────────────────
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "naarisa-cart", // localStorage key
    }
  )
);

export default useCartStore;