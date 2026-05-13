import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ăn Vặt Híu Híu",
  description:
    "Đặt đồ ăn vặt online nhanh chóng. Khô bò, hạt dinh dưỡng, bánh snack, trái cây sấy, kẹo thạch và nhiều hơn nữa!",
  icons: {
    icon: "/favicon-rounded.png?v=5",
  },
  keywords: [
    "ăn vặt",
    "đồ ăn vặt",
    "snack",
    "mua online",
    "giao hàng",
    "Tân Phú",
    "TP.HCM",
  ],
  openGraph: {
    title: "Ăn Vặt Híu Híu",
    description: "Đặt đồ ăn vặt online nhanh chóng tại TP.HCM",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
