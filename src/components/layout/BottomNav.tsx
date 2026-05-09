"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrderHistoryStore } from "@/stores/orderHistoryStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { getOrdersByIds } from "@/lib/firestore";

export default function BottomNav() {
  const pathname = usePathname();
  const mounted = useHasMounted();
  const openCart = useUIStore((s) => s.openCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const orderIds = useOrderHistoryStore((s) => s.orderIds);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  // Fetch active order count (new + processing)
  useEffect(() => {
    if (!mounted || orderIds.length === 0) {
      setActiveOrderCount(0);
      return;
    }
    getOrdersByIds(orderIds).then((orders) => {
      const count = orders.filter(
        (o) => o.status === "new" || o.status === "processing"
      ).length;
      setActiveOrderCount(count);
    }).catch(() => {});
  }, [mounted, orderIds]);

  // Hide bottom nav on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-14">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
            pathname === "/" ? "text-mint-dark" : "text-text-secondary"
          }`}
        >
          <svg className="w-5 h-5" fill={pathname === "/" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === "/" ? 0 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[10px] font-medium">Trang chủ</span>
        </Link>

        {/* Search */}
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
            pathname.startsWith("/search") ? "text-mint-dark" : "text-text-secondary"
          }`}
        >
          <svg className="w-5 h-5" fill={pathname.startsWith("/search") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname.startsWith("/search") ? 0 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-[10px] font-medium">Tìm kiếm</span>
        </Link>

        {/* Cart */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors text-text-secondary relative"
        >
          <div className="relative">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-mint text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Giỏ hàng</span>
        </button>

        {/* Orders */}
        <Link
          href="/orders"
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
            pathname.startsWith("/orders") ? "text-mint-dark" : "text-text-secondary"
          }`}
        >
          <div className="relative">
            <svg className="w-5 h-5" fill={pathname.startsWith("/orders") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname.startsWith("/orders") ? 0 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            {mounted && activeOrderCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                {activeOrderCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Đơn hàng</span>
        </Link>
      </div>
    </nav>
  );
}
