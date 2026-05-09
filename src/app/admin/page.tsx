"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllOrders } from "@/lib/firestore";
import { formatPrice } from "@/data/mockProducts";
import type { Order } from "@/types";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

type FilterMode = "day" | "month" | "year";

function formatDate(ts: Timestamp | undefined): string {
  if (!ts || !(ts instanceof Timestamp)) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(ts.toDate());
}

function isSameDay(ts: Timestamp, date: Date): boolean {
  const d = ts.toDate();
  return d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate();
}

function isSameMonth(ts: Timestamp, date: Date): boolean {
  const d = ts.toDate();
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
}

function isSameYear(ts: Timestamp, date: Date): boolean {
  return ts.toDate().getFullYear() === date.getFullYear();
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("day");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(() => String(new Date().getFullYear()));

  useEffect(() => { fetchData(); }, []);

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

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!(o.createdAt instanceof Timestamp)) return false;
      if (filterMode === "day") {
        return isSameDay(o.createdAt, new Date(selectedDate + "T00:00:00"));
      }
      if (filterMode === "month") {
        const [y, m] = selectedMonth.split("-").map(Number);
        const ref = new Date(y, m - 1, 1);
        return isSameMonth(o.createdAt, ref);
      }
      if (filterMode === "year") {
        const ref = new Date(Number(selectedYear), 0, 1);
        return isSameYear(o.createdAt, ref);
      }
      return false;
    });
  }, [orders, filterMode, selectedDate, selectedMonth, selectedYear]);

  const completedOrders = filteredOrders.filter(o => o.status === "completed" || o.status === "archived");
  const revenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const newOrders = orders.filter(o => o.status === "new");
  const processingOrders = orders.filter(o => o.status === "processing");

  const filterLabel = filterMode === "day"
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })
    : filterMode === "month"
      ? new Date(selectedMonth + "-01").toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
      : `Năm ${selectedYear}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">📊 Tổng quan</h1>
        <button onClick={fetchData} className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-surface transition-colors">
          🔄 Làm mới
        </button>
      </div>

      {/* ── Quick Stats (always) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
          <p className="text-xs text-yellow-700 font-medium mb-1">⏳ Đơn mới</p>
          <p className="text-3xl font-bold text-yellow-600">{newOrders.length}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-blue-700 font-medium mb-1">🔵 Đang xử lý</p>
          <p className="text-3xl font-bold text-blue-600">{processingOrders.length}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-xs text-green-700 font-medium mb-1">✅ Đã hoàn thành</p>
          <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-border/50">
          <p className="text-xs text-text-secondary font-medium mb-1">📋 Tổng đơn</p>
          <p className="text-3xl font-bold text-text-primary">{filteredOrders.length}</p>
        </div>
      </div>

      {/* ── Statistics Section ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-lg mb-4">📈 Thống kê doanh thu</h2>

          {/* Filter Mode */}
          <div className="flex gap-2 mb-4">
            {(["day", "month", "year"] as FilterMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterMode === m ? "bg-mint text-white" : "bg-surface text-text-secondary hover:bg-border"
                }`}
              >
                {m === "day" ? "Ngày" : m === "month" ? "Tháng" : "Năm"}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-3 flex-wrap">
            {filterMode === "day" && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
              />
            )}
            {filterMode === "month" && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
              />
            )}
            {filterMode === "year" && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
            <span className="text-sm text-text-secondary">{filterLabel}</span>
          </div>
        </div>

        {/* Stats for filtered period */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
          <div className="px-6 py-5">
            <p className="text-sm text-text-secondary mb-1">Tổng đơn hàng</p>
            <p className="text-4xl font-extrabold text-text-primary">{filteredOrders.length}</p>
            <p className="text-xs text-text-secondary mt-1">đơn trong kỳ</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-text-secondary mb-1">Đơn đã hoàn thành</p>
            <p className="text-4xl font-extrabold text-green-600">{completedOrders.length}</p>
            <p className="text-xs text-text-secondary mt-1">
              {filteredOrders.length > 0 ? Math.round(completedOrders.length / filteredOrders.length * 100) : 0}% tỉ lệ hoàn thành
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-text-secondary mb-1">Doanh thu</p>
            <p className="text-3xl font-extrabold text-mint-dark">{formatPrice(revenue)}</p>
            <p className="text-xs text-text-secondary mt-1">từ đơn đã xong</p>
          </div>
        </div>

        {/* Order list for period */}
        {filteredOrders.length > 0 && (
          <div className="border-t border-border/50">
            <div className="px-5 py-3 bg-surface flex items-center justify-between">
              <span className="text-sm font-semibold">Chi tiết đơn hàng</span>
              <Link href="/admin/orders" className="text-mint-dark text-xs hover:underline">Xem quản lý →</Link>
            </div>
            <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
              {filteredOrders.map((order) => (
                <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-surface/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold">{order.customerName}</p>
                    <p className="text-xs text-text-secondary">
                      {order.phone} • {order.items.length} món • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-mint-dark">{formatPrice(order.totalPrice)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      order.status === "new" ? "bg-yellow-100 text-yellow-700"
                      : order.status === "processing" ? "bg-blue-100 text-blue-700"
                      : order.status === "completed" || order.status === "archived" ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                      {order.status === "new" ? "Mới"
                       : order.status === "processing" ? "Đang xử lý"
                       : order.status === "completed" || order.status === "archived" ? "Hoàn thành"
                       : "Đã hủy"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {filteredOrders.length === 0 && (
          <div className="px-5 py-10 text-center text-text-secondary text-sm">
            Không có đơn hàng nào trong kỳ này
          </div>
        )}
      </div>

      {/* ── Recent New Orders ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold">📦 Đơn chờ xử lý</h2>
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
                    {order.phone} • {order.items.length} món • {order.type === "delivery" ? "🚚 Giao hàng" : "🏪 Tự lấy"}
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
