/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 03:00:22
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-20 02:21:45
 * @FilePath: /next_word_auto/src/components/ui/FeatureCard.tsx
 * @Description: 功能卡片组件
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { FeatureCardProps } from '@/types';

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
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-2.5 shadow-lg group-hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;