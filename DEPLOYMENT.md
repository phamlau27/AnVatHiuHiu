# ✅ DEPLOYMENT CHECKLIST

Chạy từng bước này trước khi deploy:

## 1. LOCAL SETUP

- [ ] Tạo folder `an-vat-hiu-hiu/`
- [ ] Copy toàn bộ project code vào
- [ ] `npm install`
- [ ] Tạo file `.env.local` với Firebase config
- [ ] `npm run dev` → kiểm tra `http://localhost:3000` hoạt động

## 2. FIREBASE SETUP

- [ ] Tạo Project Firebase (https://firebase.google.com)
- [ ] Setup Firestore Database (location: `nam-asia1`)
- [ ] Lấy Firebase Config & paste vào `.env.local`
- [ ] Setup Firestore Rules (copy từ SETUP_GUIDE.md)
- [ ] Thêm 5-10 sản phẩm test vào collection `products`

## 3. TEST LOCAL CHECKOUT

- [ ] Vào `http://localhost:3000`
- [ ] Thêm sản phẩm vào giỏ
- [ ] Go to `/checkout`
- [ ] Điền thông tin → Nhấn "Xác nhận đặt hàng"
- [ ] ✅ Kiểm tra:
  - [ ] Toast success hiển thị
  - [ ] Tự động redirect tới `/orders`
  - [ ] Xem được đơn hàng vừa tạo
  - [ ] Vào Firebase → collection `orders` → thấy order mới

## 4. REPO & GITHUB

- [ ] Khởi tạo Git: `git init`
- [ ] Tạo `.gitignore` (nếu chưa có):
  ```
  node_modules
  .env.local
  .next
  dist
  build
  ```
- [ ] `git add .`
- [ ] `git commit -m "Initial commit: ăn vặt híu híu"`
- [ ] Tạo GitHub repo
- [ ] `git remote add origin https://github.com/USERNAME/an-vat-hiu-hiu.git`
- [ ] `git branch -M main`
- [ ] `git push -u origin main`

## 5. DEPLOY VERCEL

- [ ] Vào https://vercel.com → Sign up with GitHub
- [ ] Click **"New Project"** → Import repo
- [ ] Add Environment Variables:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
  NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
  ```
- [ ] Nhấn **"Deploy"**
- [ ] Chờ 2-3 phút
- [ ] Vercel sẽ show URL: `https://an-vat-hiu-hiu-xxxxx.vercel.app` ✅

## 6. TEST PRODUCTION

- [ ] Truy cập URL từ Vercel
- [ ] Repeat checkout flow (Step 3)
- [ ] ✅ Kiểm tra:
  - [ ] Sản phẩm load từ Firebase
  - [ ] Toast success hiển thị
  - [ ] Redirect `/orders` hoạt động
  - [ ] Order lưu vào Firebase

## 7. SETUP TELEGRAM (Optional)

- [ ] Tạo bot Telegram (chat BotFather → `/newbot`)
- [ ] Lấy token bot
- [ ] Get chat ID (start bot → `/start` → get ID)
- [ ] Thêm vào Vercel Environment Variables:
  ```
  TELEGRAM_BOT_TOKEN=xxxxx
  TELEGRAM_CHAT_ID=xxxxx
  ```
- [ ] Redeploy Vercel → test checkout → xem notification trên Telegram

## 8. DOMAIN CUSTOM (Optional)

- [ ] Buy domain (Namecheap, GoDaddy, VinaDomain)
- [ ] Vercel → Project Settings → Domains
- [ ] Add custom domain → Follow DNS setup
- [ ] URL thành: `https://anvathiuhiu.com` (hoặc domain của bạn)

## 9. LAST CHECK

- [ ] Đơn hàng save vào Firebase ✅
- [ ] Toast success hiển thị ✅
- [ ] Order icon ở Header hiển thị số lượng ✅
- [ ] Responsive trên mobile ✅
- [ ] Load time < 3s ✅

---

## 📋 DOMAIN CÓ LIÊN HỆ (VN)

| Provider   | Website       | Giá          |
| ---------- | ------------- | ------------ |
| VinaDomain | vinadomain.vn | 99k-389k/năm |
| Namecheap  | namecheap.com | $8.98/năm    |
| GoDaddy    | godaddy.com   | từ $1.99/năm |

---

## 🚀 GHI NHỚ

- Vercel Deploy tự động khi push code lên GitHub
- Firebase miễn phí cho ~10GB data
- Không cần lo VPS hosting (Vercel care all)
- Environment Variables ở Vercel khác .env.local (cố ý 👍)

---

**Hoàn tất! Bạn có web bán hàng thực trên production! 🎉**

---

## ⚠️ PROBLEM SOLVING

| Problem             | Giải pháp                            |
| ------------------- | ------------------------------------ |
| Checkout fail       | Check Firebase env variables         |
| Sản phẩm không hiện | Add products vào Firestore           |
| Toast không hiện    | Kiểm tra Toast Provider ở layout.tsx |
| Deploy fail Vercel  | Check console logs (Deployments tab) |
| Telegram no notify  | Optional - không bắt buộc            |

---

**Cần giúp? Check SETUP_GUIDE.md hoặc chat với AI!** 🤖
