# 🤖 TELEGRAM NOTIFICATIONS SETUP (Optional)

## Tại sao cần Telegram?

Mỗi khi khách đặt hàng → Bạn nhận notification trên Telegram ngay lập tức! ✅

---

## 🚀 SETUP STEPS (5 phút)

### Bước 1: Tạo Bot Telegram

1. Mở Telegram → Tìm **@BotFather**
2. Nhắn: `/start`
3. Nhắn: `/newbot`
4. BotFather hỏi tên → Trả lời: `AnVatHiuHiu_Bot` (hoặc tên khác)
5. BotFather hỏi username → Trả lời: `anvathiuhiu_shop_bot` (phải unique, thêm \_bot)
6. **Copy token** nhận được → Lưu lại (VD: `123456789:ABCDefGHIjklmnoPQRstUVwxyz`)

### Bước 2: Get Chat ID

1. Tìm bot vừa tạo (search theo username)
2. Nhắn bot: `/start`
3. Quay lại **@BotFather**
4. Nhắn: `/mybots` → Select bot vừa tạo → Xem thông tin
5. Hoặc: Forward message từ bot → Check URL: `https://api.telegram.org/botXXX/getUpdates` (dùng token)

**Cách nhanh nhất:**

- Vào link: `https://api.telegram.org/bot<TOKEN>/getUpdates` (thay token)
- Nhắn bot cái gì đó
- Refresh page → Xem `"chat":{"id": 123456789}` → Copy ID

### Bước 3: Thêm vào Vercel

1. Vercel Dashboard → Project Settings → Environment Variables
2. Add 2 biến:
   ```
   TELEGRAM_BOT_TOKEN = 123456789:ABCDefGHIjklmnoPQRstUVwxyz
   TELEGRAM_CHAT_ID = 123456789
   ```
3. Redeploy project

### Bước 4: Test

1. Local: Thêm vào `.env.local` 2 biến trên
2. `npm run dev`
3. Test checkout → Xem Telegram nhận notification? ✅

---

## 📨 NOTIFICATION FORMAT

Khi khách đặt hàng, bạn nhận:

```
🛒 ĐƠN HÀNG MỚI

📋 Mã: XXXKJN21
👤 Nguyễn Văn A
📱 0912345678
🚚 Giao hàng

  • Khô bò miếng x2
  • Mực rim me x3

💰 Tổng: 555,000đ
```

---

## ⚠️ TROUBLESHOOTING

**❌ Không nhận notification?**

- Check TELEGRAM_BOT_TOKEN đúng không
- Check TELEGRAM_CHAT_ID đúng không
- Check `.env.local` nếu local test
- Xem Vercel logs có error không

**❌ Bot không phản hồi /start?**

- Delete bot → Create new từ @BotFather
- Hoặc `/mybots` → `/edit` → `/delete`

**❌ Chat ID không tìm được?**

- Ref: https://api.telegram.org/bot<TOKEN>/getUpdates
- Nhắn bot → Refresh link

---

## 🔗 LINKS

| Item             | Link                                           |
| ---------------- | ---------------------------------------------- |
| BotFather        | https://t.me/botfather                         |
| Check Updates    | https://api.telegram.org/bot<TOKEN>/getUpdates |
| Telegram Bot API | https://core.telegram.org/bots/api             |

---

## ✨ ADVANCED (Optional)

### Gửi message theo orders status

Thêm logic vào `src/app/api/notify/route.ts`:

```typescript
// Khi admin đánh dấu "Xử lý" → gửi update lại
const message = `✅ ĐƠN HÀNG ${orderId} ĐÃ XỬ LÝ\n\nShop sẽ giao trong 1-2 ngày tới!`;
```

### Thêm rich formatting

```typescript
const message = `
*🛒 ĐƠN HÀNG MỚI*

📋 Mã: \`${orderId}\`
👤 ${customerName}
📱 ${phone}

*Danh sách:*
${itemsList}

*Địa chỉ:* ${address}
*Ghi chú:* ${note || "Không"}

*💰 Tổng: ${totalPrice}đ*
`;

// parse_mode: "Markdown" hoặc "HTML"
```

---

**Done! Bây giờ bạn sẽ không bao giờ bỏ lỡ order nào! 🚀**
