import https from 'https';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';

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

// The exact order of products in the new PDF (assuming 1-to-1 with the first 80 images)
// If there are logos, they might throw this off, but user said "đúng với thứ tự đó"
const exactOrder = [
  "Khô bò truyền thống 500gr",
  "Khô bò truyền thống 300gr",
  "Khô gà lá chanh/ bơ tỏi hủ 500gr",
  "Mực cán nguyên con 500gr",
  "Mực cán nguyên con 200gr",
  "Mực xé sợi hấp nước dừa 500gr",
  "Mực xé sợi hấp nước dừa 300gr",
  "Mực rim sa tế 250gr",
  "Mực mix (mực cán và mực hấp) 250gr",
  "Cá cơm rim tỏi ớt 250gr",
  "Khô cá chỉ vàng 350gr",
  "Chà bông heo giả tay 250gr",
  "Chà bông heo giả tay 500gr", // I will add this just in case
  "Khô cá thiều 200gr",
  "Hạt điều loại A cồ 500gr",
  "Hạt điều loại A cồ bể 500gr",
  "Hạt dẻ cười 450gr",
  "Hạt Macca nứt vỏ size đại 500gr",
  "Hạnh nhân còn vỏ 400gr",
  "Hạt dinh dưỡng mix (macca, dẻ cười, điều, hạnh nhân, óc chó) 500gr",
  "Táo đỏ Tân Cương 500gr",
  "Táo đỏ Hàn Quốc 1kg",
  "Snack ăn vặt tuổi thơ túi",
  "Snack, bánh quy hủ pet",
  "Me thái sấy dẻo 500gr",
  "Me Thái ngào đường muối ớt 500gr",
  "Me Lào muối tôm 500gr",
  "OMAI MIX VỊ COLOURFUL PLUM Thái Lan",
  "Kẹo dừa café muối/ mix 9 vị/ sáp rau má 500gr",
  "Thạch tam giác trái cây",
  "Thạch dài trái cây 1kg",
  "Cơm cháy siêu chà bông tiến vua 180gr",
  "Bánh LSS mix 500gr",
  "Hạt mix dinh dưỡng nội địa trung 1kg (33-35 gói)",
  "Kẹo dẻo xoài muối ớt 500gr",
  "Kẹo dẻo chip chip trái cây 500gr",
  "Kẹo socola mix 500gr",
  "Kẹo mút trái cây gói 50 cây",
  "Kẹo nhộng socola 500gr",
  "Kẹo dẻo cá sấu 300gr",
  "Kẹo sỏi ngũ sắc 500gr",
  "Bánh que chấm socola lốc 10 hủ",
  "Thạch sữa chua 900gr",
  "Thạch trái cây 1kg",
  "Kẹo sỏi Socola 300g",
  "Bánh ticky Thái Lan lốc 13 hộp",
  "Bánh gấu ruốc chà bông thùng 30 cái 1.5kg",
  "Thạch dừa Thái Lan 1kg",
  "Đậu Hà Lan 350gr",
  "Chuối sấy mè vừng 500gr",
  "Kẹo hủ gấu mini (2 hủ)",
  "Chuối Sứ Sấy Giòn 500gr",
  "Lương khô mix 12 vị 1kg",
  "Thanh gạo lức chà bông/ mix hạt 500gr",
  "Bánh tráng cốt dừa 220gr",
  "Mứt trái cây sấy dẻo 300gr",
  "Trái cây sấy thập cẩm 500gr",
  "Kẹo coffee candy mix 8 vị 500gr",
  "Bánh phồng tôm rau củ/ tôm tiêu ớt/ tôm cà mau",
  "Rong biển trộn cơm",
  "Cơm cháy khô gà 500gr",
  "Chân gà bà tuyết xả tắc (bịch 20 chân)",
  "Chân gà lala vàng (bịch 20 chân)",
  "Bánh gấu 3 màu 320g (1 hộp)",
  "Set nấu: sâm bí đao hạt chia, sâm bổ lượng, chè dưỡng nhan",
  "Xí muội đen + đào 300g",
  "Bánh thuyền chà bông 500gr",
  "Thanh gạo lức chà bông 500g",
  "Ngũ cốc giảm cân nhiều Yến mạch 500g",
  "Ngũ cốc giảm cân ít yến mạch, nhiều hạt dinh dưỡng 500g",
  "Hạt bí rang củi 500gr",
  "Hạt hướng dương rang củi 500gr",
  "Hạt dưa rang củi 500gr",
  "Kẹo ổi muối ớt 500gr",
  "Muối chấm hải sản 500gr",
  "Ghẹ sữa rim tỏi ớt 250gr",
  "Chùm ruột ghim muối ớt 500gr",
  "Kẹo Chíp Dẻo BBQ Bóc Vỏ Mix Vị Trái Cây 500gr",
  "Hạt đác ghim thơm, atiso đỏ, dâu tằm, dâu tây, mãng cầu",
  "Sốt thái (trộn chân gà, tai heo, hoa quả...) 330ml"
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

async function main() {
  console.log('Đọc danh sách sản phẩm từ Firestore...');
  const listPath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?key=${API_KEY}&pageSize=300`;
  const result = await makeRequest(listPath, 'GET', null);
  
  if (!result.documents) {
    console.log('Không tìm thấy sản phẩm nào.');
    return;
  }

  console.log(`Tìm thấy ${result.documents.length} sản phẩm. Đang cập nhật lại ảnh từ thư mục products_new...`);
  
  let success = 0, fail = 0;
  
  for (const doc of result.documents) {
    const docName = doc.fields.name.stringValue;
    // Map product name to its sequential image in exactOrder array
    const imageIndex = exactOrder.findIndex(p => p === docName) + 1; // 1-based index
    
    if (imageIndex > 0) {
      // Use products_new directory
      const newImageUrl = `/images/products_new/pdf_img_${imageIndex}.jpeg`;
      
      const docPath = doc.name.replace('projects/' + PROJECT_ID + '/databases/(default)/documents', '');
      const updateMask = `updateMask.fieldPaths=imageUrl`;
      const updatePath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents${docPath}?key=${API_KEY}&${updateMask}`;
      
      const body = {
        fields: {
          imageUrl: { stringValue: newImageUrl }
        }
      };
      
      try {
        await makeRequest(updatePath, 'PATCH', body);
        success++;
      } catch (err) {
        fail++;
      }
    }
  }
  
  console.log(`Hoàn tất: ${success} thành công, ${fail} thất bại.`);
}

main().catch(console.error);
