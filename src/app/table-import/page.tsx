'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TableImportPage() {
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/feishu?searchId=${searchId}`);
if (!response.ok) {
    throw new Error('API请求失败');
}
const data = await response.json();
if (data.error) {
    throw new Error(data.error);
}
localStorage.setItem(`cache_${searchId}`, JSON.stringify(data));
const cachedData = JSON.parse(localStorage.getItem(`cache_${searchId}`) || '{}');
if (Object.keys(cachedData).length === 0) {
    throw new Error('缓存读取失败');
}
        } catch (err) {
            setError('搜索失败，请重试');
        } finally {
            setLoading(false);
        }
    };
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
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="输入ID进行搜索"
                            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            搜索
                        </button>
                    </div>
                    {loading && <div className="text-center">加载中...</div>}
                    {error && <div className="text-red-500 text-center">{error}</div>}
                    {/* 表格导入功能将在这里实现 */}
                </div>
            </div>
        </main>
    );
}