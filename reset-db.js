import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning Database...");

    try {
        // Delete all dependent data first (Order matters!)
        console.log("Deleting Linked Accounts...");
        await prisma.account.deleteMany({});

        console.log("Deleting Sessions...");
        await prisma.session.deleteMany({});

        console.log("Deleting Medical Conditions...");
        await prisma.medicalCondition.deleteMany({});

        console.log("Deleting Appointments...");
        await prisma.appointment.deleteMany({});

        console.log("Deleting Medical Records...");
        await prisma.medicalRecord.deleteMany({});

        console.log("Deleting Chat Messages...");
        await prisma.chatMessage.deleteMany({});

        console.log("Deleting Body Issues...");
        await prisma.bodyIssue.deleteMany({});

        console.log("Deleting Health Metrics...");
        await prisma.healthMetric.deleteMany({});

        console.log("Deleting Daily Logs...");
        await prisma.dailyLog.deleteMany({});

        // Now delete users
        console.log("Deleting Users...");
        await prisma.user.deleteMany({});

        console.log("✅ All users and data deleted. Database is ready for fresh registration.");
    } catch (error) {
        console.error("Cleanup Failed:", error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
