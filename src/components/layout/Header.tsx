"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrderHistoryStore } from "@/stores/orderHistoryStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { motion } from "framer-motion";
import { subscribeToOrdersByIds } from "@/lib/firestore";

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
    const unsub = subscribeToOrdersByIds(orderIds, (orders) => {
      setActiveOrderCount(orders.filter(o => o.status === "new" || o.status === "processing").length);
    });
    return () => unsub();
  }, [mounted, orderIds]);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-1.5 group">
          {/* Minimal abstract mark */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative text-white font-black text-sm tracking-tighter z-10">HH</span>
          </div>
          {/* Text logo with shimmer */}
          <span className="logo-shimmer text-lg font-extrabold tracking-tight">
            Ăn Vặt Híu Híu
          </span>
        </Link>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-0.5">
          {/* Search */}
          <Link
            href="/search"
            className="p-2.5 rounded-xl hover:bg-teal-50 transition-colors"
            aria-label="Tìm kiếm"
          >
            <svg className="w-[22px] h-[22px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </Link>

          {/* Orders */}
          <Link
            href="/orders"
            className="relative p-2.5 rounded-xl hover:bg-teal-50 transition-colors"
            aria-label="Đơn hàng"
          >
            <svg className="w-[22px] h-[22px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {mounted && activeOrderCount > 0 && (
              <motion.span
                key={activeOrderCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0.5 right-0.5 bg-gradient-to-br from-orange-400 to-orange-600 text-white text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm"
              >
                {activeOrderCount > 99 ? "99+" : activeOrderCount}
              </motion.span>
            )}
          </Link>

          {/* Cart */}
          <button
            onClick={() => openCart()}
            className="relative p-2.5 rounded-xl hover:bg-teal-50 transition-colors"
            aria-label="Giỏ hàng"
          >
            <svg className="w-[22px] h-[22px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {mounted && totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0.5 right-0.5 bg-gradient-to-br from-teal-400 to-teal-600 text-white text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm"
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
