"use client";

import { useState, useMemo, useCallback, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import SearchBar from "@/components/product/SearchBar";
import { fetchAllProductsCached } from "@/lib/firestore";
import { SORT_OPTIONS } from "@/types";
import type { Product, SortValue } from "@/types";

const PAGE_SIZE = 12;

function getCreatedAtMs(createdAt: Product["createdAt"]): number {
  if (typeof createdAt === "number") return createdAt;
  if (createdAt && typeof createdAt === "object") {
    if ("toMillis" in createdAt && typeof createdAt.toMillis === "function") {
      return createdAt.toMillis();
    }
    if ("seconds" in createdAt && typeof createdAt.seconds === "number") {
      return createdAt.seconds * 1000;
    }
  }
  return 0;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialSort = (searchParams.get("sort") as SortValue) || "default";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>(initialSort);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    fetchAllProductsCached()
      .then((data) => {
        if (!cancelled) setAllProducts(data);
      })
      .catch((err) => {
        if (!cancelled) console.error("Lỗi khi tải sản phẩm:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const filteredProducts = useMemo(() => {
    let results = [...allProducts];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Sort
    switch (sortBy) {
      case "newest":
        results.sort((a, b) => getCreatedAtMs(b.createdAt) - getCreatedAtMs(a.createdAt));
        break;
      case "best-selling":
        results.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case "price-asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results.sort((a, b) => b.price - a.price);
        break;
    }

    return results;
  }, [allProducts, searchQuery, sortBy]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Search Bar - immediately interactive */}
        <SearchBar
          products={allProducts}
          onSearch={handleSearch}
          autoFocus
        />

        {/* Sort Options */}
        <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  sortBy === option.value
                    ? "bg-mint text-white shadow-sm"
                    : "bg-surface text-text-secondary hover:bg-mint/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-text-secondary text-sm">
          {loading
            ? "Đang tải sản phẩm..."
            : `${filteredProducts.length} sản phẩm${searchQuery ? ` cho "${searchQuery}"` : ""}`}
        </p>

        {/* Product Grid */}
        <ProductGrid
          products={visibleProducts}
          loading={loading}
          emptyMessage={
            searchQuery
              ? `Không tìm thấy sản phẩm nào cho "${searchQuery}"`
              : "Không có sản phẩm nào"
          }
        />

        {!loading && hasMore && (
          <div className="flex justify-center pt-4 pb-6">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="px-8 py-3 bg-white border border-teal-200 text-teal-700 font-bold rounded-2xl hover:bg-teal-50 hover:border-teal-300 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              Xem thêm ({filteredProducts.length - visibleCount} sản phẩm)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchContent />
    </Suspense>
  );
}
