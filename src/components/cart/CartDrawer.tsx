"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import CartItem from "./CartItem";
import { formatPrice } from "@/data/mockProducts";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductsByIds } from "@/lib/firestore";

export default function CartDrawer() {
  const mounted = useHasMounted();
  const isOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const cartMode = useUIStore((s) => s.cartMode);
  const onCartSubmit = useUIStore((s) => s.onCartSubmit);
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const selectedCount = useCartStore((s) => s.getSelectedItemsCount());
  const allSelected = items.length > 0 && items.every(i => i.selected);

  const [invalidProductIds, setInvalidProductIds] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      let isCurrent = true;
      setIsValidating(true);
      (async () => {
        try {
          const productIds = items.map(i => i.productId);
          const validProducts = await getProductsByIds(productIds);
          const validIds = new Set(validProducts.map(p => p.id));
          const invalidIds = productIds.filter(id => !validIds.has(id));
          
          if (isCurrent) {
            setInvalidProductIds(invalidIds);
            
            // Auto unselect invalid items so they don't count towards total
            if (invalidIds.length > 0) {
              const { toggleSelectItem } = useCartStore.getState();
              items.forEach(item => {
                if (item.selected && invalidIds.includes(item.productId)) {
                  toggleSelectItem(item.productId);
                }
              });
            }
          }
        } catch (error) {
          console.error("Cart validation failed:", error);
        } finally {
          if (isCurrent) setIsValidating(false);
        }
      })();
      return () => { isCurrent = false; };
    }
  }, [isOpen, items.length]); // Intentionally not depending on full items array to avoid infinite loop on toggle

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-[70] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-[75] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">Giỏ hàng</h2>
                {totalItems > 0 && (
                  <span className="bg-mint text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                aria-label="Đóng giỏ hàng"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Select All */}
            {items.length > 0 && (
              <div className="px-5 py-3 border-b border-border bg-surface flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => useCartStore.getState().selectAll(e.target.checked)}
                    className="w-5 h-5 rounded accent-mint cursor-pointer"
                  />
                  <span className="text-sm font-medium">Chọn tất cả</span>
                </label>
                <button
                  onClick={() => useCartStore.getState().clearCart()}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-6xl mb-4">🛒</span>
                  <p className="text-text-secondary text-sm mb-1">Giỏ hàng trống</p>
                  <p className="text-text-secondary text-xs">Hãy thêm món ăn vặt yêu thích!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((item) => (
                      <CartItem 
                        key={item.productId} 
                        item={item} 
                        isInvalid={invalidProductIds.includes(item.productId)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">Tổng cộng</span>
                  <span className="text-xl font-bold text-mint-dark">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                {cartMode === "edit-order" ? (
                  <button
                    onClick={() => {
                      if (selectedCount > 0 && onCartSubmit) {
                        onCartSubmit();
                        closeCart();
                      }
                    }}
                    disabled={selectedCount === 0}
                    className={`block w-full py-3 text-center rounded-xl font-bold transition-colors ${
                      selectedCount > 0
                        ? "bg-mint hover:bg-mint-dark text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Thêm món ({selectedCount})
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={(e) => {
                      if (selectedCount === 0) e.preventDefault();
                      else closeCart();
                    }}
                    className={`block w-full py-3 text-center rounded-xl font-bold transition-colors ${
                      selectedCount > 0
                        ? "bg-mint hover:bg-mint-dark text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Đặt hàng ({selectedCount} món)
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
