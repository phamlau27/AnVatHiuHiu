import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteStore {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (productId) => {
        const current = get().favorites;
        if (current.includes(productId)) {
          set({ favorites: current.filter((id) => id !== productId) });
        } else {
          set({ favorites: [...current, productId] });
        }
      },

      isFavorite: (productId) => get().favorites.includes(productId),
    }),
    {
      name: "hiu-hiu-favorites",
    }
  )
);
