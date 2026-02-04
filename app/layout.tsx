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

// [Design] 뷰포트 설정: 사용자가 숲을 손으로 만지작거려도(Zoom) 깨지지 않게 고정합니다.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover", // 노치(Notch) 영역까지 숲을 확장합니다.
};

// [Design] 메타데이터: 홈 화면에 추가되었을 때 '앱'처럼 보이게 합니다.
export const metadata: Metadata = {
  title: "Bamboo Forest",
  description: "A shelter for your soul.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // 상단 상태바를 숲과 하나되게 투명하게 만듭니다.
    title: "Forest",
  },
  formatDetection: {
    telephone: false, // 전화번호 자동 링크 방지 (몰입 방해 요소 제거)
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
      <body className="antialiased bg-black text-white overflow-hidden select-none overscroll-none">
        {children}
      </body>
    </html>
  );
}