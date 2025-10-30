/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2025-08-18 02:17:07
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2025-08-19 19:09:58
 * @FilePath: /next_word_auto/src/app/api/document/route.ts
 * @Description: 
 * 
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved. 
 */

import { NextRequest, NextResponse } from "next/server";
import { convertDocxToPdf } from "@/services/pdfConverter";
import { convertDocxToImage } from "@/services/imageConverter";
import { generateDocxBuffer, type DocumentData } from "@/services/docxTemplateService";
import formidable from "formidable";
import { Readable } from "stream";
import fs from "fs";

// APYHub API 配置
const APYHUB_API_TOKEN = "APY086wFzCUtVkJ9WIPcg8jHo6YCPVZoYJWwyoD4WfQogGyfwR7xJftLFKbvTWrx";
const APYHUB_API_URL = "https://api.apyhub.com/convert/word-file/pdf-file";

// 使用 APYHub API 转换 DOCX 到 PDF
async function convertDocxToPdfWithAPYHub(docBuffer: Buffer): Promise<Buffer> {
    try {
        console.log('🚀 [APYHub] 开始 APYHub PDF 转换，文档大小:', docBuffer.length, 'bytes');
        console.log('🚀 [APYHub] API Token:', APYHUB_API_TOKEN ? '已配置' : '未配置');
        console.log('🚀 [APYHub] API URL:', APYHUB_API_URL);
        
        const formData = new FormData();
        
        // 创建 Blob 对象并添加到 FormData
        const blob = new Blob([new Uint8Array(docBuffer)], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        formData.append('file', blob, 'document.docx');

        console.log('🚀 [APYHub] 发送请求到 APYHub API...');
        const response = await fetch(`${APYHUB_API_URL}?output=converted.pdf&landscape=false`, {
            method: 'POST',
            headers: {
                'apy-token': APYHUB_API_TOKEN,
            },
            body: formData,
        });

        console.log('🚀 [APYHub] API 响应状态:', response.status, response.statusText);
        console.log('🚀 [APYHub] 响应头:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🚀 [APYHub] API 错误响应:', errorText);
            throw new Error(`APYHub API 请求失败: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // 检查响应内容类型
        const contentType = response.headers.get('content-type');
        console.log('🚀 [APYHub] 响应内容类型:', contentType);
        
        if (!contentType || !contentType.includes('application/pdf')) {
            console.warn('🚀 [APYHub] 警告：响应内容类型不是 PDF:', contentType);
        }

        const pdfBuffer = await response.arrayBuffer();
        console.log('🚀 [APYHub] 接收到 PDF 数据，大小:', pdfBuffer.byteLength, 'bytes');
        
        // 验证 PDF 文件头
        const buffer = Buffer.from(pdfBuffer);
        const pdfHeader = buffer.subarray(0, 4).toString();
        console.log('🚀 [APYHub] PDF 文件头:', pdfHeader);
        
        if (!pdfHeader.startsWith('%PDF')) {
            console.error('🚀 [APYHub] 错误：返回的数据不是有效的 PDF 文件');
            console.log('🚀 [APYHub] 前 100 字节:', buffer.subarray(0, 100).toString());
            throw new Error('APYHub API 返回的不是有效的 PDF 文件');
        }

        console.log('🚀 [APYHub] PDF 转换成功完成！');
        return buffer;
    } catch (error) {
        console.error('🚀 [APYHub] PDF 转换失败:', error);
        throw new Error(`APYHub PDF 转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
}

// 定义支持的格式类型
type SupportedFormat = 'docx' | 'pdf' | 'png' | 'jpg' | 'jpeg';

// 格式处理器接口
interface FormatHandler {
    contentType: string;
    fileExtension: string;
    process: (docBuffer: Buffer) => Promise<Buffer>;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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
        }) as unknown as import('http').IncomingMessage;

        // 使用 formidable 解析表单数据
        const form = formidable({
            multiples: false,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
        });

        const [fields, files] = await form.parse(mockRequest);

        // 从 URL 查询参数获取 format 参数，默认为 docx
        const url = new URL(request.url);
        const format = url.searchParams.get('format') || 'docx';
        console.log('🔍 [DEBUG] 接收到的 format 参数:', format);

        // 获取 data 参数并解析为 JSON
        const dataString = Array.isArray(fields.data) ? fields.data[0] : fields.data;

        if (!dataString) {
            return new NextResponse(JSON.stringify({ error: "缺少 data 参数" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        let data: DocumentData;
        try {
            data = JSON.parse(dataString);
        } catch {
            return new NextResponse(JSON.stringify({ error: "data 参数格式错误，必须是有效的 JSON" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const templateSource = Array.isArray(fields.templateSource) ? fields.templateSource[0] : fields.templateSource || 'upload';
        // const templateId = Array.isArray(fields.templateId) ? fields.templateId[0] : fields.templateId;

        let templateBuffer: Buffer;

        if (templateSource === 'local') {
            const templateFile = Array.isArray(files.templateFile) ? files.templateFile[0] : files.templateFile;
            if (!templateFile) {
                return new NextResponse(JSON.stringify({ error: "缺少本地模板文件" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
            templateBuffer = await fs.promises.readFile(templateFile.filepath);
        } else {
            const templateFile = Array.isArray(files.template) ? files.template[0] : files.template;
            if (!templateFile) {
                return new NextResponse(JSON.stringify({ error: "缺少模板文件" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
            templateBuffer = await fs.promises.readFile(templateFile.filepath);
        }

        // 生成DOCX文档
        const docBuffer = await generateDocxBuffer(data, templateBuffer, 'buffer');

        // 使用格式处理器处理不同的输出格式
        const normalizedFormat = format.toLowerCase() as SupportedFormat;

        // 检查是否支持该格式
        if (!formatHandlers[normalizedFormat]) {
            return new NextResponse(
                JSON.stringify({
                    error: `不支持的格式: ${format}`,
                    supportedFormats: Object.keys(formatHandlers)
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const handler = formatHandlers[normalizedFormat];

        try {
            console.log(`开始处理 ${format.toUpperCase()} 格式转换...`);
            
            // 使用对应的处理器处理文档
            const processedBuffer = await handler.process(docBuffer);

            console.log(`${format.toUpperCase()} 转换成功，输出文件大小:`, processedBuffer.length, 'bytes');

            // 对于 PDF 格式，额外验证文件完整性
            if (normalizedFormat === 'pdf') {
                const pdfHeader = processedBuffer.subarray(0, 4).toString();
                if (!pdfHeader.startsWith('%PDF')) {
                    console.error('错误：生成的 PDF 文件头无效:', pdfHeader);
                    throw new Error('生成的 PDF 文件无效');
                }
                console.log('PDF 文件验证通过，文件头:', pdfHeader);
            }

            return new NextResponse(new Uint8Array(processedBuffer), {
                headers: {
                    "Content-Type": handler.contentType,
                    "Content-Disposition": `attachment; filename="document_converted.${handler.fileExtension}"`,
                },
            });
        } catch (error) {
            console.error(`${format.toUpperCase()} 转换失败:`, error);
            
            // 返回更详细的错误信息
            const errorMessage = error instanceof Error ? error.message : `${format.toUpperCase()} 转换失败`;
            
            return new NextResponse(
                JSON.stringify({ 
                    error: errorMessage,
                    format: format,
                    timestamp: new Date().toISOString()
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    } catch (error) {
        console.error("文档生成失败:", error);
        
        // 返回更详细的错误信息
        const errorMessage = error instanceof Error ? error.message : "文档生成失败";
        const errorDetails = {
            error: errorMessage,
            timestamp: new Date().toISOString(),
            stack: error instanceof Error ? error.stack : undefined
        };
        
        return new NextResponse(JSON.stringify(errorDetails), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}



// 格式处理器映射
const formatHandlers: Record<SupportedFormat, FormatHandler> = {
    docx: {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileExtension: 'docx',
        process: async (docBuffer: Buffer) => docBuffer, // 直接返回原始buffer
    },
    pdf: {
        contentType: 'application/pdf',
        fileExtension: 'pdf',
        process: async (docBuffer: Buffer) => {
            console.log('开始 PDF 转换流程，文档大小:', docBuffer.length, 'bytes');
            
            try {
                // 使用 APYHub API 进行 PDF 转换
                console.log('尝试使用 APYHub API 进行 PDF 转换...');
                const result = await convertDocxToPdfWithAPYHub(docBuffer);
                console.log('APYHub API 转换成功，PDF 大小:', result.length, 'bytes');
                return result;
            } catch (error) {
                console.error('APYHub API PDF 转换失败，尝试使用备用方法:', error);
                // 如果 APYHub API 失败，回退到原有的转换方法
                try {
                    console.log('使用备用 PDF 转换方法...');
                    const fallbackResult = await convertDocxToPdf(docBuffer);
                    console.log('备用方法转换成功，PDF 大小:', fallbackResult.length, 'bytes');
                    return fallbackResult;
                } catch (fallbackError) {
                    console.error('备用 PDF 转换也失败:', fallbackError);
                    throw new Error(`PDF 转换失败: APYHub API 错误 - ${error instanceof Error ? error.message : '未知错误'}; 备用方法错误 - ${fallbackError instanceof Error ? fallbackError.message : '未知错误'}`);
                }
            }
        },
    },
    png: {
        contentType: 'image/png',
        fileExtension: 'png',
        process: async (docBuffer: Buffer) => {
            try {
                return await convertDocxToImage(docBuffer, 'png');
            } catch (error) {
                console.error('PNG 转换失败:', error);
                throw new Error('PNG 转换失败');
            }
        },
    },
    jpg: {
        contentType: 'image/jpeg',
        fileExtension: 'jpg',
        process: async (docBuffer: Buffer) => {
            try {
                return await convertDocxToImage(docBuffer, 'jpg');
            } catch (error) {
                console.error('JPG 转换失败:', error);
                throw new Error('JPG 转换失败');
            }
        },
    },
    jpeg: {
        contentType: 'image/jpeg',
        fileExtension: 'jpeg',
        process: async (docBuffer: Buffer) => {
            try {
                return await convertDocxToImage(docBuffer, 'jpeg');
            } catch (error) {
                console.error('JPEG 转换失败:', error);
                throw new Error('JPEG 转换失败');
            }
        },
    },
};