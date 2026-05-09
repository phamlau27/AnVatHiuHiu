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

/* ── Floating snack data ──────────────────────────────── */
const FLOATING_SNACKS = [
  { emoji: "🍿", size: "text-5xl", left: "8%",  top: "12%", delay: 0,   dur: 4.2, range: 14 },
  { emoji: "🍪", size: "text-4xl", left: "78%", top: "8%",  delay: 0.6, dur: 3.8, range: 12 },
  { emoji: "🧃", size: "text-5xl", left: "85%", top: "55%", delay: 1.2, dur: 4.5, range: 16 },
  { emoji: "🍡", size: "text-4xl", left: "5%",  top: "68%", delay: 0.3, dur: 3.6, range: 10 },
  { emoji: "🥜", size: "text-3xl", left: "60%", top: "75%", delay: 1.8, dur: 5.0, range: 12 },
];

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
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Soft gradient background: white → mint */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f0fdf9] to-[#ccfbf1]" />

        {/* Blurred decorative shapes */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-300/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-teal-400/15 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-emerald-200/20 rounded-full blur-[90px]" />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #0d9488 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-5 py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* ── Left: Text + CTA ── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex-1 text-center md:text-left z-10"
            >
              {/* Brand title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-4">
                <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Ăn Vặt
                </span>
                <br />
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-400 bg-clip-text text-transparent">
                  Híu Híu
                </span>
                <motion.span
                  className="inline-block ml-2 text-4xl md:text-5xl"
                  animate={{ rotate: [0, 12, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  ✨
                </motion.span>
              </h1>

              <p className="text-gray-500 text-base md:text-lg max-w-md mx-auto md:mx-0 mb-8 leading-relaxed">
                Snack ngon mỗi ngày — Giao tận nhà hoặc nhận tại shop, nhanh & tiện!
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm món ngon
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <button
                    onClick={() => document.getElementById("product-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-teal-700 font-semibold rounded-2xl border-2 border-teal-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all shadow-sm"
                  >
                    Xem sản phẩm
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </motion.div>
              </div>

              {/* Stats strip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex gap-6 justify-center md:justify-start"
              >
                {[
                  { icon: "🚚", label: "Giao nhanh", sub: "Nội thành" },
                  { icon: "💯", label: "Hàng chuẩn", sub: "Đảm bảo" },
                  { icon: "💬", label: "Hỗ trợ Zalo", sub: "24/7" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-700">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Right: Floating Visuals ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-72 h-72 md:w-80 md:h-80 shrink-0"
            >
              {/* Center glow */}
              <div className="absolute inset-8 bg-gradient-to-br from-teal-200/40 to-amber-100/40 rounded-full blur-2xl" />

              {/* Floating snack emojis */}
              {FLOATING_SNACKS.map((snack, i) => (
                <motion.span
                  key={i}
                  className={`absolute ${snack.size} select-none cursor-pointer filter drop-shadow-lg`}
                  style={{ left: snack.left, top: snack.top }}
                  animate={{
                    y: [0, -snack.range, 0],
                    rotate: [0, i % 2 === 0 ? 8 : -8, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: snack.dur,
                    delay: snack.delay,
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.3, rotate: 15, transition: { duration: 0.2 } }}
                >
                  {snack.emoji}
                </motion.span>
              ))}

              {/* Center icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              >
                <span className="text-8xl md:text-9xl drop-shadow-2xl">🛒</span>
              </motion.div>
            </motion.div>
          </div>
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
