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

import Navigation from '@/components/Navigation';
import HomeContent from '@/components/homeContent';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation />
            <div className="container mx-auto px-4 py-8">
                <HomeContent />
            </div>
        </div>
    );
}
