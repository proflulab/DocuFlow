/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 02:17:30
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-20 02:55:05
 * @FilePath: /next_word_auto/src/app/api/templates/cached-preview/route.ts
 * @Description: API endpoint for serving cached template files for preview
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// 本地模板缓存目录
const CACHE_DIR = path.join(process.cwd(), 'templates');
// 模板ID到文件名的映射存储文件
const MAPPING_FILE = path.join(process.cwd(), 'templates', 'template_mappings.json');

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const templateId = searchParams.get('id');

        if (!templateId) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少模板ID参数'
                },
                { status: 400 }
            );
        }

        // 确保模板目录存在
        try {
            await fs.access(CACHE_DIR);
        } catch {
            await fs.mkdir(CACHE_DIR, { recursive: true });
            console.log(`✅ 已创建模板目录: ${CACHE_DIR}`);
        }

        // 读取模板映射信息
        let templateMappings: Record<string, string> = {};
        try {
            const mappingData = await fs.readFile(MAPPING_FILE, 'utf-8');
            templateMappings = JSON.parse(mappingData);
        } catch (error) {
            console.log('模板映射文件不存在或格式错误，将重新创建');
        }

        // 根据模板ID查找对应的文件名
        const templateFileName = templateMappings[templateId];
        console.log("templateId =", templateId);
        console.log(`🔍 查找模板ID ${templateId} 对应的文件名: ${templateFileName}`);
        
        if (!templateFileName) {
            return NextResponse.json(
                {
                    success: false,
                    error: '模板ID不存在或映射信息丢失'
                },
                { status: 404 }
            );
        }

        // 检查文件是否存在
        const templatePath = path.join(CACHE_DIR, templateFileName);
        try {
            await fs.access(templatePath);
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    error: '模板文件不存在'
                },
                { status: 404 }
            );
        }

        // 读取文件内容
        const fileBuffer = await fs.readFile(templatePath);

        // 设置正确的响应头
        const headers = new Headers();
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        headers.set('Content-Disposition', `inline; filename="${templateFileName}"`);
        headers.set('Cache-Control', 'no-cache');

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(fileBuffer);
                controller.close();
            },
        });

        return new NextResponse(stream, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('获取缓存模板预览失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '获取模板预览失败',
                message: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}