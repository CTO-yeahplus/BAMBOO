// next.config.ts

// 👇 [Fix 1] NextConfig 타입 임포트 추가
import type { NextConfig } from "next"; 
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

// 👇 [Fix 2] 변수 옆에 ': NextConfig' 타입 지정
const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // (기타 imgur 등 다른 도메인이 있다면 여기에 추가)
    ],
  },
};

export default withPWA(nextConfig);