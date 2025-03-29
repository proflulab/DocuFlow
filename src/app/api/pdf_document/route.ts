import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // 使用data中的内容生成PDF
        const pdfContent = data.content || 'Default PDF content';
        return new NextResponse(Buffer.from(pdfContent), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=document.pdf'
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
