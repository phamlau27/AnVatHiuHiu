"use client";

import { motion } from "framer-motion";

interface BadgeProps {
  type: "hot" | "sale" | "new";
  className?: string;
}

const config = {
  hot: { label: "Hot", bg: "bg-hot", emoji: "🔥" },
  sale: { label: "Sale", bg: "bg-sale", emoji: "💰" },
  new: { label: "Mới", bg: "bg-blue-500", emoji: "✨" },
};

export default function Badge({ type, className = "" }: BadgeProps) {
  const { label, bg, emoji } = config[type];

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wide ${bg} ${className}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </motion.span>
  );
}
