import { PrismaClient } from "@prisma/client";

declare global {
    var globalPrisma: PrismaClient | undefined;
}

export const prisma = globalThis.globalPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.globalPrisma = prisma;

