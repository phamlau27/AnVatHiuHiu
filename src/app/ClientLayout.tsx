"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import FloatingContact from "@/components/layout/FloatingContact";
import CartDrawer from "@/components/cart/CartDrawer";
import { ToastProvider } from "@/components/ui/Toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <main className={`flex-1 ${!isAdmin ? "pb-16 md:pb-0" : ""}`}>
        {children}
      </main>
      {!isAdmin && (
        <>
          <BottomNav />
          <FloatingContact />
          <CartDrawer />
        </>
      )}
      <ToastProvider />
    </>
  );
}
