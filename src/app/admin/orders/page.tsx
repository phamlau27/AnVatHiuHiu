"use client";

import { useState, useEffect } from "react";
import { getAllOrders, archiveOrder, unarchiveOrder, deleteOrder } from "@/lib/firestore";
import { formatPrice } from "@/data/mockProducts";
import { showToast } from "@/components/ui/Toast";
import type { Order } from "@/types";
import { Timestamp } from "firebase/firestore";
import Modal from "@/components/ui/Modal";

function formatDate(timestamp: Timestamp | undefined): string {
  if (!timestamp || !(timestamp instanceof Timestamp)) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp.toDate());
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "archived">("new");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchOrders, 120000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(orderId: string) {
    try {
      await archiveOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "archived" as const } : o))
      );
      showToast("Đã đánh dấu xử lý!", "success");
    } catch {
      showToast("Có lỗi xảy ra", "error");
    }
  }

  async function handleUnarchive(orderId: string) {
    try {
      await unarchiveOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "new" as const } : o))
      );
      showToast("Đã chuyển về Mới!", "success");
    } catch {
      showToast("Có lỗi xảy ra", "error");
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm("Bạn có chắc chắn muốn XÓA vĩnh viễn đơn hàng này không?")) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      showToast("Đã xóa đơn hàng!", "success");
    } catch {
      showToast("Có lỗi xảy ra khi xóa", "error");
    }
  }

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    return o.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">📦 Quản lý đơn hàng</h1>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-surface transition-colors"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["new", "archived", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? "bg-mint text-white"
                : "bg-white text-text-secondary hover:bg-surface"
            }`}
          >
            {f === "new" ? `🟡 Mới (${orders.filter((o) => o.status === "new").length})` : 
             f === "archived" ? `✅ Đã xử lý` : "Tất cả"}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 text-center text-text-secondary text-sm">
          Không có đơn hàng nào
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-text-secondary">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Khách hàng</th>
                  <th className="text-left px-5 py-3 font-medium">SĐT</th>
                  <th className="text-left px-5 py-3 font-medium">Loại</th>
                  <th className="text-left px-5 py-3 font-medium">Món</th>
                  <th className="text-right px-5 py-3 font-medium">Tổng</th>
                  <th className="text-left px-5 py-3 font-medium">Thời gian</th>
                  <th className="text-center px-5 py-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-5 py-3 font-medium">{order.customerName}</td>
                    <td className="px-5 py-3 text-text-secondary">{order.phone}</td>
                    <td className="px-5 py-3">
                      {order.type === "delivery" ? "🚚" : "🏪"}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {order.items.length} món
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-mint-dark">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-5 py-3 text-text-secondary text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {order.status === "new" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(order.id);
                            }}
                            className="px-3 py-1.5 bg-mint/15 text-mint-dark rounded-lg text-xs font-medium hover:bg-mint/25 transition-colors"
                          >
                            ✅ Xử lý
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnarchive(order.id);
                            }}
                            className="px-3 py-1.5 bg-gray-100 text-text-secondary rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                          >
                            ↩ Hoàn tác
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order.id);
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border/50">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="px-4 py-3 hover:bg-surface/50 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{order.customerName}</span>
                  <span className="font-bold text-mint-dark text-sm">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>
                    {order.phone} • {order.items.length} món •{" "}
                    {order.type === "delivery" ? "🚚" : "🏪"}
                  </span>
                  <div className="flex gap-2">
                    {order.status === "new" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(order.id);
                        }}
                        className="px-2.5 py-1 bg-mint/15 text-mint-dark rounded-lg font-medium"
                      >
                        ✅ Xử lý
                      </button>
                    ) : (
                      <span className="text-green-600">✅ Đã xong</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(order.id);
                      }}
                      className="px-2.5 py-1 bg-red-50 text-red-500 rounded-lg font-medium"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Chi tiết đơn hàng"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-text-secondary text-xs mb-0.5">Khách hàng</p>
                <p className="font-semibold">{selectedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-0.5">SĐT</p>
                <p className="font-semibold">{selectedOrder.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-text-secondary text-xs mb-0.5">
                  {selectedOrder.type === "delivery" ? "🚚 Địa chỉ giao hàng" : "🏪 Nhận tại shop"}
                </p>
                <p className="font-semibold">{selectedOrder.address}</p>
              </div>
              {selectedOrder.note && (
                <div className="col-span-2">
                  <p className="text-text-secondary text-xs mb-0.5">📝 Ghi chú</p>
                  <p className="font-semibold">{selectedOrder.note}</p>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-sm font-semibold mb-2">📦 Danh sách món</p>
              <div className="space-y-1.5">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between">
                <span className="font-bold">Tổng cộng</span>
                <span className="font-bold text-lg text-mint-dark">
                  {formatPrice(selectedOrder.totalPrice)}
                </span>
              </div>
            </div>

            <div className="text-xs text-text-secondary text-center">
              Mã đơn: {selectedOrder.id} • {formatDate(selectedOrder.createdAt)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
