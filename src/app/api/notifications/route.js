import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's notifications
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch notifications for user
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to 20 most recent
        });

        // Count unread
        const unreadCount = notifications.filter(n => !n.read).length;

        return NextResponse.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

// POST - Create a new notification (or mark as read)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Mark notifications as read
        if (data.action === 'markRead') {
            if (data.notificationId) {
                // Mark single notification as read
                await prisma.notification.update({
                    where: { id: data.notificationId },
                    data: { read: true }
                });
            } else {
                // Mark all as read
                await prisma.notification.updateMany({
                    where: { userId: user.id, read: false },
                    data: { read: true }
                });
            }
            return NextResponse.json({ success: true });
        }

        // Create new notification
        if (data.type && data.title && data.message) {
            const notification = await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    link: data.link || null
                }
            });
            return NextResponse.json(notification);
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    } catch (error) {
        console.error("Notifications error:", error);
        return NextResponse.json({ error: "Failed to process notification" }, { status: 500 });
    }
}

// DELETE - Delete a notification
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('id');

        if (!notificationId) {
            return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
        }

        await prisma.notification.delete({
            where: { id: notificationId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notification delete error:", error);
        return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
    }
}
