import { NextRequest, NextResponse } from "next/server";

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
}

interface FirestoreDoc {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
}

interface LightweightProduct {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  imageUrl: string;
  category: string;
  isPromotion: boolean;
  soldCount: number;
  description?: string;
  hasDescriptionImages: boolean;
  createdAt: number;
}

const SERVER_CACHE_TTL_MS = 60 * 1000; // 60 seconds
let cachedProducts: LightweightProduct[] | null = null;
let cacheTimestamp = 0;

function readString(field?: FirestoreValue): string {
  return field?.stringValue ?? "";
}

function readNumber(field?: FirestoreValue): number {
  if (!field) return 0;
  if (field.integerValue !== undefined) return Number(field.integerValue);
  if (field.doubleValue !== undefined) return Number(field.doubleValue);
  return 0;
}

function readBoolean(field?: FirestoreValue): boolean {
  return Boolean(field?.booleanValue);
}

function readTimestampMs(field?: FirestoreValue, fallback?: string): number {
  const iso = field?.timestampValue || fallback;
  if (!iso) return 0;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? 0 : ms;
}

async function getLightweightProducts(): Promise<LightweightProduct[]> {
  const now = Date.now();
  if (cachedProducts && cachedProducts.length > 0 && now - cacheTimestamp < SERVER_CACHE_TTL_MS) {
    return cachedProducts;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }

  const fieldPaths = [
    "name",
    "price",
    "promoPrice",
    "imageUrl",
    "category",
    "isPromotion",
    "soldCount",
    "description",
    "createdAt",
  ];

  const allItems: LightweightProduct[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "100" });
    for (const fp of fieldPaths) {
      params.append("mask.fieldPaths", fp);
    }
    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?${params.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Firestore REST API error: ${res.status}`);
    }

    const json = (await res.json()) as {
      documents?: FirestoreDoc[];
      nextPageToken?: string;
    };

    const docs = json.documents ?? [];
    for (const doc of docs) {
      const id = doc.name.split("/").pop() || "";
      const f = doc.fields ?? {};
      const promoPriceVal = readNumber(f.promoPrice);
      const description = readString(f.description);

      allItems.push({
        id,
        name: readString(f.name),
        price: readNumber(f.price),
        promoPrice: promoPriceVal > 0 ? promoPriceVal : undefined,
        imageUrl: readString(f.imageUrl),
        category: readString(f.category),
        isPromotion: readBoolean(f.isPromotion),
        soldCount: readNumber(f.soldCount),
        description,
        hasDescriptionImages: Boolean(description),
        createdAt: readTimestampMs(f.createdAt, doc.createTime),
      });
    }

    pageToken = json.nextPageToken;
  } while (pageToken);

  allItems.sort((a, b) => b.createdAt - a.createdAt);

  if (allItems.length > 0) {
    cachedProducts = allItems;
    cacheTimestamp = now;
  }

  return allItems;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const all = searchParams.get("all") === "1";
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);
    const limitParam = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10) || 12));

    let items = await getLightweightProducts();
    if (category) {
      items = items.filter((p) => p.category === category);
    }

    const total = items.length;
    const result = all ? items : items.slice(offset, offset + limitParam);
    const hasMore = !all && offset + limitParam < total;

    return NextResponse.json(
      { products: result, hasMore, total },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}
