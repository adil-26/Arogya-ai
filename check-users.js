import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Database Users...");
    try {
        const users = await prisma.user.findMany();
        console.log("Total Users Found:", users.length);
        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error("DB Error:", err);
    }
}

main();
