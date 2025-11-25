import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore error if directory exists
    }

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const filepath = path.join(uploadDir, filename);

    try {
        await writeFile(filepath, buffer);
        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Upload failed:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
