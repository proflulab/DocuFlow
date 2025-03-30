import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function DELETE(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('path');

        if (!filePath) {
            return NextResponse.json(
                { error: '未提供文件路径' },
                { status: 400 }
            );
        }

        // 构建绝对路径并验证
        const absolutePath = path.join(process.cwd(), 'public', filePath);
        const wordDir = path.join(process.cwd(), 'public', 'word');

        // 安全检查：确保文件路径在word目录下
        if (!absolutePath.startsWith(wordDir)) {
            return NextResponse.json(
                { error: '无效的文件路径' },
                { status: 403 }
            );
        }

        // 检查文件是否存在
        if (!fs.existsSync(absolutePath)) {
            return NextResponse.json(
                { error: '文件不存在' },
                { status: 404 }
            );
        }

        // 删除文件
        fs.unlinkSync(absolutePath);

        return NextResponse.json(
            { message: '文件删除成功' },
            { status: 200 }
        );
    } catch (error) {
        console.error('删除文件失败:', error);
        return NextResponse.json(
            { error: '删除文件失败' },
            { status: 500 }
        );
    }
}