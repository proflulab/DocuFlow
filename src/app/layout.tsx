/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 04:37:34
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-18 13:31:06
 * @FilePath: /next_word_auto/src/app/layout.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/Navigation";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "文档自动化平台",
  description: "一站式文档生成解决方案，支持证书、通知书等各类文档的自动化生成",
  keywords: "文档生成,证书制作,通知书制作,自动化,PDF,Word",
  authors: [{ name: "杨仕明" }],
  openGraph: {
    title: "文档自动化平台",
    description: "一站式文档生成解决方案",
    type: "website",
    locale: "zh_CN",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} 
        antialiased min-h-screen flex flex-col`}
      >
        <Navigation />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
