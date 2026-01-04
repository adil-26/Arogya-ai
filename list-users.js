import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: { email: true, name: true, role: true }
        });

        console.log("\n📋 Users in your database:\n");
        users.forEach(u => {
            console.log(`  • ${u.email} (${u.role}) - ${u.name || 'No name'}`);
        });
        console.log("\n");
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
