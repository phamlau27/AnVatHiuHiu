# Hướng Dẫn Setup & Deploy "Ăn Vặt Híu Híu"

## 1️⃣ SETUP FIREBASE (LOCAL)

### Bước 1: Tạo Project Firebase

1. Vào https://firebase.google.com
2. Nhấn **"Go to console"** → **"Create a new project"**
3. Đặt tên: `an-vat-hiu-hiu`
4. Tích chọn **"Enable Google Analytics"** (không bắt buộc)
5. Nhấn **"Create"** (chờ 2-3 phút)

### Bước 2: Setup Firestore Database

1. Bên trái menu → **"Firestore Database"**
2. Nhấn **"Create database"**
3. Chọn **"Start in production mode"** (để bảo vệ data)
4. Chọn location: **nam-asia1** (Singapore - nhanh nhất cho VN)
5. Nhấn **"Create"**

### Bước 3: Lấy Firebase Config

1. Vào **"Project Settings"** (bánh răng icon → Project settings)
2. Tab **"General"**
3. Kéo xuống → Tìm web app config (icon `</>`), copy
4. Hoặc go to **"Web"** application setup tab

Ví dụ config sẽ như vầy:

```javascript
apiKey: "AIzaSxxxxxxxxxxxxxxxxxxxx",
authDomain: "an-vat-hiu-hiu.firebaseapp.com",
projectId: "an-vat-hiu-hiu",
storageBucket: "an-vat-hiu-hiu.appspot.com",
messagingSenderId: "123456789",
appId: "1:123456789:web:xxxxxxxxxxxxx"
```

### Bước 4: Tạo `.env.local` file

Ở thư mục root `an-vat-hiu-hiu/`, tạo file `.env.local`:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=an-vat-hiu-hiu.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=an-vat-hiu-hiu
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=an-vat-hiu-hiu.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxx
```

### Bước 5: Setup Firestore Rules (Bảo vệ database)

1. Firestore Database → **"Rules"** tab
2. Replace code thành:

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép ai cũng đọc sản phẩm
    match /products/{document=**} {
      allow read: if true;
      allow write: if false; // Chỉ admin thêm bằng backend
    }

    // Cho phép ai cũng tạo đơn hàng (nhưng không sửa/xóa)
    match /orders/{document=**} {
      allow create: if true;
      allow read, update, delete: if false; // Chỉ admin thấy
    }
  }
}
```

3. Nhấn **"Publish"**

### Bước 6: Add Sản Phẩm vào Firestore

Có 2 cách:

**Cách 1: Thêm bằng tay (Dashboard)**

1. Firestore Database → **"Create collection"** → tên: `products`
2. **"Add document"** → auto ID
3. Thêm field:
   - `id`: string (copy ID của doc)
   - `name`: string
   - `price`: number
   - `category`: string (kho-cha-bong, hat-dinh-duong, etc.)
   - `imageUrl`: string (link ảnh)
   - `description`: string
   - `isPromotion`: boolean (false)
   - `soldCount`: number (0)

**Cách 2: Thêm bằng Script (Nhanh - 50+ sản phẩm)**

1. Terminal: `npm run seed` (nếu có script)
2. Hoặc dùng Firebase Admin SDK (xem file `scripts/seed.ts`)

---

## 2️⃣ CHẠY LOCAL

```bash
# Copy .env.local vào (từ bước trên)

# Install dependencies
npm install

# Dev mode
npm run dev

# Truy cập: http://localhost:3000
```

### Test Checkout Flow:

1. Thêm sản phẩm vào giỏ
2. Vào giỏ → **"Thanh toán"**
3. Điền thông tin → **"Xác nhận đặt hàng"**
4. Xem toast success → Auto redirect `/orders`
5. Vào Firebase Dashboard → **"orders"** collection → Xem đơn hàng vừa tạo ✅

---

## 3️⃣ DEPLOY LÊN VERCEL (Miễn Phí, Tối Ưu Next.js)

### Bước 1: Push code lên GitHub

```bash
# Khởi tạo git (nếu chưa có)
git init
git add .
git commit -m "Initial commit"

# Tạo repo trên GitHub & push
git remote add origin https://github.com/YOUR_USERNAME/an-vat-hiu-hiu.git
git branch -M main
git push -u origin main
```

### Bước 2: Deploy trên Vercel

1. Vào https://vercel.com
2. Nhấn **"New Project"**
3. Import GitHub repo `an-vat-hiu-hiu`
4. **Environment Variables**: Thêm tất cả từ `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSxxxx...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=an-vat-hiu-hiu.firebaseapp.com
   ... (thêm 5 cái còn lại)
   ```
5. Nhấn **"Deploy"** → Chờ 2-3 phút
6. Vercel sẽ tạo URL: `https://an-vat-hiu-hiu-xxxx.vercel.app`

### Bước 3: Test trên Vercel

- Thử checkout flow → Kiểm tra đơn hàng lưu vào Firebase

---

## 4️⃣ TÓM TẮT FLOW HIỆN TẠI

### Người dùng mua hàng:

1. Xem sản phẩm (từ **Firestore `products`**)
2. Thêm vào giỏ (localStorage)
3. Thanh toán → Điền form → Nhấn "Xác nhận"
4. **Toast success** hiển thị mã đơn
5. Auto redirect `/orders`
6. Xem danh sách đơn hàng (từ **Firestore `orders`**)
7. **Icon Orders** ở Header hiển thị số lượng đơn

### Admin quản lý:

1. Vào `/admin/orders`
2. Xem đơn hàng mới
3. Nhấn **"✅ Xử lý"** để đánh dấu hoàn thành
4. Nhận thông báo qua Telegram (nếu cấu hình)

---

## 5️⃣ THÊM TELEGRAM NOTIFICATIONS (Optional)

Nếu muốn nhận thông báo khi có đơn hàng:

1. Tìm **BotFather** trên Telegram
2. `/newbot` → Đặt tên → Lấy token
3. Tìm **bot của bạn** → `/start` → Lấy `chat_id`
4. Thêm vào `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCDefGHIjklmnoPQRstUVwxyz
   TELEGRAM_CHAT_ID=123456789
   ```

---

## 6️⃣ XÓA MOCK DATA (Đã Done ✅)

- ✅ Loại bỏ unused Modal success
- ✅ Thêm Toast notification thực
- ✅ Thêm Orders icon ở Header
- ✅ Data chỉ từ Firebase (không mock khi deploy)

---

## 7️⃣ TROUBLESHOOTING

### ❌ Lỗi: "Cannot read properties of undefined (reading 'orders')"

→ **Giải pháp**: Firebase chưa setup đúng. Kiểm tra `.env.local`

### ❌ Lỗi: "Firestore request failed: permission denied"

→ **Giải pháp**: Kiểm tra Firestore Rules (bước 5 trên)

### ❌ Thêm sản phẩm không lên được

→ **Giải pháp**: Dùng cách 1 (thêm bằng tay) hoặc chỉnh Firestore Rules cho phép `write`

### ❌ Deploy thất bại trên Vercel

→ **Giải pháp**: Kiểm tra Environment Variables có đủ không

---

## 8️⃣ NEXT STEPS (Nếu muốn upgrade)

- [ ] Thêm payment gateway (Stripe, Momo)
- [ ] Thêm notification email
- [ ] Thêm tính năng user login
- [ ] Thêm coupon/discount system
- [ ] Thêm image upload feature

---

**Done! 🎉 Web của bạn đã sẵn sàng chạy trên production!**
