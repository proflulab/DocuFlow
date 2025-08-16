import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { getTemplateFromBlob } from "@/utils/blob";

// 动态文档数据类型
type DocumentData = Record<string, any>;



// 生成DOCX文档的通用函数
async function generateDocxBuffer(data: DocumentData, templateSource: 'local' | 'cloud' = 'local', templateName?: string): Promise<Buffer> {
    let content: string;

    if (templateSource === 'cloud' && templateName) {
        // 从 Vercel Blob 获取模板
        const templateBuffer = await getTemplateFromBlob(templateName);
        content = templateBuffer.toString('binary');
    } else {
        // 使用本地模板文件
        const filePath = path.join(process.cwd(), "public", "word", "Lulab_invioce.docx");
        content = fs.readFileSync(filePath, "binary");
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        linebreaks: true,
        paragraphLoop: true,
    });

    // 渲染模板的变量，直接使用传入的数据
    doc.render(data);

    // 生成文档为 buffer
    return doc.getZip().generate({
        type: "nodebuffer",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
}

// 将DOCX转换为PDF的函数
async function convertDocxToPdf(docBuffer: Buffer): Promise<Buffer> {
    const PDF_API_URL = process.env.PDF_CONVERTER_API;
    if (!PDF_API_URL) {
        throw new Error("PDF API URL 未配置");
    }

    // 创建 FormData 对象
    const form = new FormData();
    form.append("fileInput", docBuffer, {
        filename: "Lulab_invioce.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // 发送请求到 PDF 转换 API
    const response = await axios.post(PDF_API_URL, form, {
        headers: {
            ...form.getHeaders(),
            accept: "*/*",
        },
        responseType: "arraybuffer", // 接收二进制数据
    });

    return Buffer.from(response.data);
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const data = await request.json(); // 从请求体中获取渲染数据
        const url = new URL(request.url);
        const format = url.searchParams.get('format') || 'docx'; // 默认返回docx格式
        const templateSource = url.searchParams.get('source') as 'local' | 'cloud' || 'local'; // 模板来源参数
        const templateName = url.searchParams.get('template'); // 可选的模板名称参数

        // 生成DOCX文档
        const docBuffer = await generateDocxBuffer(data, templateSource, templateName || undefined);

        // 根据format参数决定返回格式
        if (format.toLowerCase() === 'pdf') {
            try {
                // 转换为PDF
                const pdfBuffer = await convertDocxToPdf(docBuffer);

                return new NextResponse(pdfBuffer, {
                    headers: {
                        "Content-Type": "application/pdf",
                        "Content-Disposition": 'attachment; filename="Lulab_invioce_converted.pdf"',
                    },
                });
            } catch (error) {
                console.error("PDF 转换失败:", error);
                return new NextResponse(JSON.stringify({ error: "PDF 转换失败" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                });
            }
        } else {
            // 返回DOCX格式
            return new NextResponse(docBuffer, {
                headers: {
                    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "Content-Disposition": 'attachment; filename="offer_letter.docx"',
                },
            });
        }
    } catch (error) {
        console.error("文档生成失败:", error);
        return new NextResponse(JSON.stringify({ error: "文档生成失败" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}