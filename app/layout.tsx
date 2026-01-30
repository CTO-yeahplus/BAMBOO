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

// 1. [New] 뷰포트 설정 (확대 방지 & 전체화면 & 노치 대응)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 손가락으로 확대 불가능하게 (앱처럼)
  themeColor: "#000000",
  viewportFit: "cover", // 아이폰 노치 영역까지 배경 채우기
};

// 2. [New] 메타데이터 (PWA 설정)
export const metadata: Metadata = {
  title: "Bamboo Forest",
  description: "A shelter for your soul.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // 상단 상태바를 투명하게
    title: "Bamboo Forest",
  },
  icons: {
    icon: "/images/spirit_final.png",
    apple: "/images/spirit_final.png", // 아이폰 홈 화면 아이콘
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-black text-white overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}