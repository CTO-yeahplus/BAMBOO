// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter, Noto_Serif_KR } from "next/font/google"; // 폰트는 쓰시던 것 유지
import "./globals.css";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// [1] 뷰포트 설정 (모바일 최적화)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 핀치 줌 방지 (앱 같은 느낌)
  themeColor: "#050505",
};

// [2] 메타데이터 (SEO & OG 태그)
export const metadata: Metadata = {
  metadataBase: new URL('https://bamboo-forest.vercel.app'),
  title: "Bamboo Forest | 마음의 쉼터",
  description: "지친 당신을 위한 AI 대나무 숲. 정령과 대화하며 마음을 치유하세요.",
  manifest: "/manifest.json", // PWA 연결
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png", // 아이폰용
  },
  openGraph: {
    title: "대나무 숲에 오신 것을 환영합니다",
    description: "아무도 모르는 깊은 숲속, 당신의 이야기를 들어줄 정령이 기다립니다.",
    url: "https://bamboo-forest.vercel.app", // 배포된 실제 URL
    siteName: "Bamboo Forest",
    images: [
      {
        url: "/images/og-image.png", // 카톡 공유 이미지
        width: 1200,
        height: 630,
        alt: "Mystical Bamboo Forest",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bamboo Forest | 마음의 쉼터",
    description: "정령과의 대화로 오늘 하루를 위로받으세요.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BambooForest",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {/* 👇 포트원 SDK 추가 (jQuery 필요 없음) */}
        <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}