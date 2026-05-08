import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { orderId, customerName, phone, items, totalPrice, type } = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ ok: false, error: "Telegram not configured" }, { status: 200 });
    }

    const itemsList = items
      .map((i: { name: string; quantity: number; price: number }) => `  • ${i.name} x${i.quantity}`)
      .join("\n");

    const message = `🛒 *ĐƠN HÀNG MỚI*\n\n📋 Mã: \`${orderId}\`\n👤 ${customerName}\n📱 ${phone}\n${type === "delivery" ? "🚚 Giao hàng" : "🏪 Nhận tại shop"}\n\n${itemsList}\n\n💰 *Tổng: ${totalPrice.toLocaleString("vi-VN")}đ*`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
