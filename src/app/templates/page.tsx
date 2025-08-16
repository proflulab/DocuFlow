/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 03:17:12
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-16 03:25:18
 * @FilePath: /next_word_auto/src/app/templates/page.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */
import Link from "next/link";

export default function TemplatesPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            模板管理功能
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            此功能正在开发中，敬请期待！
          </p>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800">即将推出的功能：</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                自定义文档模板
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                模板预览和编辑
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                模板分类管理
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                模板导入导出
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <Link
              href="/certificate"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              体验证书生成功能
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}