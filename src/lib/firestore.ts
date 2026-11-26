import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  documentId,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Order, OrderItem } from "@/types";

// ─── In-memory Product Cache ─────────────────────────
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

interface PageCacheEntry {
  products: Product[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  timestamp: number;
}

const pageCache = new Map<string, PageCacheEntry>();
let allProductsCache: { data: Product[]; timestamp: number } | null = null;

// Fast HTTP/CDN-backed product caches
interface FastPageResult {
  products: Product[];
  hasMore: boolean;
  total: number;
}
const fastPageCache = new Map<string, { data: FastPageResult; timestamp: number }>();
const fastPageInFlight = new Map<string, Promise<FastPageResult>>();
let fastAllCache: { data: Product[]; timestamp: number } | null = null;
let fastAllInFlight: Promise<Product[]> | null = null;

export function invalidateProductCache() {
  pageCache.clear();
  allProductsCache = null;
  fastPageCache.clear();
  fastPageInFlight.clear();
  fastAllCache = null;
  fastAllInFlight = null;
}

export async function fetchProductsPage(options: {
  category?: string;
  offset?: number;
  limit?: number;
}): Promise<FastPageResult> {
  const offset = options.offset ?? 0;
  const pageLimit = options.limit ?? 12;
  const key = `${options.category || "__all__"}:${offset}:${pageLimit}`;

  const cached = fastPageCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const existing = fastPageInFlight.get(key);
  if (existing) return existing;

  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(pageLimit),
  });
  if (options.category) params.set("category", options.category);

  const promise = fetch(`/api/products?${params.toString()}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as FastPageResult;
    })
    .then((data) => {
      fastPageCache.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      fastPageInFlight.delete(key);
    });

  fastPageInFlight.set(key, promise);
  return promise;
}

export function prefetchProductsPage(options: {
  category?: string;
  offset: number;
  limit?: number;
}) {
  fetchProductsPage(options).catch(() => {
    // Ignore background prefetch errors
  });
}

export async function fetchAllProductsCached(): Promise<Product[]> {
  if (fastAllCache && Date.now() - fastAllCache.timestamp < CACHE_TTL_MS) {
    return fastAllCache.data;
  }
  if (fastAllInFlight) return fastAllInFlight;

  fastAllInFlight = fetch("/api/products?all=1")
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { products: Product[] };
      fastAllCache = { data: json.products, timestamp: Date.now() };
      return json.products;
    })
    .finally(() => {
      fastAllInFlight = null;
    });

  return fastAllInFlight;
}

export function prefetchAllProductsForSearch() {
  fetchAllProductsCached().catch(() => {
    // Ignore background prefetch errors
  });
}

// ─── Products ────────────────────────────────────────

export async function getProducts(filters?: {
  category?: string;
  sort?: string;
  search?: string;
  promoOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
  const hasFilters =
    filters?.category ||
    filters?.sort ||
    filters?.promoOnly ||
    filters?.limit;

  // Use cached full list when no server-side query filters are specified
  if (!hasFilters && allProductsCache && Date.now() - allProductsCache.timestamp < CACHE_TTL_MS) {
    let products = allProductsCache.data;
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(searchLower));
    }
    return products;
  }

  let q = query(collection(db, "products"));

  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }

  if (filters?.promoOnly) {
    q = query(q, where("isPromotion", "==", true));
  }

  if (filters?.sort === "newest") {
    q = query(q, orderBy("createdAt", "desc"));
  } else if (filters?.sort === "best-selling") {
    q = query(q, orderBy("soldCount", "desc"));
  } else if (filters?.sort === "price-asc") {
    q = query(q, orderBy("price", "asc"));
  } else if (filters?.sort === "price-desc") {
    q = query(q, orderBy("price", "desc"));
  }

  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  let products = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Product)
  );

  if (!hasFilters) {
    allProductsCache = { data: products, timestamp: Date.now() };
  }

  // Client-side search (Firestore doesn't support full-text search)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(searchLower)
    );
  }

  // If sort is promotion, filter client-side if not already
  if (filters?.sort === "promotion" && !filters?.promoOnly) {
    products = products.filter((p) => p.isPromotion);
  }

  return products;
}

/**
 * Real-time listener for specific products (useful for cart validation)
 */
export function subscribeToProductsByIds(ids: string[], callback: (products: Product[]) => void) {
  if (ids.length === 0) {
    callback([]);
    return () => {};
  }
  
  // Split into chunks of 30 as 'in' query limit
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 30) {
    chunks.push(ids.slice(i, i + 30));
  }

  const unsubscribers: (() => void)[] = [];
  const resultsByChunk: { [key: number]: Product[] } = {};

  chunks.forEach((chunk, index) => {
    const q = query(collection(db, "products"), where(documentId(), "in", chunk));
    const unsub = onSnapshot(q, (snapshot) => {
      resultsByChunk[index] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Merge all chunks and call back
      const allProducts = Object.values(resultsByChunk).flat();
      callback(allProducts);
    }, (error) => {
      console.error(`Error subscribing to products chunk ${index}:`, error);
    });
    unsubscribers.push(unsub);
  });

  return () => unsubscribers.forEach(unsub => unsub());
}

/**
 * Real-time listener for products with filters
 */
export function subscribeToProducts(filters: { category?: string; promoOnly?: boolean }, callback: (products: Product[]) => void) {
  let q = query(collection(db, "products"));
  if (filters.category) q = query(q, where("category", "==", filters.category));
  if (filters.promoOnly) q = query(q, where("isPromotion", "==", true));
  
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    callback(products);
  }, (error) => {
    console.error("Error subscribing to products:", error);
  });
}

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Paginated products with startAfter cursor and per-category cache
export async function getProductsPaginated(options: {
  category?: string;
  pageSize?: number;
  lastDoc?: DocumentSnapshot | null;
}): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
  const pageSize = options.pageSize ?? 12;
  const cacheKey = options.category || "__all__";

  // Return cached first page if available and fresh
  if (!options.lastDoc) {
    const cached = pageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        products: cached.products,
        lastDoc: cached.lastDoc,
        hasMore: cached.hasMore,
      };
    }
  }

  const baseConstraints = options.category
    ? [where("category", "==", options.category)]
    : [orderBy("createdAt", "desc")];

  const q = options.lastDoc
    ? query(
        collection(db, "products"),
        ...baseConstraints,
        startAfter(options.lastDoc),
        limit(pageSize + 1)
      )
    : query(
        collection(db, "products"),
        ...baseConstraints,
        limit(pageSize + 1)
      );

  const snapshot = await getDocs(q);
  const hasMore = snapshot.docs.length > pageSize;
  const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
  const products = docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  const newLastDoc = docs.length > 0 ? docs[docs.length - 1] : null;

  if (!options.lastDoc) {
    pageCache.set(cacheKey, {
      products: !options.category ? shuffleArray(products) : products,
      lastDoc: newLastDoc,
      hasMore,
      timestamp: Date.now(),
    });
    const entry = pageCache.get(cacheKey)!;
    return {
      products: entry.products,
      lastDoc: entry.lastDoc,
      hasMore: entry.hasMore,
    };
  }

  return { products, lastDoc: newLastDoc, hasMore };
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  } catch (err) {
    console.warn("getProductById failed:", err);
  }
  return null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  // Firestore 'in' query supports max 30 items
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 30) {
    chunks.push(ids.slice(i, i + 30));
  }
  const products: Product[] = [];
  for (const chunk of chunks) {
    const q = query(
      collection(db, "products"),
      where(documentId(), "in", chunk)
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
  }
  return products;
}

// ─── Orders ──────────────────────────────────────────

export async function createOrder(data: {
  customerName: string;
  phone: string;
  address: string;
  type: "delivery" | "pickup";
  note: string;
  items: OrderItem[];
  totalPrice: number;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<void> {
  const updateData = { ...data };
  // Remove fields that shouldn't be updated directly or are managed differently
  delete updateData.id;
  delete updateData.createdAt;
  await updateDoc(doc(db, "orders", id), updateData);
}

/**
 * Real-time listener for a single order
 */
export function subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
  return onSnapshot(doc(db, "orders", orderId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Order);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to order ${orderId}:`, error);
  });
}

export async function getOrdersByIds(ids: string[]): Promise<Order[]> {
  if (ids.length === 0) return [];
  const orders: Order[] = [];
  // Fetch individually since IDs come from localStorage
  for (const id of ids) {
    try {
      const docSnap = await getDoc(doc(db, "orders", id));
      if (docSnap.exists()) {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      }
    } catch {
      // Skip invalid IDs
    }
  }
  return orders.sort((a, b) => {
    const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });
}

/**
 * Real-time listener for multiple orders by ID.
 * Uses individual doc() listeners (get permission) instead of collection query (list permission),
 * because Firestore rules allow anonymous users to `get` orders by ID but restrict `list` to admins.
 */
export function subscribeToOrdersByIds(ids: string[], callback: (orders: Order[]) => void) {
  if (ids.length === 0) {
    callback([]);
    return () => {};
  }

  const uniqueIds = Array.from(new Set(ids));
  const orderMap = new Map<string, Order>();
  const resolvedIds = new Set<string>();
  const unsubscribers: (() => void)[] = [];

  const emit = () => {
    if (resolvedIds.size < uniqueIds.length) return;
    const sorted = Array.from(orderMap.values()).sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    callback(sorted);
  };

  uniqueIds.forEach((id) => {
    const unsub = onSnapshot(
      doc(db, "orders", id),
      (docSnap) => {
        resolvedIds.add(id);
        if (docSnap.exists()) {
          orderMap.set(id, { id: docSnap.id, ...docSnap.data() } as Order);
        } else {
          orderMap.delete(id);
        }
        emit();
      },
      (error) => {
        console.warn(`Error subscribing to order ${id}:`, error);
        resolvedIds.add(id);
        emit();
      }
    );
    unsubscribers.push(unsub);
  });

  return () => unsubscribers.forEach((unsub) => unsub());
}

// ─── Admin: Products CRUD ────────────────────────────

export async function createProduct(
  data: Omit<Product, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  invalidateProductCache();
  return docRef.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "products", id), data);
  invalidateProductCache();
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
  invalidateProductCache();
}

export function subscribeToAllProducts(callback: (products: Product[]) => void) {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    callback(products);
  });
}

// ─── Admin: Orders ───────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Order))
    .filter((order) => !order.adminDeleted);
}

/**
 * Real-time listener for all admin orders
 */
export function subscribeToAllOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Order))
      .filter((order) => !order.adminDeleted);
    callback(orders);
  });
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status });
}

export async function archiveOrder(id: string): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status: "completed" });
}

export async function unarchiveOrder(id: string): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status: "new" });
}

export async function deleteOrder(id: string): Promise<void> {
  // Soft delete: hide from admin, but keep in database so users can still see it
  await updateDoc(doc(db, "orders", id), { adminDeleted: true });
}
