import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log("SUCCESS: Database connection established.");
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);
    } catch (e) {
        console.error("ERROR: Database connection failed.", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
