import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('path');

        if (!filePath) {
            return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
        }

        const absolutePath = path.join(process.cwd(), 'public', filePath);

        // 检查文件是否存在于public目录下
        if (!absolutePath.startsWith(path.join(process.cwd(), 'public'))) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
        }

        if (!fs.existsSync(absolutePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const buffer = fs.readFileSync(absolutePath);
        
        // 使用mammoth将.docx文件转换为HTML
        const result = await mammoth.convertToHtml({ buffer }, {
            transformDocument: (element) => {
                if (element.type === "table") {
                    element.styleId = "TableGrid";
                }
                return element;
            },
            styleMap: [
                "p[style-name='Normal'] => p:fresh",
                "table => table.table.table-bordered",
                "tr => tr",
                "td => td"
            ]
        });
        return NextResponse.json({ html: result.value });
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
}