"use client";

import { motion } from "framer-motion";
import { CATEGORIES } from "@/types";

interface CategoryBarProps {
  activeCategory?: string;
  onSelect: (slug: string | undefined) => void;
}

export default function CategoryBar({ activeCategory, onSelect }: CategoryBarProps) {
  return (
    <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
      <div className="flex gap-2 py-2 w-max">
        {/* All */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(undefined)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !activeCategory
              ? "bg-mint text-white shadow-sm"
              : "bg-surface text-text-secondary hover:bg-mint/20"
          }`}
        >
          <span>🛒</span>
          <span>Tất cả</span>
        </motion.button>

        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.slug}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.slug)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.slug
                ? "bg-mint text-white shadow-sm"
                : "bg-surface text-text-secondary hover:bg-mint/20"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
