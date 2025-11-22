import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { getTemplateFields } from '../../../../services/docxTemplateService';
import { Readable } from "stream";

// 模板ID到文件名的映射存储文件
const MAPPING_FILE = path.join(process.cwd(), 'templates', 'template_mappings.json');

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  return new Promise<NextResponse>(async (resolve) => {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log(`✅ 已创建上传目录: ${uploadsDir}`);
    }

    const form = formidable({
      uploadDir: uploadsDir, // Temporary directory for uploads
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

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

    form.parse(mockRequest as unknown as Parameters<typeof form.parse>[0], async (err, _, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return resolve(NextResponse.json({ error: 'Error uploading file' }, { status: 500 }));
      }

      const uploadedFile = files.template?.[0];

      if (!uploadedFile) {
        return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
      }

      const oldPath = uploadedFile.filepath;
      const newFileName = `${Date.now()}-${uploadedFile.originalFilename}`;
      const newPath = path.join(process.cwd(), 'templates', newFileName);

      try {
        // Ensure the 'templates' directory exists
        await fs.mkdir(path.join(process.cwd(), 'templates'), { recursive: true });
        await fs.rename(oldPath, newPath);

        // Extract fields from the uploaded DOCX template
        const fields = await getTemplateFields(newPath, 'path');

        // Generate a template ID for mapping
        const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 保存模板ID到文件名的映射
        let templateMappings: Record<string, string> = {};
        try {
            const mappingData = await fs.readFile(MAPPING_FILE, 'utf-8');
            templateMappings = JSON.parse(mappingData);
        } catch (error) {
            console.log('模板映射文件不存在，将创建新的映射文件', error);
            await fs.mkdir(path.dirname(MAPPING_FILE), { recursive: true });
            // 创建空的映射文件
            await fs.writeFile(MAPPING_FILE, JSON.stringify({}, null, 2));
        }
        
        templateMappings[templateId] = newFileName;
        await fs.writeFile(MAPPING_FILE, JSON.stringify(templateMappings, null, 2));

        return resolve(NextResponse.json({ 
          message: 'File uploaded successfully', 
          filePath: newPath, 
          fileName: newFileName,
          templateId: templateId,
          fields 
        }));
      } catch (error) {
        console.error('Error processing file:', error);
        return resolve(NextResponse.json({ error: 'Error processing template' }, { status: 500 }));
      }
    });
  });
}