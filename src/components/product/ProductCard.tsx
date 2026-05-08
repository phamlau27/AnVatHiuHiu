"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
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

  const displayPrice = product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    showToast(`Đã thêm "${product.name}" vào giỏ!`, "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
    >
      {/* Product Image */}
      <div className="aspect-square bg-surface overflow-hidden relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-tight mb-1.5 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-base font-bold text-mint-dark">
            {formatPrice(displayPrice)}
          </span>

        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className="w-full py-2 bg-mint hover:bg-mint-dark text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm vào giỏ
        </motion.button>
      </div>
    </motion.div>
  );
}
