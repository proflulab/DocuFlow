import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { content } = await request.json();
        // Process document generation with content
        const documentBuffer = Buffer.from('document content');
        return new NextResponse(documentBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': 'attachment; filename=document.docx'
            }
        });
    } catch (err) {
        console.error('Document generation error:', err);
        return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
    }
}