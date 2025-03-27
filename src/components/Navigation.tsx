'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="bg-white shadow-lg mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex space-x-8">
                            <Link 
                                href="/"
                                className={`inline-flex items-center px-1 pt-1 ${
                                    pathname === '/' 
                                        ? 'border-b-2 border-amber-500 text-gray-900' 
                                        : 'text-gray-900 hover:text-gray-500'
                                }`}
                            >
                                首页
                            </Link>
                            <Link 
                                href="/form"
                                className={`inline-flex items-center px-1 pt-1 ${
                                    pathname === '/form' 
                                        ? 'border-b-2 border-amber-500 text-gray-900' 
                                        : 'text-gray-900 hover:text-gray-500'
                                }`}
                            >
                                表单填写
                            </Link>
                            <Link 
                                href="/second"
                                className={`inline-flex items-center px-1 pt-1 ${
                                    pathname === '/second'
                                        ? 'border-b-2 border-amber-500 text-gray-900' 
                                        : 'text-gray-900 hover:text-gray-500'
                                }`}
                            >
                                多维表格导入
                            </Link>
                            <Link 
                                href="/history"
                                className={`inline-flex items-center px-1 pt-1 ${
                                    pathname === '/history'
                                        ? 'border-b-2 border-amber-500 text-gray-900' 
                                        : 'text-gray-900 hover:text-gray-500'
                                }`}
                            >
                                历史记录
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}