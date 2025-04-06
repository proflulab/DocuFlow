import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
    try {
        // 获取word目录的路径
        const wordDirPath = path.join(process.cwd(), "public", "word");
        
        // 读取目录中的所有文件
        const files = fs.readdirSync(wordDirPath);
        
        // 过滤出.docx文件
        const templates = files
            .filter(file => file.endsWith(".docx"))
            .map(file => ({
                name: file,
                path: `/word/${file}`,
                fullPath: path.join(wordDirPath, file)
            }));
        
        return NextResponse.json({ templates });
    } catch (error) {
        console.error("Error listing templates:", error);
        return NextResponse.json(
            { error: "Failed to list templates" },
            { status: 500 }
        );
    }
}