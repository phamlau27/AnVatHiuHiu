"use client";

import { useHasMounted } from "@/hooks/useHasMounted";
import { useCartStore } from "@/stores/cartStore";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import Link from "next/link";

export default function CheckoutPage() {
  const mounted = useHasMounted();
  const items = useCartStore((s) => s.items);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
        <p className="text-text-secondary text-sm mb-6">
          Hãy thêm sản phẩm vào giỏ trước khi đặt hàng
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-mint text-white font-semibold rounded-xl hover:bg-mint-dark transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Quay lại"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Đặt hàng</h1>
        </div>

        <CheckoutForm />
      </div>
    </div>
  );
}
