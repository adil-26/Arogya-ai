// Run this script to make a user an admin
// Usage: node make-admin.js your-email@example.com

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.log("❌ Please provide an email address:");
        console.log("   node make-admin.js your-email@example.com");
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email: email.toLowerCase().trim() },
            data: { role: 'admin' }
        });

        console.log("✅ Success! User is now an admin:");
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log("\n🔗 Now go to: http://localhost:3000/admin");
    } catch (error) {
        if (error.code === 'P2025') {
            console.log("❌ No user found with that email");
        } else {
            console.error("Error:", error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();
