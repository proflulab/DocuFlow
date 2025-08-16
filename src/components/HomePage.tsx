/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 03:15:19
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-16 14:39:21
 * @FilePath: /next_word_auto/src/components/HomePage.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
'use client';

import React from 'react';
import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, href, icon, gradient }) => {
  return (
    <Link href={href} className="block group">
      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-transparent overflow-hidden transform hover:-translate-y-2 h-64 flex flex-col">
        {/* 背景渐变装饰 */}
        <div className={`absolute top-0 right-0 w-20 h-20 ${gradient} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>

        {/* 图标容器 */}
        <div className="relative z-10 flex-1 flex flex-col">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${gradient} rounded-2xl text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
          <p className="text-gray-600 leading-relaxed flex-1">{description}</p>
        </div>

        {/* 悬浮时的箭头指示器 */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default function HomePage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-[calc(100vh-8rem)] relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        {/* 欢迎区域 */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-8 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight">
            文档自动化平台
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            一站式文档生成解决方案，帮助您快速创建各种专业文档和证书
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>快速生成</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>专业模板</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>安全可靠</span>
            </div>
          </div>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            title="自动生成证书"
            description="快速生成录取通知书、培训证书等各类证书文档，支持Word和PDF格式"
            href="/certificate"
            icon="📜"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />

          <FeatureCard
            title="文档模板管理"
            description="管理和自定义各种文档模板，满足不同场景的需求"
            href="/templates"
            icon="📋"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />

          <FeatureCard
            title="批量处理"
            description="支持批量生成文档，提高工作效率，节省时间成本"
            href="/batch"
            icon="⚡"
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
        </div>


      </main>
    </div>
  );
}