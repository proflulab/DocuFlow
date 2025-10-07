import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { getTemplateFields } from '../../../../services/docxTemplateService';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  return new Promise<NextResponse>((resolve) => {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'uploads'), // Temporary directory for uploads
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    form.parse(req as any, async (err, _, files) => {
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

        return resolve(NextResponse.json({ message: 'File uploaded successfully', filePath: newPath, fields }));
      } catch (error) {
        console.error('Error processing file:', error);
        return resolve(NextResponse.json({ error: 'Error processing template' }, { status: 500 }));
      }
    });
  });
}