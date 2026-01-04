import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({ children }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // Fetch user to check role
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
    });

    // Role-based access control - only patients can access patient dashboard
    if (user) {
        if (user.role === 'admin') {
            redirect('/admin');
        }
        if (user.role === 'doctor') {
            redirect('/doctor');
        }
    }

    return children;
}
