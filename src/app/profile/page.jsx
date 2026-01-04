import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AppShell from '../../components/layout/AppShell';
import ProfileForm from '../../components/profile/ProfileForm';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    return (
        <AppShell>
            <div style={{ padding: '20px' }}>
                <h1 style={{ marginBottom: '20px', fontSize: '1.8rem', color: '#111827' }}>Account Settings</h1>
                <ProfileForm user={user} />
            </div>
        </AppShell>
    );
}
