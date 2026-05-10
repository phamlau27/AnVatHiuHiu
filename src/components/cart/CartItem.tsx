"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/data/mockProducts";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  isInvalid?: boolean;
}

export default function CartItem({ item, isInvalid = false }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      className="flex gap-3 bg-surface rounded-xl p-3"
    >
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={item.selected && !isInvalid}
          disabled={isInvalid}
          onChange={() => useCartStore.getState().toggleSelectItem(item.productId)}
          className="w-5 h-5 rounded accent-mint cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 relative">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      {/* Info */}
      <div className={`flex-1 min-w-0 ${isInvalid ? "opacity-60 grayscale" : ""}`}>
        <h4 className="text-sm font-semibold text-text-primary">
          {item.name}
        </h4>
        <p className="text-sm font-bold text-mint-dark mt-0.5">
          {formatPrice(item.price)}
        </p>
        {isInvalid && (
          <p className="text-xs font-bold text-red-500 mt-1">
            Sản phẩm không còn tồn tại
          </p>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className={`flex items-center gap-2 bg-white rounded-lg ${isInvalid ? "opacity-50 pointer-events-none" : ""}`}>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-border transition-colors text-text-secondary"
              aria-label="Giảm số lượng"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-border transition-colors text-text-secondary"
              aria-label="Tăng số lượng"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() => removeItem(item.productId)}
            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Xóa khỏi giỏ"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
