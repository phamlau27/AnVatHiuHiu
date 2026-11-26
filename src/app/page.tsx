"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import CategoryBar from "@/components/product/CategoryBar";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import {
  fetchProductsPage,
  prefetchProductsPage,
  prefetchAllProductsForSearch,
} from "@/lib/firestore";
import { CATEGORIES } from "@/types";
import type { Product } from "@/types";
import Link from "next/link";

const PAGE_SIZE = 12;

/* ── Antigravity Firework Snacks ───────────────────
   Lightweight snack emojis floating around hero
   ──────────────────────────────────────────────────── */
const FIREWORK_SNACKS = [
  { emoji: "🍬", endX: "35vw", endY: "-40vh", size: "text-4xl", delay: 0 },
  { emoji: "🧁", endX: "45vw", endY: "20vh", size: "text-5xl", delay: 0.8 },
  { emoji: "🍪", endX: "-45vw", endY: "15vh", size: "text-5xl", delay: 1.5 },
  { emoji: "🥜", endX: "15vw", endY: "-45vh", size: "text-4xl", delay: 2.2 },
  { emoji: "🍿", endX: "-35vw", endY: "-30vh", size: "text-5xl", delay: 0.4 },
  { emoji: "🍫", endX: "25vw", endY: "40vh", size: "text-4xl", delay: 1.2 },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchProductsPage({ category: activeCategory, offset: 0, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.products);
        setHasMore(res.hasMore);

        // Background prefetch next page and search index for instant interactions
        if (res.hasMore) {
          prefetchProductsPage({
            category: activeCategory,
            offset: res.products.length,
            limit: PAGE_SIZE,
          });
        }
        prefetchAllProductsForSearch();
      })
      .catch((err) => {
        if (!cancelled) console.error("Error loading products:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextOffset = products.length;
      const res = await fetchProductsPage({
        category: activeCategory,
        offset: nextOffset,
        limit: PAGE_SIZE,
      });
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNext = res.products.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueNext];
      });
      setHasMore(res.hasMore);

      if (res.hasMore) {
        prefetchProductsPage({
          category: activeCategory,
          offset: nextOffset + res.products.length,
          limit: PAGE_SIZE,
        });
      }
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCategoryChange = (cat?: string) => {
    if (cat === activeCategory) return;
    setLoading(true);
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
      <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center">
        {/* ── Rich gradient bg (radial gradients instead of heavy GPU blur filters) ── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(94, 234, 212, 0.18) 0%, rgba(240, 253, 250, 0.7) 40%, #FAFBFF 80%)",
          }}
        />

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
        <div className="relative z-20 w-full max-w-4xl mx-auto px-5 text-center mt-8 md:mt-0 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Brand title - Massive and dominant (fixed line-height for diacritics) */}
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] leading-[1.2] pb-2 font-black tracking-tight mb-3">
              <span className="hero-brand block">Ăn Vặt</span>
              <span className="hero-brand-accent block">Hai Híu</span>
            </h1>

            {/* Tagline — clean, secondary */}
            <p className="text-gray-500 text-lg sm:text-xl md:text-2xl max-w-lg mx-auto mb-8 font-semibold">
              Ăn là ghiền, đặt là có ngay.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/search"
                className="cta-glow inline-flex items-center justify-center gap-2.5 w-[200px] sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 via-teal-500 to-teal-600 text-white font-bold text-base rounded-full shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30 active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Tìm món ngon
              </Link>

              <button
                type="button"
                onClick={() => document.getElementById("product-section")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 w-[200px] sm:w-auto px-8 py-4 bg-white/90 text-teal-700 font-semibold text-base rounded-full border border-teal-200/80 hover:bg-white hover:border-teal-300 active:scale-95 active:bg-teal-50 transition-all shadow-sm cursor-pointer"
              >
                Xem sản phẩm
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </section>


      {/* ════════════════════════════════════════════════════
          PRODUCTS SECTION
         ════════════════════════════════════════════════════ */}
      <div id="product-section" className="scroll-mt-16 max-w-5xl mx-auto px-4 space-y-6 py-6">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

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
