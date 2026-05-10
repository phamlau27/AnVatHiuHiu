"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useHasMounted } from "@/hooks/useHasMounted";
import { getOrdersByIds, updateOrder } from "@/lib/firestore";
import { showToast } from "@/components/ui/Toast";
import { formatPrice } from "@/data/mockProducts";
import type { Order, OrderItem } from "@/types";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";

const PICKUP_ADDRESS =
  "23 Nguyễn Thái Học, Phường Tân Thành, Quận Tân Phú, TP.HCM";

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const router = useRouter();
  const mounted = useHasMounted();
  const openCart = useUIStore(s => s.openCart);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [type, setType] = useState<"delivery" | "pickup">("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        const orders = await getOrdersByIds([orderId]);
        if (orders.length > 0) {
          const o = orders[0];
          if (o.status !== "new") {
            showToast("Đơn hàng này không thể chỉnh sửa.", "error");
            router.push("/orders");
            return;
          }
          setOrder(o);
          setName(o.customerName);
          setPhone(o.phone);
          setAddress(o.address || "");
          setNote(o.note || "");
          setType(o.type);
          setItems(o.items.map(item => ({ ...item })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [mounted, orderId, router]);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isValid =
    name.trim() && phone.trim() && (type === "pickup" || address.trim()) && items.length > 0;

  function updateItemQuantity(productId: string, delta: number) {
    setItems(prev =>
      prev
        .map(item =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(item => item.productId !== productId));
  }

  function handleAddFromCart() {
    const cartItems = useCartStore.getState().items.filter(i => i.selected);
    if (cartItems.length === 0) {
      showToast("Vui lòng tick chọn các món trong giỏ hàng trước!", "error");
      return;
    }

    setItems(prev => {
      const newItems = [...prev];
      cartItems.forEach(cartItem => {
        const existing = newItems.find(i => i.productId === cartItem.productId);
        if (existing) {
          existing.quantity += cartItem.quantity;
        } else {
          newItems.push({
            productId: cartItem.productId,
            name: cartItem.name,
            price: cartItem.price,
            quantity: cartItem.quantity,
          });
        }
      });
      return newItems;
    });

    showToast(`Đã gộp ${cartItems.length} món từ Giỏ hàng!`, "success");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !order) return;

    setSaving(true);
    try {
      await updateOrder(order.id, {
        customerName: name.trim(),
        phone: phone.trim(),
        address: type === "pickup" ? PICKUP_ADDRESS : address.trim(),
        type,
        note: note.trim(),
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        totalPrice,
      });

      showToast(
        `Cập nhật đơn hàng thành công! Mã: ${order.id.slice(0, 8).toUpperCase()}.`,
        "success"
      );

      setTimeout(() => {
        router.push("/orders");
      }, 1500);
    } catch (err) {
      console.error("Order update failed:", err);
      showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
      setSaving(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <span className="text-6xl mb-4">📋</span>
        <h2 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
        <Link
          href="/orders"
          className="px-6 py-2.5 bg-mint text-white font-semibold rounded-xl hover:bg-mint-dark transition-colors"
        >
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/orders"
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Quay lại"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Chỉnh sửa đơn hàng</h1>
            <p className="text-xs text-text-secondary">
              Mã đơn: <span className="font-mono font-bold text-mint-dark">{order.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Order Type Toggle */}
          <div className="bg-surface rounded-xl p-1 flex gap-1">
            <button
              type="button"
              onClick={() => setType("delivery")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === "delivery"
                  ? "bg-white shadow-sm text-mint-dark"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              🚚 Giao tận nhà
            </button>
            <button
              type="button"
              onClick={() => setType("pickup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === "pickup"
                  ? "bg-white shadow-sm text-mint-dark"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              🏪 Nhận tại shop
            </button>
          </div>

          {/* Pickup Address Notice */}
          {type === "pickup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-mint/10 border border-mint/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-sm font-semibold text-mint-dark mb-0.5">
                    Địa chỉ nhận hàng
                  </p>
                  <p className="text-sm text-text-secondary">{PICKUP_ADDRESS}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">
                Họ tên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ tên"
                required
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 focus:border-mint transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Nhập SĐT"
                required
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 focus:border-mint transition-all"
              />
            </div>

            {type === "delivery" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Địa chỉ giao hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng"
                  required={type === "delivery"}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 focus:border-mint transition-all"
                />
              </motion.div>
            )}

            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">
                Ghi chú
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 focus:border-mint transition-all resize-none"
              />
            </div>
          </div>

          {/* Order Items - Editable */}
          <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 bg-surface border-b border-border/50 flex items-center justify-between">
              <h3 className="font-semibold text-sm">📦 Sản phẩm trong đơn</h3>
              <button
                type="button"
                onClick={() => openCart("edit-order", handleAddFromCart)}
                className="text-xs font-bold text-mint-dark bg-mint/10 hover:bg-mint/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>🛒</span> Thêm từ Giỏ hàng
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center text-text-secondary text-sm">
                Đơn hàng trống. Vui lòng thêm sản phẩm.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {items.map((item) => (
                  <div key={item.productId} className="px-4 py-3 flex items-center gap-3">
                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatPrice(item.price)} / sản phẩm
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-text-secondary hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-sm font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.productId, 1)}
                        className="w-7 h-7 rounded-lg bg-mint/10 border border-mint/30 flex items-center justify-center text-mint-dark hover:bg-mint/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right w-24 shrink-0">
                      <span className="text-sm font-bold text-mint-dark">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-500 transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Order Total */}
            <div className="px-4 py-3 bg-surface border-t border-border/50 flex justify-between items-center">
              <span className="font-semibold text-sm">Tổng cộng</span>
              <span className="font-bold text-lg text-mint-dark">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              href="/orders"
              className="flex-1 py-3.5 bg-surface hover:bg-gray-200 text-text-primary font-bold rounded-xl transition-colors text-base text-center"
            >
              Hủy
            </Link>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!isValid || saving}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-base"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang lưu...
                </span>
              ) : (
                `Cập nhật đơn hàng`
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
