/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 02:17:30
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-20 02:55:05
 * @FilePath: /next_word_auto/src/app/api/templates/route.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

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
                uploadedAt: blob.uploadedAt,
                downloadUrl: blob.downloadUrl,
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