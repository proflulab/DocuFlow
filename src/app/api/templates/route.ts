import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const wordDir = path.join(process.cwd(), 'public', 'word');
        const files = fs.readdirSync(wordDir).filter(file => file !== '.DS_Store');

        const templates = files.map(file => {
            const filePath = path.join(wordDir, file);
            const stats = fs.statSync(filePath);
            const format = path.extname(file).slice(1);
            const size = (stats.size / 1024).toFixed(2) + ' KB';

            return {
                name: path.basename(file, path.extname(file)),
                format,
                size,
                path: `/word/${file}`,
            };
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error reading templates:', error);
        return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
    }
}