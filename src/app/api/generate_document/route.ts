import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(request: Request): Promise<NextResponse> {
    const data = await request.json(); // 从请求体中获取渲染数据
    const { templatePath, ...templateData } = data;
    
    if (!templatePath) {
        return NextResponse.json({ error: '未指定模板路径' }, { status: 400 });
    }

    let content: string;
    
    try {
        // 判断是本地文件还是Blob存储的文件
        if (templatePath.startsWith('/word/')) {
            // 使用 public 文件夹下的路径
            const filePath = path.join(process.cwd(), "public", templatePath);
            content = fs.readFileSync(filePath, "binary");
        } else {
            // 从Blob存储获取文件
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`获取模板文件失败: HTTP ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            content = Buffer.from(arrayBuffer).toString('binary');
        }
    } catch (error) {
        console.error('Error loading template:', error);
        return NextResponse.json({ error: '加载模板文件失败' }, { status: 500 });
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        linebreaks: true,
        paragraphLoop: true,
    });

    // 渲染模板的变量，使用请求传入的数据
    doc.render(templateData);

    // 生成文档为 buffer
    const docBuffer = doc.getZip().generate({
        type: "nodebuffer",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // 设置响应头并返回文档
    return new NextResponse(docBuffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": 'attachment; filename="offer_letter.docx"',
        },
    });
}