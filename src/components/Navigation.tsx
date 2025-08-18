/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-17 23:48:01
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-18 03:48:36
 * @FilePath: /next_word_auto/src/components/Navigation.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  showBreadcrumb?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ showBreadcrumb = true }) => {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/certificate':
        return '智能证书生成器';
      case '/templates':
        return '模板管理系统';
      case '/batch':
        return '批量处理中心';
      default:
        return null;
    }
  };

  const pageTitle = getPageTitle();

  return (
    <nav className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 shadow-lg border-b border-gray-200 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-300 hover:scale-105 cursor-pointer">
                DocuFlow
              </span>
            </Link>
            {showBreadcrumb && pageTitle && (
              <>
                <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full transition-all duration-300 hover:scale-110"></div>
                  <span className="text-gray-700 font-medium">{pageTitle}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {pathname !== '/' && (
              <Link
                href="/"
                className="group flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/50 hover:bg-white/80 text-gray-600 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200/50"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">首页</span>
              </Link>
            )}

            {/* GitHub 链接 */}
            <a
              href="https://github.com/proflulab/DocuFlow.git"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/50 hover:bg-white/80 text-gray-600 hover:text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200/50"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-medium">GitHub</span>
            </a>

            {/* 状态信息 */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium text-sm">服务运行中</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;