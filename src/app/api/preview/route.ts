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
            const fileUrl = new URL(path);
            const timestamp = Date.now().toString();
            fileUrl.searchParams.append('t', timestamp);
            
            const response = await fetch(fileUrl.toString(), {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'If-Modified-Since': '0'
                },
                cache: 'no-store'
            });
            
            if (!response.ok) {
                const errorMessage = `获取文件失败: HTTP ${response.status} - ${response.statusText}`;
                console.error(errorMessage);
                return NextResponse.json({ error: errorMessage }, { status: response.status });
            }

            const buffer = await response.arrayBuffer();

            // 使用mammoth将docx转换为html
            const result = await mammoth.convertToHtml(
                { buffer: Buffer.from(buffer) },
                {
                    styleMap: [
                        "p[style-name='Section Title'] => h1:fresh",
                        "p[style-name='Subsection Title'] => h2:fresh",
                        "p[style-name='Normal'] => p:fresh",
                        "p[style-name='List Paragraph'] => p.list-paragraph:fresh",
                        "table => table.doc-table",
                        "r[style-name='Strong'] => strong:fresh",
                        "r[style-name='Emphasis'] => em:fresh"
                    ],
                    includeDefaultStyleMap: true,
                    ignoreEmptyParagraphs: true
                }
            );
            
            // 添加基础样式
            const styledHtml = `
                <style>
                    .doc-preview {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #000;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .doc-preview h1 { font-size: 24px; margin: 20px 0; color: #000; }
                    .doc-preview h2 { font-size: 20px; margin: 16px 0; color: #000; }
                    .doc-preview p { margin: 12px 0; color: #000; }
                    .doc-preview .list-paragraph { margin-left: 20px; }
                    .doc-preview .doc-table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 16px 0;
                    }
                    .doc-preview .doc-table td, .doc-preview .doc-table th {
                        border: 1px solid #E5E7EB;
                        padding: 12px;
                        color: #374151;
                    }
                    .doc-preview .doc-table th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    .doc-preview [class^='color-'] {
                        color: inherit;
                    }
                    .doc-preview .color-000000 { color: #000; }
                    .doc-preview .color-0000FF { color: #00F; }
                    .doc-preview .color-FF0000 { color: #F00; }
                </style>
                <div class="doc-preview">${result.value}</div>
            `;
            if (result.messages.length > 0) {
                console.warn('转换过程中的警告:', result.messages);
            }

            return NextResponse.json({ html: styledHtml }, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
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