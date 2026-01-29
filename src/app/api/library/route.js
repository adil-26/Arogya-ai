import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

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

        // Sanitize file name
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${safeName}`;
        const filePath = `library/${fileName}`; // Organize in library folder

        // Upload to Supabase Storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('reports') // Reusing 'reports' bucket or ideally a 'library' bucket if exists. Falling back to reports for simplicity based on user interaction.
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase Storage Upload Error:", uploadError);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Get Public URL
        const { data: urlData } = supabase
            .storage
            .from('reports')
            .getPublicUrl(filePath);

        const fileUrl = urlData.publicUrl;

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
