import https from 'https';
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
const COLLECTION = 'products';
const BASE_URL = 'firestore.googleapis.com';

// Danh sách 80 sản phẩm chính xác từ file products_matched.json
const productsMatched = JSON.parse(readFileSync('c:/LADTECH/CHi2/products_matched.json', 'utf-8'));

// Build name -> imagePath map
const imageMap = {};
for (const p of productsMatched) {
  imageMap[p.name] = p.imagePath;
}

// Also update prices from PDF
const priceMap = {};
for (const p of productsMatched) {
  priceMap[p.name] = p.price;
}

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
          reject(new Error(`HTTP ${res.statusCode}: ${responseData.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Đang đọc danh sách sản phẩm từ Firestore...');
  const listPath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}?key=${API_KEY}&pageSize=300`;
  const result = await makeRequest(listPath, 'GET', null);

  if (!result.documents) {
    console.log('Không tìm thấy sản phẩm nào trong Firestore!');
    return;
  }

  console.log(`Tìm thấy ${result.documents.length} sản phẩm. Đang cập nhật ảnh + giá...`);

  let success = 0, fail = 0, skipped = 0;

  for (const doc of result.documents) {
    const docName = doc.fields.name?.stringValue;
    if (!docName) { skipped++; continue; }

    const newImageUrl = imageMap[docName];
    const newPrice = priceMap[docName];

    if (!newImageUrl) {
      console.log(`  ⚠️  Không tìm thấy ảnh cho: ${docName}`);
      skipped++;
      continue;
    }

    const docPath = doc.name.replace(`projects/${PROJECT_ID}/databases/(default)/documents`, '');
    const updatePath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents${docPath}?key=${API_KEY}&updateMask.fieldPaths=imageUrl&updateMask.fieldPaths=price`;

    const body = {
      fields: {
        imageUrl: { stringValue: newImageUrl },
        ...(newPrice ? { price: { integerValue: newPrice } } : {})
      }
    };

    try {
      await makeRequest(updatePath, 'PATCH', body);
      console.log(`  ✅ ${docName.slice(0, 50)} -> ${newImageUrl}`);
      success++;
    } catch (err) {
      console.log(`  ❌ ${docName}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n=== Hoàn tất: ${success} thành công | ${fail} lỗi | ${skipped} bỏ qua ===`);
}

main().catch(console.error);
