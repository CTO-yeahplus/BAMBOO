import type { Metadata } from "next";
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

export const metadata = {
  title: 'Bamboo Forest',
  description: 'A safe place for your voice.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0', // 줌 방지
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent', // 상태바를 투명하게
    title: 'Bamboo Forest',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
