import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import {  generateDocxBuffer } from '../../../../services/docxTemplateService';
// 移除对浏览器端缓存工具的依赖，改为服务器端读取（已在上方导入 fs 和 path）
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type');

    let templateFile: File | null = null;
    let templateId: string | null = null;
    let fields: { [key: string]: string } = {};

    if (contentType && contentType.includes('multipart/form-data')) {
      const buffer = await req.arrayBuffer();
      const readable = Readable.from(Buffer.from(buffer));

      const mockRequest = Object.assign(readable, {
          headers: Object.fromEntries(req.headers.entries()),
          method: req.method,
          url: req.url,
          httpVersion: '1.1',
          httpVersionMajor: 1,
          httpVersionMinor: 1,
          complete: true,
          connection: null,
          socket: null,
          aborted: false,
      });

      // Handle file upload (new template)
      const form = formidable({
        uploadDir: path.join(process.cwd(), './tmp'),
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
      });

      const [fieldsData, filesData] = await new Promise<[formidable.Fields<string>, formidable.Files<string>]>((resolve, reject) => {
        form.parse(mockRequest as unknown as Parameters<typeof form.parse>[0], (err, fields, files) => {
          if (err) return reject(err);
          resolve([fields, files]);
        });
      });

      const uploadedFile = filesData.template?.[0];
      if (!uploadedFile) {
        return NextResponse.json({ error: '未找到模板文件' }, { status: 400 });
      }

      // Convert formidable.File to standard File object
      const fileBuffer = await fs.readFile(uploadedFile.filepath);
      templateFile = new File([new Uint8Array(fileBuffer)], uploadedFile.originalFilename || 'template.docx', {
        type: uploadedFile.mimetype || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        lastModified: uploadedFile.mtime?.getTime(),
      });

      // Parse fields from form data
      for (const key in fieldsData) {
        if (fieldsData[key] && Array.isArray(fieldsData[key])) {
          fields[key] = fieldsData[key]?.[0] || '';
        }
      }

      // Clean up the temporary file
      await fs.unlink(uploadedFile.filepath);

    } else if (contentType && contentType.includes('application/json')) {
      // 服务器端模板：从服务器文件系统或可访问URL获取模板
      const body = await req.json();
      templateId = body.templateId;
      fields = body.fields || {};

      if (!templateId) {
        return NextResponse.json({ error: '未提供模板ID' }, { status: 400 });
      }

      // 支持三种形式：
      // 1) 绝对路径（如 /.../templates/xxx.docx）
      // 2) 服务器模板文件名（保存在 process.cwd()/templates 下）
      // 3) 可访问的URL（http/https），将其下载为文件
      let fileBuffer: Buffer | null = null;
      let filename: string = 'template.docx';

      try {
        if (templateId.startsWith('http://') || templateId.startsWith('https://')) {
          const resp = await fetch(templateId);
          if (!resp.ok) {
            return NextResponse.json({ error: `下载模板失败: ${resp.statusText}` }, { status: resp.status });
          }
          const arr = await resp.arrayBuffer();
          fileBuffer = Buffer.from(arr);
          try {
            const urlObj = new URL(templateId);
            filename = path.basename(urlObj.pathname) || filename;
          } catch {}
        } else {
          // 路径或文件名
          const resolvedPath = templateId.startsWith('/')
            ? templateId
            : path.join(process.cwd(), 'templates', templateId);

          // 读取服务器上的模板文件
          fileBuffer = await fs.readFile(resolvedPath);
          filename = path.basename(resolvedPath);
        }
      } catch (e) {
        console.error('读取服务器模板失败:', e);
        return NextResponse.json({ error: '未找到服务器模板' }, { status: 404 });
      }

      if (!fileBuffer) {
        return NextResponse.json({ error: '无法加载服务器模板' }, { status: 400 });
      }

      templateFile = new File([new Uint8Array(fileBuffer)], filename, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

    } else {
      return NextResponse.json({ error: '不支持的Content-Type' }, { status: 400 });
    }

    if (!templateFile) {
      return NextResponse.json({ error: '无法获取模板文件' }, { status: 400 });
    }

    // Convert File object to Buffer for docxTemplateService
    const templateFileBuffer = Buffer.from(await templateFile.arrayBuffer());

    // Generate document
    const generatedDocBuffer = await generateDocxBuffer(fields, templateFileBuffer, 'buffer');

    return new NextResponse(new Uint8Array(generatedDocBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="generated_document.docx"',
      },
    });

  } catch (error) {
    console.error('文档生成API错误:', error);
    return NextResponse.json({ error: '文档生成失败' }, { status: 500 });
  }
}



