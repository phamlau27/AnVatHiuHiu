// Import 77 sản phẩm từ bảng giá 08.05.2026 (PDF chính xác)
// Chạy: npx ts-node scripts/import-products.ts

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Danh sách 77 sản phẩm từ bảng giá 08.05.2026
// Ảnh đã được map chính xác bằng get_image_rects() từ PDF
const products = [
  // ─── Khô & Chà Bông ──────────────────────────────
  { stt: 1,  name: "Khô bò truyền thống 500gr", price: 170000, category: "kho-cha-bong" },
  { stt: 2,  name: "Khô bò truyền thống 300gr", price: 120000, category: "kho-cha-bong" },
  { stt: 3,  name: "Khô gà lá chanh/ bơ tỏi hủ 500gr", price: 100000, category: "kho-cha-bong" },
  { stt: 4,  name: "Mực cán nguyên con 500gr", price: 175000, category: "kho-cha-bong" },
  { stt: 5,  name: "Mực cán nguyên con 200gr", price: 85000, category: "kho-cha-bong" },
  { stt: 6,  name: "Mực xé sợi hấp nước dừa 500gr", price: 190000, category: "kho-cha-bong" },
  { stt: 7,  name: "Mực xé sợi hấp nước dừa 300gr", price: 110000, category: "kho-cha-bong" },
  { stt: 8,  name: "Mực rim sa tế 250gr", price: 95000, category: "kho-cha-bong" },
  { stt: 9,  name: "Mực mix (mực cán và mực hấp) 250gr", price: 105000, category: "kho-cha-bong" },
  { stt: 10, name: "Cá cơm rim tỏi ớt 250gr", price: 60000, category: "kho-cha-bong" },
  { stt: 11, name: "Khô Cá chỉ vàng 350gr", price: 70000, category: "kho-cha-bong" },
  { stt: 12, name: "Chà bông heo giả tay 250gr", price: 90000, category: "kho-cha-bong" },
  { stt: 14, name: "Khô cá thiều 200gr", price: 70000, category: "kho-cha-bong" },
  { stt: 66, name: "Chân gà bà tuyết xả tắc (bịch 20 chân)", price: 190000, category: "kho-cha-bong" },
  { stt: 67, name: "Chân gà lala vàng (bịch 20 chân)", price: 160000, category: "kho-cha-bong" },
  { stt: 80, name: "Ghẹ sữa rim tỏi ớt 250gr", price: 65000, category: "kho-cha-bong" },

  // ─── Hạt Dinh Dưỡng ──────────────────────────────
  { stt: 15, name: "Hạt điều loại A cồ 500gr", price: 135000, category: "hat-dinh-duong" },
  { stt: 16, name: "Hạt điều loại A cồ bể 500gr", price: 90000, category: "hat-dinh-duong" },
  { stt: 17, name: "Hạt dẻ cười 450gr", price: 170000, category: "hat-dinh-duong" },
  { stt: 18, name: "Hạt Macca nứt vỏ size đại 500gr", price: 130000, category: "hat-dinh-duong" },
  { stt: 19, name: "Hạnh nhân còn vỏ 400gr", price: 120000, category: "hat-dinh-duong" },
  { stt: 20, name: "Hạt dinh dưỡng mix (macca, dẻ cười, điều, hạnh nhân, óc chó) 500gr", price: 130000, category: "hat-dinh-duong" },
  { stt: 37, name: "Hạt mix dinh dưỡng nội địa trung 1kg (33-35 gói)", price: 150000, category: "hat-dinh-duong" },
  { stt: 54, name: "Đậu Hà Lan 350gr", price: 40000, category: "hat-dinh-duong" },
  { stt: 75, name: "Hạt bí rang củi bịch 500gr", price: 75000, category: "hat-dinh-duong" },
  { stt: 76, name: "Hạt hướng dương rang củi 500gr", price: 65000, category: "hat-dinh-duong" },
  { stt: 77, name: "Hạt dưa rang củi 500gr", price: 100000, category: "hat-dinh-duong" },
  { stt: 83, name: "Hạt đác ghim thơm, atiso đỏ, dâu tằm, dâu tây, mãng cầu", price: 90000, category: "hat-dinh-duong" },

  // ─── Trái Cây Sấy & Mứt ───────────────────────────
  { stt: 21, name: "Táo đỏ Tân cương 500gr", price: 60000, category: "trai-cay-say-mut" },
  { stt: 22, name: "Táo đỏ Hàn Quốc 1kg", price: 100000, category: "trai-cay-say-mut" },
  { stt: 27, name: "Me thái sấy dẻo 500gr", price: 90000, category: "trai-cay-say-mut" },
  { stt: 28, name: "Me Thái ngào đường muối ớt 500gr", price: 90000, category: "trai-cay-say-mut" },
  { stt: 29, name: "Me Lào muối tôm 500gr", price: 90000, category: "trai-cay-say-mut" },
  { stt: 30, name: "OMAI MIX VỊ COLOURFUL PLUM Thái Lan", price: 55000, category: "trai-cay-say-mut" },
  { stt: 55, name: "Chuối sấy mè vừng 500gr", price: 55000, category: "trai-cay-say-mut" },
  { stt: 56, name: "Chuối Sứ Sấy Giòn 500gr", price: 60000, category: "trai-cay-say-mut" },
  { stt: 60, name: "Mứt trái cây sấy dẻo 300gr", price: 50000, category: "trai-cay-say-mut" },
  { stt: 61, name: "Trái cây sấy thập cẩm 500gr", price: 70000, category: "trai-cay-say-mut" },
  { stt: 70, name: "Xí muội đen + đào 300g", price: 65000, category: "trai-cay-say-mut" },
  { stt: 78, name: "Kẹo ổi muối ớt 500gr", price: 65000, category: "trai-cay-say-mut" },
  { stt: 81, name: "Chùm ruột ghim muối ớt 500gr", price: 80000, category: "trai-cay-say-mut" },

  // ─── Kẹo & Thạch ──────────────────────────────────
  { stt: 31, name: "Kẹo dừa café muối 500gr", price: 80000, category: "keo-thach" },
  { stt: 33, name: "Thạch tam giác trái cây", price: 40000, category: "keo-thach" },
  { stt: 34, name: "Thạch dài trái cây 1kg", price: 80000, category: "keo-thach" },
  { stt: 38, name: "Kẹo dẻo xoài muối ớt 500gr", price: 70000, category: "keo-thach" },
  { stt: 39, name: "Kẹo dẻo chip chip trái cây 500gr", price: 55000, category: "keo-thach" },
  { stt: 40, name: "Kẹo socola mix 500gr", price: 70000, category: "keo-thach" },
  { stt: 41, name: "Kẹo mút trái cây gói 50 cây", price: 80000, category: "keo-thach" },
  { stt: 42, name: "Kẹo nhộng socola 500gr", price: 55000, category: "keo-thach" },
  { stt: 43, name: "Kẹo dẻo cá sấu 300gr", price: 45000, category: "keo-thach" },
  { stt: 44, name: "Kẹo sỏi ngũ sắc 500gr", price: 65000, category: "keo-thach" },
  { stt: 46, name: "Thạch sữa chua 900gr", price: 65000, category: "keo-thach" },
  { stt: 47, name: "Thạch trái cây 1kg", price: 75000, category: "keo-thach" },
  { stt: 48, name: "Kẹo sỏi Socola 300g", price: 70000, category: "keo-thach" },
  { stt: 53, name: "Thạch dừa thái lan 1kg", price: 50000, category: "keo-thach" },
  { stt: 62, name: "Kẹo coffee candy mix 8 vị 500gr", price: 80000, category: "keo-thach" },
  { stt: 82, name: "Kẹo Chíp Dẻo BQQ Bóc Vỏ Mix Vị Trái Cây 500gr", price: 85000, category: "keo-thach" },

  // ─── Bánh & Snack ─────────────────────────────────
  { stt: 26, name: "Snack ăn vặt tuổi thơ túi", price: 40000, category: "banh-snack" },
  { stt: 35, name: "Cơm cháy siêu chà bông tiến vua 180gr", price: 40000, category: "banh-snack" },
  { stt: 36, name: "Bánh LSS mix 500gr", price: 75000, category: "banh-snack" },
  { stt: 45, name: "Bánh que chấm socola lốc 10 hủ", price: 50000, category: "banh-snack" },
  { stt: 49, name: "Bánh ticky Thái Lan lốc 13 hộp", price: 80000, category: "banh-snack" },
  { stt: 52, name: "Bánh gấu ruốc chà bông thùng 30 cái 1.5kg", price: 160000, category: "banh-snack" },
  { stt: 57, name: "Lương khô mix 12 vị 1kg", price: 110000, category: "banh-snack" },
  { stt: 58, name: "Thanh gạo lức chà bông/ mix hạt 500gr", price: 80000, category: "banh-snack" },
  { stt: 59, name: "Bánh tráng cốt dừa 220gr", price: 35000, category: "banh-snack" },
  { stt: 63, name: "Bánh phồng tôm rau củ/ tôm tiêu ớt/ tôm cà mau", price: 50000, category: "banh-snack" },
  { stt: 65, name: "Cơm cháy khô gà 500gr", price: 65000, category: "banh-snack" },
  { stt: 68, name: "Bánh gấu 3 màu 320g", price: 60000, category: "banh-snack" },
  { stt: 71, name: "Bánh thuyền chà bông 500gr", price: 90000, category: "banh-snack" },
  { stt: 72, name: "Thanh gạo lức chà bông 500g", price: 80000, category: "banh-snack" },
  { stt: 64, name: "Rong biển trộn cơm", price: 50000, category: "banh-snack" },

  // ─── Gia Vị & Khác ────────────────────────────────
  { stt: 69, name: "Set nấu: sâm bí đao hạt chia, sâm bổ lượng, chè dưỡng nhan", price: 55000, category: "gia-vi-khac" },
  { stt: 73, name: "Ngũ cốc giảm cân nhiều Yến mạch 500g", price: 65000, category: "gia-vi-khac" },
  { stt: 74, name: "Ngũ cốc giảm cân ít yến mạch, nhiều hạt dinh dưỡng 500g", price: 85000, category: "gia-vi-khac" },
  { stt: 79, name: "Muối chấm hải sản 500gr", price: 45000, category: "gia-vi-khac" },
  { stt: 84, name: "Sốt thái (trộn chân gà, tai heo, hoa quả…) 330ml", price: 45000, category: "gia-vi-khac" },
];

async function clearAllProducts() {
  console.log("Xóa tất cả sản phẩm cũ...");
  const snapshot = await getDocs(collection(db, "products"));
  const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(db, "products", d.id)));
  await Promise.all(deletePromises);
  console.log(`Đã xóa ${snapshot.docs.length} sản phẩm.`);
}

async function importProducts() {
  console.log("Import sản phẩm mới (bảng giá 08.05.2026)...");
  let success = 0;
  let fail = 0;

  for (const p of products) {
    try {
      // Sử dụng ảnh thật từ PDF đã trích xuất chính xác
      const imageUrl = `/images/products_new/product_${String(p.stt).padStart(2, '0')}.jpeg`;

      await addDoc(collection(db, "products"), {
        name: p.name,
        price: p.price,
        category: p.category,
        imageUrl,
        isPromotion: false,
        soldCount: 0,
        description: "",
        createdAt: serverTimestamp(),
      });
      console.log(`✅ STT ${p.stt}: ${p.name}`);
      success++;
      // Rate limiting
      await new Promise((r) => setTimeout(r, 80));
    } catch (err) {
      console.error(`❌ STT ${p.stt}: ${p.name}:`, err);
      fail++;
    }
  }

  console.log(`\nHoàn tất: ${success} thành công, ${fail} thất bại.`);
}

async function main() {
  console.log("=== Import bảng giá 08.05.2026 (77 sản phẩm, ảnh thật từ PDF) ===\n");
  await clearAllProducts();
  await importProducts();
  console.log("\n✅ Import xong! Tất cả sản phẩm đã có ảnh thật.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
