/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-18 13:42:02
 * @FilePath: /next_word_auto/src/app/loading.tsx
 * @Description: App Router 通用等待组件
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

'use client';

import React from 'react';

/**
 * App Router 通用等待组件
 * 当路由切换时自动显示此组件
 */
const AppLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center justify-center space-y-6 p-8">
        {/* 主要加载动画 */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 dark:border-r-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>

        {/* 加载文本 */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            正在加载页面
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            请稍候，正在为您准备内容...
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
        </div>

        {/* 装饰性元素 */}
        <div className="flex space-x-2 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AppLoading;