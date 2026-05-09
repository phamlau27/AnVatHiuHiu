"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { showToast } from "@/components/ui/Toast";
import { formatPrice } from "@/data/mockProducts";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const mounted = useHasMounted();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    showToast(`Đã thêm "${product.name}" vào giỏ!`, "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.6), duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group relative border border-border/40"
    >
      {/* Promo Badge */}
      {product.isPromotion && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
          🔥 KM
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square bg-surface overflow-hidden relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          priority={index < 4}
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-base font-bold text-teal-700">
            {formatPrice(product.price)}
          </span>
          {product.isPromotion && product.promoPrice && (
            <span className="text-xs text-text-secondary line-through">
              {formatPrice(product.promoPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button (mobile always visible) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className="w-full py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 active:scale-95 text-white text-sm font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md md:hidden"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Thêm vào giỏ
        </motion.button>

        {/* Desktop: always visible add to cart */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className="hidden md:flex w-full py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-bold rounded-xl transition-all duration-150 items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Thêm vào giỏ
        </motion.button>
      </div>
    </motion.div>
  );
}
