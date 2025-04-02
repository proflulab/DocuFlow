import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new NextResponse(JSON.stringify({ error: '未找到上传的文件' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 检查文件类型
        if (!file.name.endsWith('.docx')) {
            return new NextResponse(JSON.stringify({ error: '只支持 .docx 格式的文件' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 将文件保存到 public/word 目录
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 确保文件名唯一
        const fileName = file.name;
        const filePath = path.join(process.cwd(), 'public', 'word', fileName);

        await writeFile(filePath, buffer);

        return new NextResponse(JSON.stringify({ message: '文件上传成功' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('文件上传失败:', error);
        return new NextResponse(JSON.stringify({ error: '文件上传失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}