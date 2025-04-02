import { NextResponse } from 'next/server';
import HTMLToDocx from 'html-to-docx';
import { put, list, del } from '@vercel/blob';

const token = process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { path, content } = await request.json();

        if (!path || !content) {
            return new NextResponse(JSON.stringify({ error: '缺少必要参数' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 获取文件名并移除后缀
        const fileName = path.split('/').pop();
        const fileNameWithoutSuffix = fileName?.replace(/-\w+\.docx$/, '.docx'); // 移除动态部分
        const relativePath = `templates/${fileNameWithoutSuffix}`;

        try {
            // 获取当前文件列表
            const { blobs } = await list({ token });

            // 匹配文件路径
            const existingFile = blobs.find(blob => blob.pathname === relativePath);

            // 如果找到现有文件，先删除
            if (existingFile) {
                try {
                    await del(existingFile.url, { token }); // 使用 existingFile.url
                } catch (delError) {
                    console.error('删除原文件失败:', delError);
                    return new NextResponse(JSON.stringify({ error: '删除原文件失败' }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            }

            // 将HTML内容转换为DOCX格式
            const docxBuffer = await HTMLToDocx(content, null, {
                table: { row: { cantSplit: true } },
                footer: false,
                pageNumber: false
            });

            // 上传新文件（禁用随机后缀）
            const { url: newUrl } = await put(relativePath, docxBuffer, {
                access: 'public',
                token,
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                addRandomSuffix: false, // 禁用随机后缀
            });

            // 添加短暂延迟以确保文件完全写入
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 重新获取文件列表以确保数据最新
            const { blobs: updatedBlobs } = await list({ token });
            const updatedFile = updatedBlobs.find(blob => blob.pathname === relativePath);
            
            return new NextResponse(JSON.stringify({ 
                message: '保存成功', 
                url: newUrl,
                updatedFile: updatedFile
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error: unknown) {
            console.error('文件操作失败:', error);
            return new NextResponse(JSON.stringify({ error: `文件操作失败: ${error instanceof Error ? error.message : '未知错误'}` }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error: unknown) {
        console.error('保存模板失败:', error);
        return new NextResponse(JSON.stringify({ error: `保存模板失败: ${error instanceof Error ? error.message : '未知错误'}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}