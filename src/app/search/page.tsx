"use client";

import { useState, useMemo, useCallback, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import SearchBar from "@/components/product/SearchBar";
import { getProducts } from "@/lib/firestore";
import { SORT_OPTIONS } from "@/types";
import type { Product, SortValue } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialSort = (searchParams.get("sort") as SortValue) || "default";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>(initialSort);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();
        setAllProducts(data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
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
        results.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Search Bar */}
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
                onClick={() => setSortBy(option.value)}
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
          {filteredProducts.length} sản phẩm
          {searchQuery && ` cho "${searchQuery}"`}
        </p>

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          emptyMessage={
            searchQuery
              ? `Không tìm thấy sản phẩm nào cho "${searchQuery}"`
              : "Không có sản phẩm nào"
          }
        />
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
