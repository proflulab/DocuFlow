'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
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
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">功能菜单</h1>
                <div className="space-y-4">
                    <button
                        onClick={() => router.push('/form')}
                        className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        表单填写
                    </button>
                    <button
                        onClick={() => router.push('/second')}
                        className="w-full py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        多维表格导入
                    </button>
                    <button
                        onClick={() => router.push('/template-management')}
                        className="w-full py-3 px-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        模板管理
                    </button>
                    <button
                        onClick={() => router.push('/history')}
                        className="w-full py-3 px-6 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        历史记录
                    </button>
                </div>
            </div>
        </main>
    );
}
