"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface FlyingItem {
  id: string;
  startX: number;
  startY: number;
  productImage: string;
}

export default function FlyingItemAnimation() {
  const [items, setItems] = useState<FlyingItem[]>([]);
  const [cartPos, setCartPos] = useState({ x: 0, y: 0 });

  // Get cart icon position dynamically
  const updateCartPos = useCallback(() => {
    const cartIcon = document.getElementById("cart-icon-header");
    if (cartIcon) {
      const rect = cartIcon.getBoundingClientRect();
      setCartPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    } else {
      // Fallback: top-right area
      setCartPos({ x: window.innerWidth - 32, y: 28 });
    }
  }, []);

  useEffect(() => {
    updateCartPos();
    window.addEventListener("resize", updateCartPos);
    return () => window.removeEventListener("resize", updateCartPos);
  }, [updateCartPos]);

  useEffect(() => {
    const handleAddToCart = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { startX, startY, productImage } = customEvent.detail;

      updateCartPos();

      const id = `${Date.now()}-${Math.random()}`;
      setItems((prev) => [...prev, { id, startX, startY, productImage }]);

      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 650);
    };

    window.addEventListener("addToCartAnimation", handleAddToCart);
    return () => window.removeEventListener("addToCartAnimation", handleAddToCart);
  }, [updateCartPos]);

  return (
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{
            x: item.startX - 25,
            y: item.startY - 25,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: cartPos.x - 25,
            y: cartPos.y - 25,
            scale: 0.15,
            opacity: 0.6,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="fixed pointer-events-none z-[9999] rounded-xl overflow-hidden shadow-xl"
          style={{ width: 50, height: 50 }}
        >
          <Image
            src={item.productImage}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
