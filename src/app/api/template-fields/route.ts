/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-16 12:31:18
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-16 13:52:02
 * @FilePath: /next_word_auto/src/app/api/template-fields/route.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { NextResponse } from "next/server";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import path from "path";
import fs from "fs";
import { getTemplateFromBlob } from "@/utils/blob";

// 获取模板字段的函数
async function getTemplateFields(templateSource: 'local' | 'cloud' = 'local', templateName?: string): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const InspectModule = require("docxtemplater/js/inspect-module");
    const iModule = InspectModule();
    let content: string;

    if (templateSource === 'cloud' && templateName) {
        const templateBuffer = await getTemplateFromBlob(templateName);
        content = templateBuffer.toString('binary');
    } else {
        const filePath = path.join(process.cwd(), "public", "word", "Lulab_invioce.docx");
        content = fs.readFileSync(filePath, "binary");
    }

    const zip = new PizZip(content);

    // 只解析，不渲染
    new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        modules: [iModule],        // 挂载模块
    });

    // 拿到所有占位符（字段名）
    const tagsObj = iModule.getAllTags(); // { first_name: null, last_name: null, ... }
    const fieldNames = Object.keys(tagsObj);
    console.log("模板字段：", fieldNames);

    // 提取所有占位符
    return fieldNames
}

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const url = new URL(request.url);
        const templateSource = url.searchParams.get('source') as 'local' | 'cloud' || 'local';
        const templateName = url.searchParams.get('template');

        const fields = await getTemplateFields(templateSource, templateName || undefined);

        return NextResponse.json({
            success: true,
            fields
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