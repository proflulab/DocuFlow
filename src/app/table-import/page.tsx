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
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
            <div className="w-full max-w-md space-y-6">
                <h1 className="text-3xl font-bold text-center mb-8">多维表格导入</h1>
                <div className="space-y-4">
                    {/* 表格导入功能将在这里实现 */}
                    <button
                        onClick={() => router.push('/menu')}
                        className="w-full py-3 px-6 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        返回菜单
                    </button>
                </div>
            </div>
        </main>
    );
}