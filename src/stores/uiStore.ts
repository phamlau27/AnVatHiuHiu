import { create } from "zustand";

interface UIStore {
  isCartOpen: boolean;
  cartMode: "checkout" | "edit-order";
  onCartSubmit?: () => void;
  openCart: (mode?: "checkout" | "edit-order", onSubmit?: () => void) => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCartOpen: false,
  cartMode: "checkout",
  openCart: (mode = "checkout", onSubmit) => set({ isCartOpen: true, cartMode: mode, onCartSubmit: onSubmit }),
  closeCart: () => set({ isCartOpen: false, onCartSubmit: undefined, cartMode: "checkout" }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));
