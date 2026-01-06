import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

// Configure Prisma with connection pool settings optimized for Supabase free tier
export const prisma =
    globalForPrisma.prisma || new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
