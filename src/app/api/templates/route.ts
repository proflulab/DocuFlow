import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
    try {
        // 从 Vercel Blob 获取文件列表
        const { blobs } = await list();

        // 过滤出文档模板文件（.docx 文件）
        const templates = blobs
            .filter(blob => blob.pathname.toLowerCase().endsWith('.docx'))
            .map(blob => ({
                name: blob.pathname.split('/').pop() || blob.pathname, // 获取文件名
                pathname: blob.pathname,
                url: blob.url,
                size: blob.size,
                uploadedAt: blob.uploadedAt
            }));

        return NextResponse.json({
            success: true,
            templates
        });
    } catch (error) {
        console.error('获取模板列表失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '获取模板列表失败',
                message: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}