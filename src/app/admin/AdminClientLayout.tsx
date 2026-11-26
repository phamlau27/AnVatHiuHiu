"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: "📊" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "📦" },
  { href: "/admin/products", label: "Sản phẩm", icon: "🛍️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // chỉ chạy 1 lần khi mount

  useEffect(() => {
    if (!loading && !authenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [loading, authenticated, pathname, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    setAuthenticated(false);
    router.push("/admin/login");
  };

  // Don't wrap login page with admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-mint border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col fixed h-full z-40 hidden lg:flex">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-sm p-1 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar.png" alt="Avatar" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold gradient-text text-lg">Ăn Vặt Hai Híu</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-mint/15 text-mint-dark"
                    : "text-text-secondary hover:bg-surface"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-surface transition-colors"
          >
            <span>🌐</span>
            <span>Xem cửa hàng</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-border px-4 h-14 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-border shadow-sm p-0.5 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/avatar.png" alt="Avatar" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold gradient-text text-sm">Ăn Vặt Hai Híu</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg text-sm ${
                  isActive ? "bg-mint/15" : "hover:bg-surface"
                }`}
              >
                {item.icon}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-sm hover:bg-red-50"
          >
            🚪
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
