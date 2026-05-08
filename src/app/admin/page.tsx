"use client";

import { useState, useEffect } from "react";
import { getAllOrders } from "@/lib/firestore";
import { formatPrice } from "@/data/mockProducts";
import type { Order } from "@/types";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const newOrders = orders.filter((o) => o.status === "new");
  const todayOrders = orders.filter((o) => {
    if (!(o.createdAt instanceof Timestamp)) return false;
    const orderDate = o.createdAt.toDate();
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Tổng quan</h1>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-surface transition-colors"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/50">
          <p className="text-text-secondary text-sm mb-1">Đơn mới</p>
          <p className="text-3xl font-bold text-yellow-500">{newOrders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/50">
          <p className="text-text-secondary text-sm mb-1">Đơn hôm nay</p>
          <p className="text-3xl font-bold text-mint-dark">{todayOrders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/50">
          <p className="text-text-secondary text-sm mb-1">Doanh thu hôm nay</p>
          <p className="text-2xl font-bold text-mint-dark">{formatPrice(todayRevenue)}</p>
        </div>
      </div>

      {/* Recent New Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold">📦 Đơn hàng mới</h2>
          <Link href="/admin/orders" className="text-mint-dark text-sm font-medium hover:underline">
            Xem tất cả →
          </Link>
        </div>
        {newOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-text-secondary text-sm">
            Không có đơn hàng mới
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {newOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-surface transition-colors">
                <div>
                  <p className="text-sm font-semibold">{order.customerName}</p>
                  <p className="text-xs text-text-secondary">
                    {order.phone} • {order.items.length} món •{" "}
                    {order.type === "delivery" ? "🚚 Giao hàng" : "🏪 Tự lấy"}
                  </p>
                </div>
                <span className="font-bold text-mint-dark text-sm">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
