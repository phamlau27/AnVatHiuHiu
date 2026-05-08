# 🚀 QUICK START - ANH VAT HIU HIU

## ⚡ TL;DR (Tắt cách nhất)

```bash
# 1. Setup .env.local (từ Firebase)
# copy Firebase config từ console

# 2. Run locally
npm install
npm run dev

# 3. Test checkout → xem order ở /orders

# 4. Deploy to Vercel
git push origin main

# Xong! URL sẽ tự sinh ra 🎉
```

---

## 📋 CÁI ĐÃ THAY ĐỔI

✅ **Loại bỏ mọi mock data**

- Sản phẩm từ Firestore `products` collection
- Không còn hardcode mockProducts trên frontend

✅ **Thêm notification thực**

- Toast success khi đặt hàng ✅
- Auto redirect `/orders` sau 2s
- Telegram notification (optional)

✅ **Thêm Orders icon ở Header**

- Icon 📄 gần giỏ hàng
- Hiển thị số lượng đơn chưa xem
- Click go to `/orders` page

✅ **Firestore Rules bảo vệ**

- Chỉ admin thêm sản phẩm
- Ai cũng tạo đơn được
- Admin thấy tất cả đơn

---

## 🔧 FLOW CHECKOUT HIỆN TẠI

```
User thêm sản phẩm
    ↓
Vào giỏ hàng (/cart)
    ↓
Click "Thanh toán"
    ↓
Điền form (tên, phone, address)
    ↓
Click "Xác nhận đặt hàng"
    ↓
✅ Toast: "Đặt hàng thành công! Mã: XXXXX"
    ↓
Chuyển đến /orders (auto theo)
    ↓
Xem order vừa tạo + icon Orders header chứng minh
```

---

## 📱 PHẦN USER NHÌN THẤY

### Header (ở tất cả page)

```
[Logo] 🔍 📄 🛒
        ↑  ↑  ↑
       Search Orders Cart
       new orders count ↑
```

### Checkout Page

```
Form nhập:
- Họ tên
- Số điện thoại
- Địa chỉ giao hàng (nếu giao)
- Ghi chú

Checkout summary:
- List sản phẩm đã chọn
- Tổng tiền
Button: Xác nhận
```

### Orders (/orders)

```
Danh sách đơn hàng:
- Mã đơn
- Trạng thái (Đang xử lý / Đã xử lý)
- List sản phẩm
- Tổng tiền
- Ngày đặt
```

---

## 🛠️ SETUP STEPS (Chi tiết)

### Step 1: Firebase (5 phút)

- [ ] Tạo project https://console.firebase.google.com
- [ ] Tạo Firestore (location: nam-asia1)
- [ ] Copy config
- [ ] Tạo .env.local paste config
- [ ] Setup Firestore Rules (copy từ SETUP_GUIDE.md)

### Step 2: Add Products (2 phút)

- [ ] Firebase Console → Firestore → `products` collection
- [ ] Add ~10 products test (copy từ mockProducts.ts nếu cần)

### Step 3: Local Test (5 phút)

```bash
npm install
npm run dev
# Test checkout flow trên http://localhost:3000
```

### Step 4: GitHub (2 phút)

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/YOU/an-vat-hiu-hiu.git
git push -u origin main
```

### Step 5: Vercel Deploy (3 phút)

- [ ] https://vercel.com
- [ ] Import repo từ GitHub
- [ ] Add 6 Firebase env vars
- [ ] Deploy ✅

### Step 6: Production Test (5 phút)

- [ ] Click link Vercel sinh ra
- [ ] Thử checkout
- [ ] Verify order ở Firebase

**Total: ~20 phút từ A-Z! ⏱️**

---

## 🎯 ADMIN PANEL (/admin)

### Orders (/admin/orders)

- [ ] Xem tất cả đơn mới
- [ ] Đánh dấu "Xử lý"
- [ ] Auto-refresh mỗi 2 phút

### Products (/admin/products)

- [ ] Xem danh sách
- [ ] Thêm sản phẩm mới
- [ ] Sửa/xóa

### Dashboard (/admin)

- [ ] Stats: đơn hôm nay, doanh thu
- [ ] New orders count

**Lưu ý**: Hiện tại không có login → Ai cũng vào được. If concerned:

- Implement simple password auth (optional)
- Hoặc dùng Firebase Authentication

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] `.env.local` có Firebase config ✅
- [ ] Firestore Rules setup ✅
- [ ] Local test checkout OK ✅
- [ ] Push GitHub ✅
- [ ] Vercel env vars added ✅
- [ ] Deploy success ✅
- [ ] Production checkout test ✅

---

## 📊 DATA ARCHITECTURE

### Firestore Collections

**products**

```
{
  id: "kho-bo-mieng",
  name: "Khô bò miếng",
  price: 120000,
  imageUrl: "/images/...",
  category: "kho-cha-bong",
  description: "...",
  isPromotion: false,
  promotionPrice: 0,
  soldCount: 156,
  createdAt: Timestamp
}
```

**orders**

```
{
  id: "auto-generated",
  customerName: "Nguyễn Văn A",
  phone: "0123456789",
  address: "123 Nguyễn Huệ, Q1, TPHCM",
  type: "delivery" | "pickup",
  note: "Giao buổi chiều",

  items: [
    {
      productId: "kho-bo-mieng",
      name: "Khô bò miếng",
      price: 120000,
      quantity: 2
    }
  ],

  totalPrice: 240000,
  status: "new" | "archived",
  createdAt: Timestamp
}
```

---

## 🔐 SECURITY NOTES

✅ Already Done:

- Products read-only (user can't edit)
- Orders write-protected (can't edit after create)
- No sensitive data in localStorage
- API notify endpoint robust

⚠️ Future Improvements:

- Add user login (Firebase Auth)
- Add order verification code
- Add rate limiting
- Add email confirmation

---

## 📞 SUPPORT

### Common Issues

**Q: Order không lưu được?**
A: Check `.env.local` → Firebase rules correct?

**Q: Deploy thất bại?**
A: Xem Vercel logs → likely missing env vars

**Q: Sản phẩm không hiển thị?**
A: Add products to `products` collection trước

**Q: Toast không hiện?**
A: Check layout.tsx có `<ToastProvider />` không

---

## 🎓 FILE STRUCTURE

```
an-vat-hiu-hiu/
├── src/
│   ├── app/              # Pages & routes
│   │   ├── page.tsx      # Home
│   │   ├── checkout/     # Checkout form
│   │   ├── orders/       # User orders
│   │   └── admin/        # Admin panel
│   ├── components/       # React components
│   ├── stores/           # Zustand stores (state)
│   ├── lib/              # Utilities
│   │   └── firestore.ts  # Firebase functions
│   └── types/            # TypeScript types
├── .env.local            # Firebase config (create this!)
├── package.json
├── SETUP_GUIDE.md        # Detailed setup
├── DEPLOYMENT.md         # Deployment checklist
└── README.md             # This file

```

---

## ✨ HIGHLIGHTS

🎯 **Zero Mock Data** - Everything from Firebase
📱 **Mobile First** - Responsive design
⚡ **Fast** - Next.js optimized (< 2s load)
🔒 **Secure** - Firestore rules protect data
📊 **Real-time** - Updates instantly
🎨 **Beautiful UI** - Tailwind + Framer Motion
🚀 **Deploy Easy** - One-click Vercel

---

## 📈 NEXT STEPS AFTER DEPLOY

1. **Share URL** với customers
2. **Test thực tế** với vài đơn hàng
3. **Monitor Firebase** usage (free tier ok for small shop)
4. **Collect feedback** từ users
5. **Add features** based on feedback
   - Payment gateway
   - Rating system
   - Coupon codes
   - Email notifications

---

**Ready? Let's go! 🚀**

```bash
npm install && npm run dev
```

---

**Questions? Check SETUP_GUIDE.md or DEPLOYMENT.md for more details!**
