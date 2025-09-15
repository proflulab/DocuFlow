/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 03:42:36
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-18 12:22:04
 * @FilePath: /next_word_auto/src/app/page.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
'use client';



import FeatureCard from '../components/ui/FeatureCard';

const FEATURES = [
  { label: '动态字段配置', color: 'bg-green-500' },
  { label: '云端模板存储', color: 'bg-blue-500' },
  { label: '类型安全处理', color: 'bg-orange-500' },
  { label: '多格式输出', color: 'bg-orange-500' }
];

const FEATURE_CARDS = [
  {
    title: '动态文档生成器',
    description: '支持动态字段配置和实时表单验证，智能解析模板占位符，自动生成DOCX和PDF格式文档',
    href: '/certificate',
    icon: '🎓',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    title: '模板管理系统',
    description: '基于Vercel Blob的云端存储，支持模板预览和动态加载，智能回退机制确保服务稳定',
    href: '/templates',
    icon: '📁',
    gradient: 'bg-gradient-to-br from-orange-300 to-orange-400'
  },
  {
    title: '批量处理中心',
    description: '支持Excel/CSV数据导入，一次性生成多个文档，实时进度跟踪和结果自动打包下载',
    href: '/batch',
    icon: '⚡',
    gradient: 'bg-gradient-to-br from-green-500 to-green-600'
  }
];

const FeatureBadge = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 ${color} rounded-full`} />
    <span>{label}</span>
  </div>
);

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-[calc(100vh-4rem)] relative overflow-hidden transition-colors duration-300">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        {/* 欢迎区域 */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 via-red-300 to-orange-400 rounded-3xl mb-8 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-500 bg-clip-text text-transparent mb-6 leading-tight">
            DocuFlow 文档自动化平台
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            基于 Next.js 14 构建的现代化文档生成解决方案，支持智能证书生成、模板管理和批量处理
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            {FEATURES.map(({ label, color }) => (
              <FeatureBadge key={label} label={label} color={color} />
            ))}
          </div>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {FEATURE_CARDS.map((card) => (
            <FeatureCard key={card.href} {...card} />
          ))}
        </div>
      </main>
    </div>
  );
}