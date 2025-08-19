/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 12:31:18
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-19 14:35:26
 * @FilePath: /next_word_auto/src/app/api/template-fields/route.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { NextResponse } from "next/server";
import { getTemplateFields } from "@/services/docxTemplateService";
import formidable from "formidable";
import { Readable } from "stream";
import fs from "fs";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // 创建一个可读流来模拟 IncomingMessage
        const buffer = await request.arrayBuffer();
        const readable = Readable.from(Buffer.from(buffer));

        // 添加必要的属性来模拟 IncomingMessage
        const mockRequest = Object.assign(readable, {
            headers: Object.fromEntries(request.headers.entries()),
            method: request.method,
            url: request.url,
            httpVersion: '1.1',
            httpVersionMajor: 1,
            httpVersionMinor: 1,
            complete: true,
            connection: null,
            socket: null,
            aborted: false,
        });

        // 使用 formidable 解析表单数据
        const form = formidable({
            multiples: false,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
        });

        const [fields, files] = await form.parse(mockRequest as any);

        // 获取上传的模板文件
        const templateFile = Array.isArray(files.template) ? files.template[0] : files.template;
        if (!templateFile) {
            return NextResponse.json(
                {
                    success: false,
                    error: "缺少模板文件"
                },
                { status: 400 }
            );
        }

        // 读取模板文件内容
        const templateBuffer = await fs.promises.readFile(templateFile.filepath);

        // 解析模板字段
        const templateFields = await getTemplateFields(templateBuffer, 'buffer');

        return NextResponse.json({
            success: true,
            fields: templateFields
        });
    } catch (error) {
        console.error('获取模板字段失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '获取模板字段失败',
                message: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}