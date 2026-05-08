"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrderHistoryStore } from "@/stores/orderHistoryStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { motion } from "framer-motion";

export default function Header() {
  const mounted = useHasMounted();
  const openCart = useUIStore((s) => s.openCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const orderIds = useOrderHistoryStore((s) => s.orderIds);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    if (!mounted || orderIds.length === 0) {
      setActiveOrderCount(0);
      return;
    }
    let isSubscribed = true;
    async function checkOrders() {
      try {
        const { getOrdersByIds } = await import("@/lib/firestore");
        const orders = await getOrdersByIds(orderIds);
        if (isSubscribed) {
          setActiveOrderCount(orders.filter(o => o.status === "new" || o.status === "processing").length);
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkOrders();
    return () => {
      isSubscribed = false;
    };
  }, [mounted, orderIds]);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍿</span>
          <h1 className="text-lg font-extrabold gradient-text tracking-tight">
            Ăn Vặt Híu Híu
          </h1>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Search Link */}
          <Link
            href="/search"
            className="p-2.5 rounded-xl hover:bg-mint/20 transition-colors"
            aria-label="Tìm kiếm"
          >
            <svg
              className="w-5 h-5 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>

          {/* Orders */}
          <Link
            href="/orders"
            className="relative p-2.5 rounded-xl hover:bg-mint/20 transition-colors"
            aria-label="Đơn hàng của tôi"
          >
            <svg
              className="w-5 h-5 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {mounted && activeOrderCount > 0 && (
              <motion.span
                key={activeOrderCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 bg-mint text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
              >
                {activeOrderCount > 99 ? "99+" : activeOrderCount}
              </motion.span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative p-2.5 rounded-xl hover:bg-mint/20 transition-colors"
            aria-label="Giỏ hàng"
          >
            <svg
              className="w-5 h-5 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            {mounted && totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
