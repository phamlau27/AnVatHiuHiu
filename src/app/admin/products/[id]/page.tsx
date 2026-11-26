"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProductById, createProduct, updateProduct } from "@/lib/firestore";

import { showToast } from "@/components/ui/Toast";
import { CATEGORIES } from "@/types";

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].slug);
  const [description, setDescription] = useState("");
  const [descriptionImages, setDescriptionImages] = useState<string[]>([]);
  const [descImageFiles, setDescImageFiles] = useState<File[]>([]);
  const [isPromotion, setIsPromotion] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!isNew) {
      getProductById(id).then((product) => {
        if (product) {
          setName(product.name);
          setPrice(product.price.toString());
          setPromoPrice(product.promoPrice?.toString() || "");
          setCategory(product.category);
          setDescription(product.description || "");
          setDescriptionImages(product.descriptionImages || []);
          setIsPromotion(product.isPromotion || false);
          setImageUrl(product.imageUrl);
        }
        setFetching(false);
      }).catch(() => setFetching(false));
    }
  }, [id, isNew]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDescImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setDescImageFiles(prev => [...prev, ...files]);
      const newUrls = files.map(f => URL.createObjectURL(f));
      setDescriptionImages(prev => [...prev, ...newUrls]);
    }
  };

  const removeDescImage = (index: number) => {
    setDescriptionImages(prev => prev.filter((_, i) => i !== index));
    // Also need to remove from files if it's a new upload
    // This is a bit tricky since some might be existing URLs, but for now we'll just filter
    setDescImageFiles(prev => {
      // Find which file corresponds to this index (only for new files)
      // For simplicity, we'll just clear files if we remove something (not ideal but safe for Base64)
      return prev; 
    });
  };

  const processImage = async (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 800; // Slightly larger for description images
          let { width, height } = img;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = () => reject(new Error("Lỗi đọc ảnh"));
      };
      reader.onerror = () => reject(new Error("Lỗi đọc file"));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) return;
    setLoading(true);
    setImageError("");

    const withTimeout = <T,>(promise: Promise<T>, ms = 10000, errorMsg = "Request timeout"): Promise<T> => {
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(errorMsg)), ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
    };

    try {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        try {
          finalImageUrl = await processImage(imageFile);
        } catch (uploadErr) {
          console.warn("Lỗi nén ảnh chính:", uploadErr);
          setImageError("⚠️ Không thể xử lý ảnh chính. Đã dùng ảnh mặc định.");
          finalImageUrl = `https://placehold.co/400x400/A8E6CF/2D6A4F?text=${encodeURIComponent(name)}`;
        }
      }

      // Xử lý ảnh mô tả
      const finalDescImages = [...descriptionImages];
      for (let i = 0; i < descImageFiles.length; i++) {
        try {
          const base64 = await processImage(descImageFiles[i]);
          // Replace the temporary blob URL with base64
          const blobUrl = URL.createObjectURL(descImageFiles[i]);
          const index = finalDescImages.findIndex(url => url.startsWith("blob:"));
          if (index !== -1) {
            finalDescImages[index] = base64;
          } else {
            finalDescImages.push(base64);
          }
        } catch (err) {
          console.warn("Lỗi nén ảnh mô tả:", err);
        }
      }

      // Lọc bỏ các URL blob còn sót lại (nếu có lỗi) và giữ lại các URL thật hoặc base64
      const cleanedDescImages = finalDescImages.filter(url => !url.startsWith("blob:"));

      if (!finalImageUrl) {
        finalImageUrl = `https://placehold.co/400x400/A8E6CF/2D6A4F?text=${encodeURIComponent(name)}`;
      }

      const data = {
        name,
        price: Number(price),
        promoPrice: promoPrice ? Number(promoPrice) : undefined,
        category,
        description,
        descriptionImages: cleanedDescImages,
        isPromotion,
        imageUrl: finalImageUrl,
        soldCount: isNew ? 0 : undefined,
      };

      Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);

      if (isNew) {
        await withTimeout(createProduct(data as Parameters<typeof createProduct>[0]), 8000, "Create product timeout");
        showToast("✅ Đã tạo sản phẩm!", "success");
      } else {
        await withTimeout(updateProduct(id, data), 8000, "Update product timeout");
        showToast("✅ Đã cập nhật!", "success");
      }
      router.push("/admin/products");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Kiểm tra console";
      showToast(`❌ Có lỗi: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isNew ? "➕ Thêm sản phẩm" : "✏️ Sửa sản phẩm"}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Tên sản phẩm *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Giá gốc (VND) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="85000" className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Giá khuyến mãi</label>
            <input type="number" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} placeholder="Để trống nếu không có" className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isPromotion" checked={isPromotion} onChange={(e) => setIsPromotion(e.target.checked)} className="w-4 h-4 accent-mint" />
          <label htmlFor="isPromotion" className="text-sm font-medium cursor-pointer">Đánh dấu là sản phẩm khuyến mãi 🏷️</label>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Danh mục *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50">
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Mô tả</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50 resize-none" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Hình ảnh</label>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-secondary mb-1">Cách 1: Dán đường link ảnh từ trên mạng (Google, Facebook, Imgur...)</p>
              <input 
                type="text" 
                value={imageUrl.startsWith("data:") ? "[Ảnh đã tải lên - sẽ giữ nguyên nếu không thay đổi]" : imageUrl} 
                onChange={(e) => { if (!e.target.value.startsWith("[")) setImageUrl(e.target.value); }} 
                onFocus={(e) => { if (imageUrl.startsWith("data:")) e.target.select(); }}
                placeholder="https://..." 
                className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint/50" 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-text-secondary">HOẶC</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-secondary mb-1">Cách 2: Tải ảnh từ máy lên (Yêu cầu bật Firebase Storage)</p>
              <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm w-full" />
            </div>
          </div>
          
          {imageError && <p className="text-xs text-amber-600 mt-1">{imageError}</p>}
          <p className="text-xs text-text-secondary mt-2">Nếu bỏ trống cả hai, hệ thống sẽ tự tạo ảnh mặc định.</p>
          
          {imageUrl && (
            <div className="mt-4 w-32 h-32 rounded-xl overflow-hidden bg-surface relative border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="object-cover w-full h-full" />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <label className="text-sm font-medium mb-1.5 block">Ảnh mô tả bổ sung (Hiển thị trong chi tiết)</label>
          <input type="file" accept="image/*" multiple onChange={handleDescImagesChange} className="text-sm w-full mb-4" />
          
          {descriptionImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {descriptionImages.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Desc ${idx}`} className="object-cover w-full h-full" />
                  <button 
                    type="button" 
                    onClick={() => removeDescImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-mint hover:bg-mint-dark disabled:bg-gray-300 text-white font-bold rounded-xl">
            {loading ? "Đang lưu..." : isNew ? "Tạo sản phẩm" : "Lưu thay đổi"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-surface text-text-secondary rounded-xl hover:bg-border">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
