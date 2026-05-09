"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import CategoryBar from "@/components/product/CategoryBar";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { getProductsPaginated } from "@/lib/firestore";
import { CATEGORIES } from "@/types";
import type { Product } from "@/types";
import type { DocumentSnapshot } from "firebase/firestore";
import Link from "next/link";

const PAGE_SIZE = 30;

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const fetchProducts = useCallback(async (category?: string) => {
    setLoading(true);
    setProducts([]);
    setLastDoc(null);
    try {
      const result = await getProductsPaginated({ category, pageSize: PAGE_SIZE });
      setProducts(result.products);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getProductsPaginated({
        category: activeCategory,
        pageSize: PAGE_SIZE,
        lastDoc,
      });
      setProducts((prev) => [...prev, ...result.products]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCategoryChange = (cat?: string) => {
    setActiveCategory(cat);
  };

  const categoryName = activeCategory
    ? CATEGORIES.find((c) => c.slug === activeCategory)?.name
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488] via-[#14b8a6] to-[#5eead4]" />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-300/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center md:text-left"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="text-5xl md:text-6xl mb-4 block"
              >
                🍿
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
                Ăn Vặt{" "}
                <span className="text-yellow-300">Híu Híu</span>
              </h2>
              <p className="text-teal-100 text-base md:text-lg max-w-sm mx-auto md:mx-0 mb-6">
                Snack ngon mỗi ngày 🎉 Giao tận nhà hoặc nhận tại shop — nhanh &amp; tiện!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-700 font-bold rounded-2xl shadow-lg hover:bg-yellow-50 transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tìm món ngon
                </Link>
                <button
                  onClick={() => document.getElementById("product-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/25 transition-all"
                >
                  Xem sản phẩm ↓
                </button>
              </div>
            </motion.div>

            {/* Floating snack icons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:flex relative w-64 h-64 shrink-0"
            >
              {[
                { emoji: "🍜", delay: 0, x: "60%", y: "5%" },
                { emoji: "🧃", delay: 0.5, x: "5%", y: "15%" },
                { emoji: "🍡", delay: 1, x: "75%", y: "55%" },
                { emoji: "🍪", delay: 1.5, x: "10%", y: "65%" },
                { emoji: "🥜", delay: 0.8, x: "40%", y: "80%" },
              ].map((item, i) => (
                <motion.span
                  key={i}
                  className="absolute text-4xl select-none"
                  style={{ left: item.x, top: item.y }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    delay: item.delay,
                    ease: "easeInOut",
                  }}
                >
                  {item.emoji}
                </motion.span>
              ))}
              {/* Big center icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <span className="text-8xl drop-shadow-xl">🛒</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto md:mx-0"
          >
            {[
              { icon: "🚚", label: "Giao nhanh" },
              { icon: "✅", label: "Hàng chuẩn" },
              { icon: "💬", label: "Hỗ trợ Zalo" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-teal-100 font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Products Section ─────────────────────────────── */}
      <div id="product-section" className="max-w-5xl mx-auto px-4 space-y-6 py-8">
        {/* Category Bar */}
        <section>
          <CategoryBar activeCategory={activeCategory} onSelect={handleCategoryChange} />
        </section>

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {categoryName ? `${CATEGORIES.find(c => c.slug === activeCategory)?.icon} ${categoryName}` : "🛒 Tất cả sản phẩm"}
              {!loading && (
                <span className="text-sm font-normal text-text-secondary ml-2">
                  ({products.length}{hasMore ? "+" : ""})
                </span>
              )}
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <span className="text-4xl block mb-3">🔍</span>
              <p>Không có sản phẩm trong danh mục này</p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory ?? "all"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
                >
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white border-2 border-teal-500 text-teal-700 font-bold rounded-2xl hover:bg-teal-50 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang tải...
                      </>
                    ) : (
                      <>
                        Xem thêm sản phẩm
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
