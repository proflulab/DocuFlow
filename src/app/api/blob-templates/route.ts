import { list, put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

const token = process.env.BLOB_READ_WRITE_TOKEN;

export const runtime = 'edge';

// 获取模板列表
export async function GET() {
    try {
        const { blobs } = await list({ token });
        const templates = blobs.map(blob => ({
            name: blob.pathname.split('/').pop()?.replace(/\.[^/.]+$/, ''),
            format: blob.pathname.split('.').pop(),
            size: `${(blob.size / 1024).toFixed(2)} KB`,
            path: blob.url,
            pathname: blob.pathname
        }));

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error listing templates:', error);
        return NextResponse.json({ error: '获取模板列表失败' }, { status: 500 });
    }
}

// 上传或更新模板
export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const pathname = formData.get('pathname') as string;

        if (!file) {
            return NextResponse.json({ error: '未找到上传的文件' }, { status: 400 });
        }

        if (!file.name.endsWith('.docx')) {
            return NextResponse.json({ error: '只支持 .docx 格式的文件' }, { status: 400 });
        }

        const uploadPath = pathname || `templates/${file.name}`;
        const { url } = await put(uploadPath, file, { access: 'public', token });

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Error uploading template:', error);
        return NextResponse.json({ error: '上传模板失败' }, { status: 500 });
    }
}

// 删除模板
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pathname = searchParams.get('pathname');

        if (!pathname) {
            return NextResponse.json({ error: '未指定要删除的文件' }, { status: 400 });
        }

        await del(pathname, { token });
        return NextResponse.json({ message: '删除成功' });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: '删除模板失败' }, { status: 500 });
    }
}