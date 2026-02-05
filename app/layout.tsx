// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// [New] PWA Viewport Setting (확대 방지 & 전체화면 최적화)
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 터치 실수로 확대되는 것 방지
};

export const metadata: Metadata = {
  title: "Bamboo Forest",
  description: "Listen to your soul.",
  manifest: "/manifest.json", // [New] 매니페스트 연결
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bamboo Forest",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}