"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { useOrderHistoryStore } from "@/stores/orderHistoryStore";
import { createOrder } from "@/lib/firestore";
import { showToast } from "@/components/ui/Toast";
import { formatPrice } from "@/data/mockProducts";

const PICKUP_ADDRESS =
  "23 Nguyễn Thái Học, Phường Tân Thành, Quận Tân Phú, TP.HCM";

export default function CheckoutForm() {
  const router = useRouter();
  const rawItems = useCartStore((s) => s.items);
  const items = useMemo(() => rawItems.filter((i) => i.selected), [rawItems]);
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const clearSelectedCart = useCartStore((s) => s.clearSelectedCart);
  const addOrderId = useOrderHistoryStore((s) => s.addOrderId);

  const [type, setType] = useState<"delivery" | "pickup">("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid =
    name.trim() && phone.trim() && (type === "pickup" || address.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || items.length === 0) return;

    setLoading(true);
    try {
      const id = await createOrder({
        customerName: name.trim(),
        phone: phone.trim(),
        address: type === "pickup" ? PICKUP_ADDRESS : address.trim(),
        type,
        note: note.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        totalPrice,
      });

      addOrderId(id);
      clearSelectedCart();

      // Show success notification
      showToast(
        `✅ Đặt hàng thành công! Mã: ${id.slice(0, 8).toUpperCase()}. Sẽ chuyển đến đơn hàng...`,
        "success",
      );

      // Send Telegram notification (if configured - silent fail)
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          customerName: name.trim(),
          phone: phone.trim(),
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          totalPrice,
          type,
        }),
      }).catch(() => {}); // Silent fail - Telegram is optional

      // Wait a bit before redirect for user to see notification
      setTimeout(() => {
        router.push("/orders");
      }, 2000);
    } catch (err) {
      console.error("Order creation failed:", err);
      showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
      setLoading(false);
    }
  };

  return (
    <>
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
              onChange={(e) => setPhone(e.target.value)}
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

        {/* Order Summary */}
        <div className="bg-surface rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-sm mb-3">📦 Đơn hàng của bạn</h3>
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {item.name} x{item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2 flex justify-between">
            <span className="font-semibold">Tổng cộng</span>
            <span className="font-bold text-lg text-mint-dark">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!isValid || loading || items.length === 0}
          className="w-full py-3.5 bg-mint hover:bg-mint-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            `Xác nhận đặt hàng • ${formatPrice(totalPrice)}`
          )}
        </motion.button>
      </form>
    </>
  );
}
