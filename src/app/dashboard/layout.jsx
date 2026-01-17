import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({ children }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // Role-based access control - Check session role directly
    // This avoids hitting the DB (findUnique) on every request, fixing connection pool timeouts
    if (session?.user?.role) {
        if (session.user.role === 'admin') {
            redirect('/admin');
        }
        if (session.user.role === 'doctor') {
            redirect('/doctor');
        }
    }

    return children;
}
