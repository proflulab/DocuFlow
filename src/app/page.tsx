/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2024-11-06 15:35:55
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2024-11-06 18:30:46
 * @FilePath: /next_word_auto/src/app/page.tsx
 * @Description: 
 * 
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved. 
 */


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState('');

    const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
    };

    const handleSubmit = () => {
        if (selectedOption === 'form') {
            router.push('/form');
        } else if (selectedOption === 'second') {
            router.push('/second');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <h1 className="text-4xl font-bold mb-8">Welcome to Lulab</h1>
            
            <div className="w-full max-w-md">
                <select
                    value={selectedOption}
                    onChange={handleOptionChange}
                    className="w-full p-2 border rounded mb-4"
                >
                    <option value="">请选择功能</option>
                    <option value="form">表单填写</option>
                    <option value="second">多维表格导入</option>
                </select>

                <button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className={`w-full p-2 rounded ${
                        selectedOption 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    确认
                </button>
            </div>
        </main>
    );
}