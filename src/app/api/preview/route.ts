import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        if (!path) {
            return NextResponse.json({ error: '未指定预览文件路径' }, { status: 400 });
        }

        // 验证文件路径
        try {
            new URL(path);
        } catch {
            return NextResponse.json({ error: '无效的文件路径' }, { status: 400 });
        }

        try {
            // 获取文件内容
            console.log('正在获取文件:', path);
            const response = await fetch(path);
            
            if (!response.ok) {
                const errorMessage = `获取文件失败: HTTP ${response.status} - ${response.statusText}`;
                console.error(errorMessage);
                return NextResponse.json({ error: errorMessage }, { status: response.status });
            }

            const buffer = await response.arrayBuffer();
            console.log('文件获取成功，开始转换');

            // 使用mammoth将docx转换为html
            const result = await mammoth.convertToHtml(
                { buffer: Buffer.from(buffer) },
                {
                    styleMap: [
                        "p[style-name='Section Title'] => h1:fresh",
                        "p[style-name='Subsection Title'] => h2:fresh"
                    ],
                    includeDefaultStyleMap: true
                }
            );
            console.log('文件转换完成');

            if (result.messages.length > 0) {
                console.warn('转换过程中的警告:', result.messages);
            }

            return NextResponse.json({ html: result.value });
        } catch (fetchError) {
            console.error('获取或转换文件失败:', fetchError);
            const errorMessage = fetchError instanceof Error ? fetchError.message : '获取或转换文件失败';
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
    } catch (error) {
        console.error('预览文件时发生错误:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '预览文件时发生错误' },
            { status: 500 }
        );
    }
}