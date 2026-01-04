import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET: List all library items (filtered by category or access level)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const accessLevel = searchParams.get('access'); // 'all', 'doctor', 'patient'

        const where = {};
        if (category && category !== 'all') {
            where.category = category;
        }
        if (accessLevel) {
            where.accessLevel = accessLevel;
        }

        const items = await prisma.libraryItem.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("Library fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 });
    }
}

// POST: Upload a new library item (Admin only)
export async function POST(request) {
    try {
        const formData = await request.formData();

        const title = formData.get('title');
        const description = formData.get('description');
        const author = formData.get('author');
        const category = formData.get('category') || 'book';
        const accessLevel = formData.get('accessLevel') || 'all';
        const uploadedBy = formData.get('uploadedBy') || 'admin';
        const file = formData.get('file');

        if (!title || !file) {
            return NextResponse.json({ error: "Title and file are required" }, { status: 400 });
        }

        // Create uploads directory if not exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'library');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${originalName}`;
        const filePath = path.join(uploadDir, fileName);

        // Write file to disk
        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        // Save to database
        const fileUrl = `/uploads/library/${fileName}`;

        const newItem = await prisma.libraryItem.create({
            data: {
                title,
                description,
                author,
                category,
                accessLevel,
                fileUrl,
                uploadedBy
            }
        });

        return NextResponse.json({ message: "Item uploaded successfully", item: newItem });
    } catch (error) {
        console.error("Library upload error:", error);
        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}

// DELETE: Remove a library item
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Item ID required" }, { status: 400 });
        }

        await prisma.libraryItem.delete({ where: { id } });

        return NextResponse.json({ message: "Item deleted" });
    } catch (error) {
        console.error("Library delete error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
