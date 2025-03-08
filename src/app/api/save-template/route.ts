import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import HTMLToDocx from 'html-to-docx';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { path: templatePath, content } = await request.json();

        if (!templatePath || !content) {
            return new NextResponse(JSON.stringify({ error: '缺少必要参数' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 构建完整的文件路径
        const absolutePath = path.join(process.cwd(), 'public', templatePath);

        // 验证文件路径是否在允许的目录内
        if (!absolutePath.startsWith(path.join(process.cwd(), 'public'))) {
            return new NextResponse(JSON.stringify({ error: '无效的文件路径' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 将HTML内容转换为Word文档
        const docxBuffer = await HTMLToDocx(content, null, {
            table: { row: { cantSplit: true } },
            footer: false,
            pageNumber: false,
        });

        // 保存文件
        await fs.writeFile(absolutePath, docxBuffer);

        return new NextResponse(JSON.stringify({ message: '保存成功' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('保存模板失败:', error);
        return new NextResponse(JSON.stringify({ error: '保存模板失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}