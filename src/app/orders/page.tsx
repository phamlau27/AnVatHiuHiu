"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useOrderHistoryStore } from "@/stores/orderHistoryStore";
import { getOrdersByIds } from "@/lib/firestore";
import { formatPrice } from "@/data/mockProducts";
import type { Order } from "@/types";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

function formatDate(timestamp: Timestamp | undefined): string {
  if (!timestamp || !(timestamp instanceof Timestamp)) return "N/A";
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function OrdersPage() {
  const mounted = useHasMounted();
  const orderIds = useOrderHistoryStore((s) => s.orderIds);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;
    async function fetchOrders() {
      if (orderIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const fetched = await getOrdersByIds(orderIds);
        setOrders(fetched);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [mounted, orderIds]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-6">📦 Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📋</span>
            <p className="text-text-secondary text-sm mb-4">
              Bạn chưa có đơn hàng nào
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-mint text-white font-semibold rounded-xl hover:bg-mint-dark transition-colors"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-4 py-3 bg-surface flex items-center justify-between">
                  <div>
                    <span className="text-xs text-text-secondary">Mã đơn </span>
                    <span className="text-xs font-mono font-bold text-mint-dark">
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === "new"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "processing"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "completed" || order.status === "archived"
                        ? "bg-green-100 text-green-700"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status === "new" && "Chờ xác nhận"}
                    {order.status === "processing" && "Đang xử lý"}
                    {(order.status === "completed" || order.status === "archived") && "Đã hoàn thành"}
                    {order.status === "cancelled" && "Đã hủy"}
                  </span>
                </div>

                {/* Order Items */}
                <div className="px-4 py-3 space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="px-4 py-3 border-t border-border/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-text-secondary">
                      <span>{order.type === "delivery" ? "🚚 Giao hàng" : "🏪 Tự đến lấy"}</span>
                      <span className="mx-1.5">•</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <span className="font-bold text-mint-dark">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                  
                  {(order.status === "new" || order.status === "processing") && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={async () => {
                          if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
                          try {
                            const { updateOrderStatus } = await import("@/lib/firestore");
                            await updateOrderStatus(order.id, "cancelled");
                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "cancelled" } : o));
                            alert("Đã hủy đơn hàng thành công!");
                          } catch (err) {
                            console.error(err);
                            alert("Lỗi: Không thể hủy đơn hàng lúc này.");
                          }
                        }}
                        className="px-4 py-1.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
