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
  documentId,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Order, OrderItem } from "@/types";

// ─── Products ────────────────────────────────────────

export async function getProducts(filters?: {
  category?: string;
  sort?: string;
  search?: string;
  promoOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
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

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  } catch (err) {
    console.warn("getProductById from Firebase failed, falling back to mock:", err);
  }

  // Fallback to mock data
  const { mockProducts } = await import("@/data/mockProducts");
  const mockProduct = mockProducts.find(p => p.id === id);
  if (mockProduct) {
    return { ...mockProduct, createdAt: Timestamp.now() } as Product;
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

// ─── Admin: Products CRUD ────────────────────────────

export async function createProduct(
  data: Omit<Product, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

// ─── Admin: Orders ───────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Order)
  );
}

export async function archiveOrder(id: string): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status: "archived" });
}

export async function unarchiveOrder(id: string): Promise<void> {
  await updateDoc(doc(db, "orders", id), { status: "new" });
}
