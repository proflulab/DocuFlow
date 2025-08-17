/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 04:37:34
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-17 00:40:20
 * @FilePath: /next_word_auto/src/app/layout.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "../components/Navigation";
import { App } from 'antd';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "文档自动化平台",
  description: "一站式文档生成解决方案，支持证书、通知书等各类文档的自动化生成",
  // 新增：更完整的SEO元数据
  keywords: "文档生成,证书制作,自动化,PDF,Word",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <App>
          <Navigation />
          <div className="flex-1">
            {children}
          </div>
          <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p>&copy; 2024 文档自动化平台. 保留所有权利.</p>
            </div>
          </footer>
        </App>
      </body>
    </html>
  );
}
