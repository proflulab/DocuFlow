import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // 处理文档生成逻辑
        // 返回生成的文档
        return new NextResponse(Buffer.from('document content'), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': 'attachment; filename=document.docx'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
    }
}