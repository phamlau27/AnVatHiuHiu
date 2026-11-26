import { memo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { showToast } from "@/components/ui/Toast";
import { formatPrice } from "@/data/mockProducts";
import type { Product } from "@/types";
import Modal from "@/components/ui/Modal";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = memo(function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [showDesc, setShowDesc] = useState(false);
  const [extraImages, setExtraImages] = useState<string[] | null>(
    product.descriptionImages ?? null
  );
  const [loadingImages, setLoadingImages] = useState(false);

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

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.description && !product.hasDescriptionImages && !extraImages?.length) {
      return;
    }
    setShowDesc(true);
    if (product.hasDescriptionImages && extraImages === null && !loadingImages) {
      setLoadingImages(true);
      fetch(`/api/products/${product.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.descriptionImages)) {
            setExtraImages(data.descriptionImages);
          } else {
            setExtraImages([]);
          }
        })
        .catch(() => setExtraImages([]))
        .finally(() => setLoadingImages(false));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.015, 0.12), duration: 0.2, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 group relative border border-border/40 flex flex-col h-full cursor-pointer"
        onClick={handleImageClick}
      >
        {/* Promo Badge */}
        {product.isPromotion && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            🔥 KM
          </div>
        )}

        {/* Product Image */}
        <div className="aspect-square bg-surface overflow-hidden relative shrink-0">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            priority={index < 4}
          />
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col flex-grow">
          <h3 className="text-sm font-semibold text-text-primary leading-tight mb-2">
            {product.name}
          </h3>

          <div className="mt-auto flex flex-col">
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

            {/* Single Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="w-full py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 active:scale-95 text-white text-sm font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Thêm vào giỏ
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Description Popup Modal */}
      {(product.description || product.hasDescriptionImages || (extraImages && extraImages.length > 0)) && (
        <Modal isOpen={showDesc} onClose={() => setShowDesc(false)} title={product.name}>
          <div className="relative">
            <div className="space-y-4 pb-4">
              {/* Horizontal Scroll Images */}
              {loadingImages && (
                <div className="w-full aspect-square rounded-2xl skeleton" />
              )}
              {!loadingImages && extraImages && extraImages.length > 0 && (
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 hide-scrollbar">
                  {extraImages.map((img, idx) => (
                    <div key={idx} className="flex-none w-[80%] snap-center rounded-2xl overflow-hidden border border-border shadow-sm bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`${product.name} detail ${idx + 1}`} className="w-full h-auto object-contain aspect-square p-2" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-teal-700">{formatPrice(product.price)}</span>
              </div>

              {product.description && (
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {product.description}
                </p>
              )}
            </div>

            {/* Sticky Action Button */}
            <div className="sticky bottom-0 bg-white pt-2 pb-1 border-t border-border/50">
              <button
                onClick={(e) => {
                  handleAddToCart(e);
                  setShowDesc(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
});

export default ProductCard;
