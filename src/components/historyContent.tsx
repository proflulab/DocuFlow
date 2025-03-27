'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryContent() {
    const router = useRouter();
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHistoryData();
    }, []);

    const fetchHistoryData = async () => {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            setHistoryData(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">历史记录</h1>
            <div className="grid gap-4">
                {historyData.length > 0 ? (
                    historyData.map((item: any, index: number) => (
                        <div key={index} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{item.studentID}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {item.status === 'completed' ? '已完成' : '处理中'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p className="font-medium">生成日期</p>
                                    <p>{new Date(item.date).toLocaleDateString('zh-CN')}</p>
                                </div>
                                <div>
                                    <p className="font-medium">文档类型</p>
                                    <p>{item.documentType}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-4">
                                <button 
                                    onClick={() => router.push(`/form?id=${item.id}`)}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                >
                                    查看详情
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        暂无历史记录
                    </div>
                )}
            </div>
        </main>
    );
}