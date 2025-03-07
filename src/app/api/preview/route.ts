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

        // 检查文件扩展名
        const fileExt = path.extname(absolutePath).toLowerCase();
        if (fileExt !== '.docx') {
            return NextResponse.json({ error: 'Invalid file type. Only .docx files are supported' }, { status: 400 });
        }

        const buffer = fs.readFileSync(absolutePath);
        
        // 使用mammoth将.docx文件转换为HTML
        try {
            const result = await mammoth.convertToHtml({ buffer: buffer }, {
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

            if (!result || !result.value) {
                throw new Error('Failed to convert document to HTML');
            }

            return NextResponse.json({ html: result.value });
        } catch (conversionError) {
            console.error('Error converting document:', conversionError);
            return NextResponse.json({ error: 'Failed to convert document to HTML' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error reading file:', error);
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
}