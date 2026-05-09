"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useOrderHistoryStore } from "@/stores/orderHistoryStore";
import { getOrdersByIds, updateOrderStatus } from "@/lib/firestore";
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
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function fetchOrders() {
    if (orderIds.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetched = await getOrdersByIds(orderIds);
      setOrders(fetched);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mounted) return;
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, orderIds]);

  async function handleCancel(orderId: string) {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    setCancelling(orderId);
    try {
      await updateOrderStatus(orderId, "cancelled");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
    } catch (err) {
      console.error(err);
      alert("Lỗi: Không thể hủy đơn hàng lúc này.");
    } finally {
      setCancelling(null);
    }
  }

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">📦 Đơn hàng của tôi</h1>
          <button
            onClick={fetchOrders}
            className="px-3 py-1.5 bg-white border border-border rounded-xl text-xs font-medium hover:bg-surface transition-colors flex items-center gap-1.5 text-text-secondary"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tải lại
          </button>
        </div>

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
                    <span className="text-xs text-text-secondary ml-2">• {formatDate(order.createdAt)}</span>
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
                    {order.status === "new" && "⏳ Chờ xác nhận"}
                    {order.status === "processing" && "🔵 Đang xử lý"}
                    {(order.status === "completed" || order.status === "archived") && "✅ Đã hoàn thành"}
                    {order.status === "cancelled" && "❌ Đã hủy"}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="px-4 py-3 border-b border-border/50 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-secondary w-28 shrink-0">👤 Người đặt</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-secondary w-28 shrink-0">📞 SĐT</span>
                    <span className="font-medium">{order.phone}</span>
                  </div>
                  {order.type === "delivery" && order.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-text-secondary w-28 shrink-0">📍 Địa chỉ</span>
                      <span className="font-medium">{order.address}</span>
                    </div>
                  )}
                  {order.type === "pickup" && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text-secondary w-28 shrink-0">🏪 Hình thức</span>
                      <span className="font-medium">Tự đến lấy</span>
                    </div>
                  )}
                  {order.note && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-text-secondary w-28 shrink-0">📝 Ghi chú</span>
                      <span className="italic text-text-secondary">{order.note}</span>
                    </div>
                  )}
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
                <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">
                    {order.type === "delivery" ? "🚚 Giao hàng" : "🏪 Tự đến lấy"}
                  </span>
                  <span className="font-bold text-mint-dark">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>

                {/* Edit & Cancel buttons - only for "new" status */}
                {order.status === "new" && (
                  <div className="px-4 pb-3 flex justify-end gap-2">
                    <Link
                      href={`/orders/edit/${order.id}`}
                      className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Sửa đơn hàng
                    </Link>
                    <button
                      disabled={cancelling === order.id}
                      onClick={() => handleCancel(order.id)}
                      className="px-4 py-1.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {cancelling === order.id ? "Đang hủy..." : "Hủy đơn hàng"}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
