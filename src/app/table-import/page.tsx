'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TableImportPage() {
    const [searchId, setSearchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setData(null);
        try {       
            const response = await fetch('/api/feishu', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API请求失败: ${errorData.error?.message || '未知错误'}`);
            }
            const responseData = await response.json();
            if (responseData.error) {
                throw new Error(responseData.error);
            }
            
            let found = false;
            if (searchId.trim()) {
                // 检查API返回的数据结构
                if (!responseData.data || !responseData.data.items || !Array.isArray(responseData.data.items)) {
                    throw new Error('API返回的数据结构无效');
                }
                
                // 调试输出
                console.log('搜索ID:', searchId);
                console.log('所有记录ID:', 
                    responseData.data.items.map((item: { fields?: { '记录 ID'?: Array<{ text?: string }> } }) => item.fields?.['记录 ID']?.[0]?.text)
                );
            
                // 标准化比较
                found = responseData.data.items.some((item: { fields?: { '记录 ID'?: Array<{ text?: string }> } }) => {
                    const recordId = item.fields?.['记录 ID']?.[0]?.text?.trim().toLowerCase();
                    const isMatch = recordId === searchId.trim().toLowerCase();
                    console.log(`比较: ${recordId} === ${searchId.trim().toLowerCase()} -> ${isMatch}`);
                    return isMatch;
                });
            
                if (!found) {
                    throw new Error(`未找到ID为 "${searchId}" 的记录。可用ID: ${
                        responseData.data.items.map((item: { fields?: { '记录 ID'?: Array<{ text?: string }> } }) => item.fields?.['记录 ID']?.[0]?.text).filter(Boolean).join(', ')
                    }`);
                }
            } else {
                found = true; // 允许空搜索
            }
            
            setData(responseData);
            setError('数据获取成功');

        } catch (err: any) {
            setError(`搜索失败: ${err.message}`);
            setData(null);
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
                    {error && <div className={error === '数据获取成功' ? 'text-green-500 text-center' : 'text-red-500 text-center'}>{error}</div>}
                    {data && (
  <div className="p-4 bg-white rounded-lg shadow">
    <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
)}
                </div>
            </div>
        </main>
    );
}