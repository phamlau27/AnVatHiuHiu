"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { subscribeToAllProducts, deleteProduct } from "@/lib/firestore";
import { formatPrice, mockProducts } from "@/data/mockProducts";
import { showToast } from "@/components/ui/Toast";
import { CATEGORIES } from "@/types";
import type { Product } from "@/types";
import { Timestamp } from "firebase/firestore";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  useEffect(() => {
    const unsub = subscribeToAllProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id);
      showToast("Đã xóa!", "success");
    } catch { showToast("Lỗi khi xóa", "error"); }
  }

  const filtered = products.filter((p) => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const mc = !catFilter || p.category === catFilter;
    return ms && mc;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">🛍️ Sản phẩm</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="px-4 py-2 bg-mint text-white rounded-xl text-sm font-bold hover:bg-mint-dark">+ Thêm</Link>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        <input type="text" placeholder="Tìm..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 flex-1 min-w-[200px]" />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2 bg-white border border-border rounded-xl text-sm">
          <option value="">Tất cả</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-text-secondary">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Sản phẩm</th>
              <th className="text-left px-5 py-3 font-medium">Danh mục</th>
              <th className="text-right px-5 py-3 font-medium">Giá</th>

              <th className="text-center px-5 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg overflow-hidden bg-surface flex-shrink-0 relative"><Image src={p.imageUrl} alt={p.name} unoptimized fill className="object-cover" sizes="40px" /></div><span className="font-medium">{p.name}</span></div></td>
                <td className="px-5 py-3 text-text-secondary">{CATEGORIES.find((c) => c.slug === p.category)?.name || p.category}</td>
                <td className="px-5 py-3 text-right font-medium">{formatPrice(p.price)}</td>

                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Link href={`/admin/products/${p.id}`} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100">✏️ Sửa</Link>
                    <button onClick={() => handleDelete(p.id)} className="px-2.5 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-text-secondary text-sm">Không tìm thấy sản phẩm</div>}
      </div>
    </div>
  );
}
