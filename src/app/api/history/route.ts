import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 模拟从数据库获取历史记录数据
        const historyData = [
            {
                id: '1',
                name: '张三',
                studentID: 'ST001',
                date: '2024-01-15',
                status: 'completed',
                documentType: 'PDF'
            },
            {
                id: '2',
                name: '李四',
                studentID: 'ST002',
                date: '2024-01-16',
                status: 'processing',
                documentType: 'DOCX'
            }
        ];

        return NextResponse.json(historyData);
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}