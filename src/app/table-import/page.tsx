'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TableImportPage() {
    const router = useRouter();

    useEffect(() => {
        // 检查用户是否已通过密码验证
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (isAuthenticated !== 'true') {
            router.push('/password');
        }
    }, [router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100 relative">
            <button
                onClick={() => router.push('/menu')}
                className="absolute top-8 left-8 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
            </button>
            <div className="w-full max-w-md space-y-6">
                <h1 className="text-3xl font-bold text-center mb-8">多维表格导入</h1>
                <div className="space-y-4">
                    {/* 表格导入功能将在这里实现 */}
                </div>
            </div>
        </main>
    );
}