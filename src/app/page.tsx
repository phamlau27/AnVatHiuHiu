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

/* ── Layered floating snack objects ───────────────────
   depth: "front" | "mid" | "back" controls scale, blur, opacity
   ──────────────────────────────────────────────────── */
const SNACK_OBJECTS = [
  // Back layer — faded, small, slow
  { emoji: "🍬", left: "5%",  top: "18%", depth: "back",  delay: 0,   dur: 6.0, range: 10 },
  { emoji: "🧁", left: "88%", top: "22%", depth: "back",  delay: 1.0, dur: 5.5, range: 8  },
  { emoji: "🫘", left: "75%", top: "78%", depth: "back",  delay: 2.0, dur: 6.2, range: 9  },
  // Mid layer — normal size
  { emoji: "🍪", left: "15%", top: "60%", depth: "mid",   delay: 0.3, dur: 4.5, range: 14 },
  { emoji: "🥜", left: "70%", top: "45%", depth: "mid",   delay: 1.5, dur: 4.0, range: 12 },
  { emoji: "🍡", left: "50%", top: "15%", depth: "mid",   delay: 0.8, dur: 4.8, range: 15 },
  // Front layer — large, sharp, fast
  { emoji: "🍿", left: "25%", top: "35%", depth: "front", delay: 0.5, dur: 3.5, range: 18 },
];

const DEPTH_STYLES = {
  back:  { scale: 0.6, opacity: 0.35, blur: "blur-[1px]", size: "text-3xl" },
  mid:   { scale: 0.85, opacity: 0.65, blur: "",          size: "text-4xl md:text-5xl" },
  front: { scale: 1.0,  opacity: 0.9,  blur: "",          size: "text-5xl md:text-6xl" },
};

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
      {/* ════════════════════════════════════════════════════
          HERO SECTION — mobile-first, layered depth
         ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden grain-overlay">
        {/* ── Rich gradient bg ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50 via-white to-background md:bg-gradient-to-br md:from-teal-50/80 md:via-[#f0fdfa] md:to-white" />

        {/* ── Blur blobs ── */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-teal-300/25 to-cyan-200/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-teal-400/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-100/25 rounded-full blur-[100px]" />

        {/* ── Content ── */}
        <div className="relative max-w-5xl mx-auto px-5 pt-10 pb-6 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-16">

            {/* ────── LEFT: Text + CTA (mobile: centered) ────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 text-center md:text-left z-10 order-2 md:order-1"
            >
              {/* Brand title */}
              <h2 className="text-[2.5rem] leading-[1.05] sm:text-5xl md:text-6xl font-black tracking-tight mb-3">
                <span className="hero-brand">Ăn Vặt</span>
                <br />
                <span className="hero-brand-accent">Híu Híu</span>
              </h2>

              {/* Tagline — short, catchy */}
              <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-sm mx-auto md:mx-0 mb-7 font-medium">
                Đặt snack ngon — giao tận tay bạn 🚀
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <motion.div whileTap={{ scale: 0.93 }}>
                  <Link
                    href="/search"
                    className="cta-glow inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600 text-white font-bold text-base rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 active:shadow-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Tìm món ngon
                  </Link>
                </motion.div>

                <motion.div whileTap={{ scale: 0.93 }}>
                  <button
                    onClick={() => document.getElementById("product-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-teal-700 font-semibold text-base rounded-2xl border border-teal-200/80 hover:bg-white hover:border-teal-300 active:bg-teal-50 transition-all shadow-sm"
                  >
                    Xem sản phẩm
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* ────── RIGHT: Floating Snack Visuals ────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 shrink-0 order-1 md:order-2"
            >
              {/* Ambient glow behind objects */}
              <div className="absolute inset-6 bg-gradient-to-br from-teal-200/30 via-cyan-100/20 to-amber-100/25 rounded-full blur-3xl" />

              {/* Layered floating snacks */}
              {SNACK_OBJECTS.map((snack, i) => {
                const depth = DEPTH_STYLES[snack.depth as keyof typeof DEPTH_STYLES];
                return (
                  <motion.span
                    key={i}
                    className={`absolute ${depth.size} ${depth.blur} select-none cursor-pointer`}
                    style={{
                      left: snack.left,
                      top: snack.top,
                      opacity: depth.opacity,
                      transform: `scale(${depth.scale})`,
                    }}
                    animate={{
                      y: [0, -snack.range, 0],
                      rotate: [0, i % 2 === 0 ? 6 : -6, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: snack.dur,
                      delay: snack.delay,
                      ease: "easeInOut",
                    }}
                    whileHover={{ scale: depth.scale * 1.25, rotate: 12, transition: { duration: 0.2 } }}
                    whileTap={{ scale: depth.scale * 0.9 }}
                  >
                    {snack.emoji}
                  </motion.span>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Bottom fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ════════════════════════════════════════════════════
          PRODUCTS SECTION
         ════════════════════════════════════════════════════ */}
      <div id="product-section" className="max-w-5xl mx-auto px-4 space-y-6 py-6">
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

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3.5 bg-white border border-teal-200 text-teal-700 font-bold rounded-2xl hover:bg-teal-50 hover:border-teal-300 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
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
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
