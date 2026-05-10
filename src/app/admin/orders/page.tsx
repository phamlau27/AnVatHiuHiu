"use client";

import { useState, useEffect } from "react";
import { subscribeToAllOrders, updateOrderStatus, deleteOrder } from "@/lib/firestore";
import { formatPrice } from "@/data/mockProducts";
import { showToast } from "@/components/ui/Toast";
import type { Order } from "@/types";
import { Timestamp } from "firebase/firestore";
import Modal from "@/components/ui/Modal";
import Link from "next/link";


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
  const [filter, setFilter] = useState<"all" | "new" | "processing" | "completed" | "cancelled">("new");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsub = subscribeToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleStatusChange(orderId: string, newStatus: Order["status"]) {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast("Đã cập nhật trạng thái!", "success");
    } catch {
      showToast("Có lỗi xảy ra", "error");
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa (ẩn) đơn hàng này khỏi danh sách quản lý không?")) return;
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      showToast("Đã ẩn đơn hàng!", "success");
    } catch {
      showToast("Có lỗi xảy ra", "error");
    }
  }

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "completed" && o.status === "archived") return true; // fallback for old data
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
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["new", "processing", "completed", "cancelled", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? "bg-mint text-white"
                : "bg-white text-text-secondary hover:bg-surface"
            }`}
          >
            {f === "new" && `🟡 Mới (${orders.filter((o) => o.status === "new").length})`}
            {f === "processing" && `🔵 Đang xử lý (${orders.filter((o) => o.status === "processing").length})`}
            {f === "completed" && `✅ Đã xong (${orders.filter((o) => o.status === "completed" || o.status === "archived").length})`}
            {f === "cancelled" && `❌ Đã hủy (${orders.filter((o) => o.status === "cancelled").length})`}
            {f === "all" && "Tất cả"}
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
                  <th className="text-center px-5 py-3 font-medium">Trạng thái</th>
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
                      <select
                        onClick={(e) => e.stopPropagation()}
                        value={order.status === "archived" ? "completed" : order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border-0 outline-none cursor-pointer appearance-none text-center
                          ${order.status === "new" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${order.status === "processing" ? "bg-blue-100 text-blue-700" : ""}
                          ${order.status === "completed" || order.status === "archived" ? "bg-green-100 text-green-700" : ""}
                          ${order.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                        `}
                      >
                        <option value="new">🟡 Mới</option>
                        <option value="processing">🔵 Đang xử lý</option>
                        <option value="completed">✅ Đã xong</option>
                        <option value="cancelled">❌ Đã hủy</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">

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
                    <select
                      onClick={(e) => e.stopPropagation()}
                      value={order.status === "archived" ? "completed" : order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                      className={`text-xs font-bold px-2 py-1 rounded-md border-0 outline-none
                        ${order.status === "new" ? "bg-yellow-100 text-yellow-700" : ""}
                        ${order.status === "processing" ? "bg-blue-100 text-blue-700" : ""}
                        ${order.status === "completed" || order.status === "archived" ? "bg-green-100 text-green-700" : ""}
                        ${order.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                      `}
                    >
                      <option value="new">🟡 Mới</option>
                      <option value="processing">🔵 Đang</option>
                      <option value="completed">✅ Xong</option>
                      <option value="cancelled">❌ Hủy</option>
                    </select>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(order.id);
                      }}
                      className="px-2.5 py-1 bg-red-50 text-red-500 rounded-md font-medium"
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
            
            <div className="flex gap-3 pt-4 border-t border-border mt-4">
              <Link
                href={`/orders/edit/${selectedOrder.id}`}
                className="flex-1 py-2.5 bg-blue-50 text-blue-600 text-center rounded-xl font-medium hover:bg-blue-100 transition-colors"
              >
                ✏️ Sửa đơn hàng
              </Link>
            </div>

            <div className="text-xs text-text-secondary text-center mt-2">
              Mã đơn: {selectedOrder.id} • {formatDate(selectedOrder.createdAt)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
