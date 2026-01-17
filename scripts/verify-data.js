import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.patientMedicalHistory.count();
        console.log('Total History Records:', count);

        const records = await prisma.patientMedicalHistory.findMany({
            include: {
                user: { select: { email: true, name: true, role: true } },
                birthHistory: true
            },
            take: 5,
            orderBy: { lastUpdated: 'desc' }
        });

        console.log('Recent Records:');
        console.log(JSON.stringify(records, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
