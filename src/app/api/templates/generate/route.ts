import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import {  generateDocxBuffer } from '../../../../services/docxTemplateService';
import { getFileFromCache } from '../../../../utils/localCache';
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
      // Handle cached template (templateId and fields in JSON body)
      const body = await req.json();
      templateId = body.templateId;
      fields = body.fields || {};

      if (!templateId) {
        return NextResponse.json({ error: '未提供模板ID' }, { status: 400 });
      }

      const cached = await getFileFromCache(templateId);
      if (!cached) {
        return NextResponse.json({ error: '未找到缓存模板' }, { status: 404 });
      }
      templateFile = cached;

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