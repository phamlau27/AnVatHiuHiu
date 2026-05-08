"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrderHistoryStore {
  orderIds: string[];
  addOrderId: (id: string) => void;
  getOrderIds: () => string[];
}

export const useOrderHistoryStore = create<OrderHistoryStore>()(
  persist(
    (set, get) => ({
      orderIds: [],

      addOrderId: (id) => {
        set({ orderIds: [id, ...get().orderIds] });
      },

      getOrderIds: () => get().orderIds,
    }),
    {
      name: "hiu-hiu-orders",
    }
  )
);
