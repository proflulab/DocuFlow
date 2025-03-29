import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { content } = await request.json();
        const pdfContent = content || 'Default PDF content';
        return new NextResponse(Buffer.from(pdfContent), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=document.pdf'
            }
        });
    } catch (err) {
        console.error('PDF generation error:', err);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
