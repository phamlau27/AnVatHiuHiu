"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useCartStore } from "@/stores/cartStore";
import { mockProducts, formatPrice } from "@/data/mockProducts";
import type { Product } from "@/types";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { showToast } from "@/components/ui/Toast";

const allProducts: Product[] = mockProducts.map((p) => ({
  ...p,
  createdAt: Timestamp.now(),
}));

export default function FavoritesPage() {
  const mounted = useHasMounted();
  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const addItem = useCartStore((s) => s.addItem);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const favoriteProducts = useMemo(() => {
    if (!mounted) return [];
    return allProducts.filter((p) => favorites.includes(p.id));
  }, [mounted, favorites]);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === favoriteProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(favoriteProducts.map((p) => p.id)));
    }
  };

  const handleAddSelectedToCart = () => {
    const selectedProducts = favoriteProducts.filter((p) => selectedIds.has(p.id));
    selectedProducts.forEach((p) => {
      addItem({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        imageUrl: p.imageUrl,
      });
    });
    showToast(`Đã thêm ${selectedProducts.length} sản phẩm vào giỏ!`, "success");
    setSelectedIds(new Set()); // clear selection
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">❤️ Sản phẩm yêu thích</h1>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">💛</span>
            <p className="text-text-secondary text-sm mb-4">
              Bạn chưa có sản phẩm yêu thích nào
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-mint text-white font-semibold rounded-xl hover:bg-mint-dark transition-colors"
            >
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === favoriteProducts.length && favoriteProducts.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded accent-mint"
                />
                <span className="text-sm font-medium">Chọn tất cả</span>
              </label>
              <span className="text-text-secondary text-sm">
                Đã chọn {selectedIds.size}/{favoriteProducts.length}
              </span>
            </div>

            <div className="space-y-3">
              {favoriteProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => handleToggleSelect(product.id)}
                    className="w-5 h-5 rounded accent-mint shrink-0"
                  />
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface relative shrink-0">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                    <div className="text-mint-dark font-bold text-sm mt-1">{formatPrice(product.price)}</div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    aria-label="Bỏ thích"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom Action Bar */}
            {selectedIds.size > 0 && (
              <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-white border-t border-border z-40">
                <div className="max-w-3xl mx-auto flex gap-3">
                  <button
                    onClick={handleAddSelectedToCart}
                    className="flex-1 py-3 bg-mint text-white font-bold rounded-xl hover:bg-mint-dark transition-colors"
                  >
                    Thêm {selectedIds.size} món vào giỏ
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
