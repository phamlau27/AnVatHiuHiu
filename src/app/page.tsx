"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ProductGrid from "@/components/product/ProductGrid";
import CategoryBar from "@/components/product/CategoryBar";
import { mockProducts } from "@/data/mockProducts";
import { CATEGORIES } from "@/types";
import type { Product } from "@/types";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

// Convert mock data to full Product type
const allProducts: Product[] = mockProducts.map((p) => ({
  ...p,
  createdAt: Timestamp.now(),
}));

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return allProducts;
    return allProducts.filter((p) => p.category === activeCategory);
  }, [activeCategory]);


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mint/30 via-mint-light/40 to-white">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl md:text-6xl block mb-3"
            >
              🍿
            </motion.span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-text-primary mb-2">
              Ăn Vặt{" "}
              <span className="gradient-text">Híu Híu</span>
            </h2>
            <p className="text-text-secondary text-sm md:text-base max-w-md mx-auto mb-5">
              Đặt hàng online — Giao tận nhà hoặc nhận tại shop
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-sm font-medium text-text-secondary hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Bạn muốn ăn gì hôm nay?
            </Link>
          </motion.div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-mint-light/20 rounded-full blur-3xl" />
      </section>

      <div className="max-w-5xl mx-auto px-4 space-y-8 py-6">
        {/* Category Chips */}
        <section>
          <CategoryBar activeCategory={activeCategory} onSelect={setActiveCategory} />
        </section>



        {/* All / Filtered Products */}
        <section>
          <h3 className="text-lg font-bold mb-3">
            {activeCategory
              ? CATEGORIES.find((c) => c.slug === activeCategory)?.name || "Sản phẩm"
              : "🛒 Tất cả sản phẩm"}
          </h3>
          <ProductGrid products={filteredProducts} />
        </section>
      </div>
    </div>
  );
}
