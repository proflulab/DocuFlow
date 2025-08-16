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
        return '证书生成';
      case '/templates':
        return '模板管理';
      case '/batch':
        return '批量处理';
      default:
        return null;
    }
  };

  const pageTitle = getPageTitle();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              文档自动化平台
            </Link>
            {showBreadcrumb && pageTitle && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{pageTitle}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {pathname !== '/' && (
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                返回首页
              </Link>
            )}
            <span className="text-gray-600">欢迎使用</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;