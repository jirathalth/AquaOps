import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const configuredDatabaseUrl = process.env.DATABASE_URL;
if (process.env.NODE_ENV === "production" && !configuredDatabaseUrl) throw new Error("DATABASE_URL is required in production");
const connectionString = configuredDatabaseUrl ?? "postgresql://postgres:postgres@localhost:5432/aquaops";
const adapter = new PrismaPg({ connectionString });

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
