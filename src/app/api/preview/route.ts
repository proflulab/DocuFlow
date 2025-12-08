/**
 * PDF预览转换API
 * 用于将DOCX模板转换为PDF格式进行预览
 */

import { NextResponse } from "next/server";
import { convertDocxToPdf } from "@/services/pdfConverter";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // 获取上传的文件
        const formData = await request.formData();
        const templateFile = formData.get('template') as File;
        
        if (!templateFile) {
            return new NextResponse(JSON.stringify({ error: "缺少模板文件" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 将File转换为Buffer
        const arrayBuffer = await templateFile.arrayBuffer();
        const templateBuffer = Buffer.from(arrayBuffer);

        // 转换为PDF
        const pdfBuffer = await convertDocxToPdf(templateBuffer);

        // 返回PDF文件
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline; filename=\"preview.pdf\"",
            },
        });
    } catch (error) {
        console.error("PDF预览转换失败:", error);
        return new NextResponse(JSON.stringify({ error: "PDF转换失败" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}