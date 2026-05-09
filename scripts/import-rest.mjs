// Import 84 sản phẩm sử dụng Firestore REST API (bypass security rules)
// Chạy: node scripts/import-rest.mjs

import https from 'https';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load env
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
}

const API_KEY = env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE_URL = `firestore.googleapis.com`;
const COLLECTION = 'products';

function placeholderImg(name, color) {
  return `https://placehold.co/400x400/${color}/FFFFFF?text=${encodeURIComponent(name.slice(0, 18))}`;
}

const products = [
  // ─── Khô & Chà Bông ──
  { name: "Khô bò truyền thống 500gr", price: 170000, category: "kho-cha-bong", color: "8B4513" },
  { name: "Khô bò truyền thống 300gr", price: 120000, category: "kho-cha-bong", color: "8B4513" },
  { name: "Khô gà lá chanh/ bơ tỏi hủ 500gr", price: 100000, category: "kho-cha-bong", color: "D2691E" },
  { name: "Mực cán nguyên con 500gr", price: 175000, category: "kho-cha-bong", color: "2F4F4F" },
  { name: "Mực cán nguyên con 200gr", price: 85000, category: "kho-cha-bong", color: "2F4F4F" },
  { name: "Mực xé sợi hấp nước dừa 500gr", price: 190000, category: "kho-cha-bong", color: "3D5A3E" },
  { name: "Mực xé sợi hấp nước dừa 300gr", price: 110000, category: "kho-cha-bong", color: "3D5A3E" },
  { name: "Mực rim sa tế 250gr", price: 95000, category: "kho-cha-bong", color: "CC3300" },
  { name: "Mực mix (mực cán và mực hấp) 250gr", price: 105000, category: "kho-cha-bong", color: "4A4A4A" },
  { name: "Cá cơm rim tỏi ớt 250gr", price: 60000, category: "kho-cha-bong", color: "CD853F" },
  { name: "Khô cá chỉ vàng 350gr", price: 70000, category: "kho-cha-bong", color: "B8860B" },
  { name: "Chà bông heo giả tay 250gr", price: 90000, category: "kho-cha-bong", color: "C0836A" },
  { name: "Chà bông heo giả tay 500gr", price: 160000, category: "kho-cha-bong", color: "C0836A" },
  { name: "Khô cá thiều 200gr", price: 70000, category: "kho-cha-bong", color: "8B6914" },
  { name: "Ghẹ sữa rim tỏi ớt 250gr", price: 65000, category: "kho-cha-bong", color: "E05A1A" },
  { name: "Chân gà bà tuyết xả tắc (bịch 20 chân)", price: 190000, category: "kho-cha-bong", color: "DAA520" },
  { name: "Chân gà lala vàng (bịch 20 chân)", price: 160000, category: "kho-cha-bong", color: "E8B84B" },
  { name: "Chùm ruột ghim muối ớt 500gr", price: 80000, category: "kho-cha-bong", color: "C04040" },
  // ─── Hạt Dinh Dưỡng ──
  { name: "Hạt điều loại A cồ 500gr", price: 135000, category: "hat-dinh-duong", color: "C8A878" },
  { name: "Hạt điều loại A cồ bể 500gr", price: 90000, category: "hat-dinh-duong", color: "C8A878" },
  { name: "Hạt dẻ cười 450gr", price: 170000, category: "hat-dinh-duong", color: "DEB887" },
  { name: "Hạt Macca nứt vỏ size đại 500gr", price: 130000, category: "hat-dinh-duong", color: "A0856E" },
  { name: "Hạnh nhân còn vỏ 400gr", price: 120000, category: "hat-dinh-duong", color: "B8906A" },
  { name: "Hạt dinh dưỡng mix (macca, dẻ cười, điều, hạnh nhân, óc chó) 500gr", price: 130000, category: "hat-dinh-duong", color: "8B7355" },
  { name: "Hạt mix dinh dưỡng nội địa trung 1kg (33-35 gói)", price: 150000, category: "hat-dinh-duong", color: "966432" },
  { name: "Hạt bí rang củi 500gr", price: 75000, category: "hat-dinh-duong", color: "5F6B2A" },
  { name: "Hạt hướng dương rang củi 500gr", price: 65000, category: "hat-dinh-duong", color: "808000" },
  { name: "Hạt dưa rang củi 500gr", price: 100000, category: "hat-dinh-duong", color: "6B8E23" },
  { name: "Đậu Hà Lan 350gr", price: 40000, category: "hat-dinh-duong", color: "556B2F" },
  // ─── Trái Cây Sấy & Mứt ──
  { name: "Táo đỏ Tân Cương 500gr", price: 60000, category: "trai-cay-say-mut", color: "8B0000" },
  { name: "Táo đỏ Hàn Quốc 1kg", price: 100000, category: "trai-cay-say-mut", color: "B22222" },
  { name: "Me thái sấy dẻo 500gr", price: 90000, category: "trai-cay-say-mut", color: "8B4513" },
  { name: "Me Thái ngào đường muối ớt 500gr", price: 90000, category: "trai-cay-say-mut", color: "9A5C2A" },
  { name: "Me Lào muối tôm 500gr", price: 90000, category: "trai-cay-say-mut", color: "A0522D" },
  { name: "OMAI MIX VỊ COLOURFUL PLUM Thái Lan", price: 55000, category: "trai-cay-say-mut", color: "800080" },
  { name: "Xí muội đen + đào 300g", price: 65000, category: "trai-cay-say-mut", color: "4B0082" },
  { name: "Chuối sấy mè vừng 500gr", price: 55000, category: "trai-cay-say-mut", color: "DAA520" },
  { name: "Chuối Sứ Sấy Giòn 500gr", price: 60000, category: "trai-cay-say-mut", color: "F4A460" },
  { name: "Mứt trái cây sấy dẻo 300gr", price: 50000, category: "trai-cay-say-mut", color: "E95420" },
  { name: "Trái cây sấy thập cẩm 500gr", price: 70000, category: "trai-cay-say-mut", color: "FF8C00" },
  { name: "Hạt đác ghim thơm, atiso đỏ, dâu tằm, dâu tây, mãng cầu", price: 90000, category: "trai-cay-say-mut", color: "DC143C" },
  { name: "Kẹo ổi muối ớt 500gr", price: 65000, category: "trai-cay-say-mut", color: "3CB371" },
  // ─── Kẹo & Thạch ──
  { name: "Kẹo dừa café muối/ mix 9 vị/ sáp rau má 500gr", price: 80000, category: "keo-thach", color: "F5DEB3" },
  { name: "Thạch tam giác trái cây", price: 40000, category: "keo-thach", color: "87CEEB" },
  { name: "Thạch dài trái cây 1kg", price: 80000, category: "keo-thach", color: "7EC8C8" },
  { name: "Kẹo dẻo xoài muối ớt 500gr", price: 70000, category: "keo-thach", color: "FFA500" },
  { name: "Kẹo dẻo chip chip trái cây 500gr", price: 55000, category: "keo-thach", color: "FF69B4" },
  { name: "Kẹo socola mix 500gr", price: 70000, category: "keo-thach", color: "4A2C2A" },
  { name: "Kẹo mút trái cây gói 50 cây", price: 80000, category: "keo-thach", color: "FF1493" },
  { name: "Kẹo nhộng socola 500gr", price: 55000, category: "keo-thach", color: "5C3317" },
  { name: "Kẹo dẻo cá sấu 300gr", price: 45000, category: "keo-thach", color: "2E8B57" },
  { name: "Kẹo sỏi ngũ sắc 500gr", price: 65000, category: "keo-thach", color: "9370DB" },
  { name: "Thạch sữa chua 900gr", price: 65000, category: "keo-thach", color: "FFFACD" },
  { name: "Thạch trái cây 1kg", price: 75000, category: "keo-thach", color: "98FB98" },
  { name: "Kẹo sỏi Socola 300g", price: 70000, category: "keo-thach", color: "7B3F00" },
  { name: "Thạch dừa Thái Lan 1kg", price: 50000, category: "keo-thach", color: "E0F7FA" },
  { name: "Kẹo coffee candy mix 8 vị 500gr", price: 80000, category: "keo-thach", color: "6F4E37" },
  { name: "Kẹo Chíp Dẻo BBQ Bóc Vỏ Mix Vị Trái Cây 500gr", price: 85000, category: "keo-thach", color: "C04040" },
  { name: "Kẹo hủ gấu mini (2 hủ)", price: 60000, category: "keo-thach", color: "FFD700" },
  // ─── Bánh & Snack ──
  { name: "Snack ăn vặt tuổi thơ túi", price: 50000, category: "banh-snack", color: "FF8C00" },
  { name: "Snack, bánh quy hủ pet", price: 40000, category: "banh-snack", color: "FFA07A" },
  { name: "Cơm cháy siêu chà bông tiến vua 180gr", price: 40000, category: "banh-snack", color: "D2691E" },
  { name: "Bánh LSS mix 500gr", price: 75000, category: "banh-snack", color: "DEB887" },
  { name: "Bánh que chấm socola lốc 10 hủ", price: 50000, category: "banh-snack", color: "8B4513" },
  { name: "Bánh ticky Thái Lan lốc 13 hộp", price: 80000, category: "banh-snack", color: "CD853F" },
  { name: "Bánh gấu ruốc chà bông thùng 30 cái 1.5kg", price: 160000, category: "banh-snack", color: "DAA520" },
  { name: "Lương khô mix 12 vị 1kg", price: 110000, category: "banh-snack", color: "BDB76B" },
  { name: "Thanh gạo lức chà bông/ mix hạt 500gr", price: 80000, category: "banh-snack", color: "8FBC8F" },
  { name: "Bánh tráng cốt dừa 220gr", price: 35000, category: "banh-snack", color: "F5F5DC" },
  { name: "Bánh phồng tôm rau củ/ tôm tiêu ớt/ tôm cà mau", price: 50000, category: "banh-snack", color: "FFDAB9" },
  { name: "Cơm cháy khô gà 500gr", price: 65000, category: "banh-snack", color: "B8860B" },
  { name: "Bánh gấu 3 màu 320g (1 hộp)", price: 60000, category: "banh-snack", color: "D2B48C" },
  { name: "Bánh thuyền chà bông 500gr", price: 90000, category: "banh-snack", color: "BC8A56" },
  { name: "Thanh gạo lức chà bông 500g", price: 80000, category: "banh-snack", color: "8FBC8F" },
  { name: "Ngũ cốc giảm cân nhiều Yến mạch 500g", price: 65000, category: "banh-snack", color: "C8B89A" },
  { name: "Ngũ cốc giảm cân ít yến mạch, nhiều hạt dinh dưỡng 500g", price: 85000, category: "banh-snack", color: "BDA98A" },
  { name: "Rong biển trộn cơm", price: 50000, category: "banh-snack", color: "2E8B57" },
  // ─── Gia Vị & Khác ──
  { name: "Set nấu: sâm bí đao hạt chia, sâm bổ lượng, chè dưỡng nhan", price: 55000, category: "gia-vi-khac", color: "20B2AA" },
  { name: "Muối chấm hải sản 500gr", price: 45000, category: "gia-vi-khac", color: "708090" },
  { name: "Sốt thái (trộn chân gà, tai heo, hoa quả...) 330ml", price: 45000, category: "gia-vi-khac", color: "CC0000" },
];

function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE_URL,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function deleteAllProducts() {
  console.log('Đọc danh sách sản phẩm cũ...');
  try {
    const listPath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?key=${API_KEY}&pageSize=300`;
    const result = await makeRequest(listPath, 'GET', null);
    if (result.documents && result.documents.length > 0) {
      console.log(`Xóa ${result.documents.length} sản phẩm cũ...`);
      for (const doc of result.documents) {
        const docPath = doc.name.replace('projects/' + PROJECT_ID + '/databases/(default)/documents', '');
        await makeRequest(`/v1/projects/${PROJECT_ID}/databases/(default)/documents${docPath}?key=${API_KEY}`, 'DELETE', null);
      }
    }
    console.log('✅ Đã xóa hết sản phẩm cũ.');
  } catch (err) {
    console.log('Lỗi xóa (có thể bỏ qua):', err.message);
  }
}

async function addProduct(product) {
  const imageUrl = placeholderImg(product.name, product.color);
  const body = {
    fields: {
      name: { stringValue: product.name },
      price: { integerValue: product.price },
      category: { stringValue: product.category },
      imageUrl: { stringValue: imageUrl },
      isPromotion: { booleanValue: false },
      soldCount: { integerValue: 0 },
      description: { stringValue: '' },
      createdAt: { timestampValue: new Date().toISOString() }
    }
  };
  const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?key=${API_KEY}`;
  return makeRequest(path, 'POST', body);
}

async function main() {
  console.log('=== Import bảng giá 22.04.2026 (REST API) ===\n');
  await deleteAllProducts();
  
  console.log(`\nImport ${products.length} sản phẩm...`);
  let success = 0, fail = 0;
  
  for (const p of products) {
    try {
      await addProduct(p);
      process.stdout.write(`✅ ${p.name}\n`);
      success++;
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      process.stdout.write(`❌ ${p.name}: ${err.message.slice(0, 80)}\n`);
      fail++;
    }
  }
  
  console.log(`\n=== Hoàn tất: ${success} thành công, ${fail} thất bại ===`);
  console.log('Vào Admin để thêm ảnh thật cho từng sản phẩm!');
}

main().catch(console.error);
