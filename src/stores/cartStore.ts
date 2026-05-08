import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleSelectItem: (productId: string) => void;
  selectAll: (selected: boolean) => void;
  clearCart: () => void;
  clearSelectedCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getSelectedItemsCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          // Default new items to selected
          set({ items: [...get().items, { ...item, selected: true }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      toggleSelectItem: (productId) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, selected: !i.selected } : i
          ),
        });
      },

      selectAll: (selected) => {
        set({
          items: get().items.map((i) => ({ ...i, selected })),
        });
      },

      clearCart: () => set({ items: [] }),
      clearSelectedCart: () => set({ items: get().items.filter(i => !i.selected) }),

      getTotalPrice: () =>
        get().items.filter(i => i.selected).reduce((sum, i) => sum + i.price * i.quantity, 0),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
      
      getSelectedItemsCount: () => 
        get().items.filter(i => i.selected).length,
    }),
    {
      name: "hiu-hiu-cart",
    }
  )
);
