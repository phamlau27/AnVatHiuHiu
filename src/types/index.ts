import { Timestamp } from "firebase/firestore";

// ─── Product ─────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  imageUrl: string;
  category: string;
  isPromotion: boolean;
  soldCount: number;
  description?: string;
  descriptionImages?: string[];
  createdAt: Timestamp;
}

// ─── Order ───────────────────────────────────────────
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  type: "delivery" | "pickup";
  note: string;
  items: OrderItem[];
  totalPrice: number;
  status: "new" | "processing" | "completed" | "cancelled" | "archived";
  adminDeleted?: boolean;
  createdAt: Timestamp;
}

// ─── Cart ────────────────────────────────────────────
export interface CartItem extends OrderItem {
  imageUrl: string;
  selected?: boolean;
}

// ─── Categories ──────────────────────────────────────
export const CATEGORIES = [
  { slug: "kho-cha-bong", name: "Khô & Chà Bông", icon: "🥩" },
  { slug: "hat-dinh-duong", name: "Hạt Dinh Dưỡng", icon: "🥜" },
  { slug: "banh-snack", name: "Bánh & Snack", icon: "🍪" },
  { slug: "trai-cay-say-mut", name: "Trái Cây Sấy & Mứt", icon: "🍌" },
  { slug: "keo-thach", name: "Kẹo & Thạch", icon: "🍬" },
  { slug: "gia-vi-khac", name: "Gia Vị & Khác", icon: "🌶️" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

// ─── Sort Options ────────────────────────────────────
export const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "newest", label: "Mới nhất" },
  { value: "best-selling", label: "Bán chạy" },

  { value: "price-desc", label: "Giá giảm dần" },
  { value: "price-asc", label: "Giá tăng dần" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
