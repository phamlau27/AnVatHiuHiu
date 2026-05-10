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

/* ── Antigravity Firework Snacks ───────────────────
   Snack emojis exploding outwards from center
   ──────────────────────────────────────────────────── */
const FIREWORK_SNACKS = [
  { emoji: "🍬", endX: "35vw", endY: "-40vh", size: "text-4xl", delay: 0 },
  { emoji: "🧁", endX: "45vw", endY: "20vh", size: "text-5xl", delay: 0.5 },
  { emoji: "🫘", endX: "-35vw", endY: "-30vh", size: "text-3xl", delay: 1 },
  { emoji: "🍪", endX: "-50vw", endY: "15vh", size: "text-6xl", delay: 1.5 },
  { emoji: "🥜", endX: "15vw", endY: "-50vh", size: "text-4xl", delay: 2 },
  { emoji: "🍡", endX: "-20vw", endY: "40vh", size: "text-5xl", delay: 2.5 },
  { emoji: "🍿", endX: "50vw", endY: "-10vh", size: "text-6xl", delay: 0.2 },
  { emoji: "🍭", endX: "-55vw", endY: "-20vh", size: "text-3xl", delay: 0.7 },
  { emoji: "🍫", endX: "25vw", endY: "45vh", size: "text-4xl", delay: 1.2 },
  { emoji: "🍩", endX: "-25vw", endY: "35vh", size: "text-5xl", delay: 1.7 },
  { emoji: "🍟", endX: "40vw", endY: "-25vh", size: "text-3xl", delay: 2.2 },
  { emoji: "🥨", endX: "-45vw", endY: "-45vh", size: "text-5xl", delay: 2.7 },
  { emoji: "🍔", endX: "0vw", endY: "-55vh", size: "text-6xl", delay: 0.9 },
  { emoji: "🍕", endX: "0vw", endY: "50vh", size: "text-5xl", delay: 1.4 },
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
      {/* ════════════════════════════════════════════════════
          HERO SECTION — Antigravity Mobile-first Web Style
         ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden grain-overlay min-h-[85vh] flex items-center justify-center">
        {/* ── Rich gradient bg ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50 via-white to-background md:bg-gradient-to-br md:from-teal-50/80 md:via-[#f0fdfa] md:to-white" />

        {/* ── Blur blobs ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-teal-300/20 to-cyan-200/15 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[100px]" />

        {/* ── Antigravity Firework Snacks ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none z-0">
          {FIREWORK_SNACKS.map((snack, i) => (
            <motion.span
              key={i}
              className={`absolute top-0 left-0 -ml-4 -mt-4 ${snack.size} select-none`}
              initial={{ x: 0, y: "10vh", opacity: 0, scale: 0 }}
              animate={{
                x: snack.endX,
                y: snack.endY,
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1, 0.6],
                rotate: i % 2 === 0 ? 180 : -180,
              }}
              transition={{
                repeat: Infinity,
                duration: 5, 
                delay: snack.delay,
                ease: "easeOut",
              }}
            >
              {snack.emoji}
            </motion.span>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-5 text-center mt-8 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Brand title - Massive and dominant (fixed line-height for diacritics) */}
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] leading-[1.2] pb-2 font-black tracking-tight mb-3">
              <span className="hero-brand block">Ăn Vặt</span>
              <span className="hero-brand-accent block">Híu Híu</span>
            </h1>

            {/* Tagline — clean, secondary */}
            <p className="text-gray-500 text-lg sm:text-xl md:text-2xl max-w-lg mx-auto mb-8 font-semibold">
              Ăn là ghiền, đặt là có ngay.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <motion.div whileTap={{ scale: 0.93 }}>
                <Link
                  href="/search"
                  className="cta-glow inline-flex items-center justify-center gap-2.5 w-[200px] sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600 text-white font-bold text-base rounded-full shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 active:shadow-lg transition-all"
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
                  className="inline-flex items-center justify-center gap-2 w-[200px] sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-teal-700 font-semibold text-base rounded-full border border-teal-200/80 hover:bg-white hover:border-teal-300 active:bg-teal-50 transition-all shadow-sm"
                >
                  Xem sản phẩm
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
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
