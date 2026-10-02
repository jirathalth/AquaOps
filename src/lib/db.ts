import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getRuntimeDatabaseConfig } from "@/config/database-environment";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const database = getRuntimeDatabaseConfig();
const adapter = new PrismaPg({ connectionString: database.connectionString, max: database.max, idleTimeoutMillis: database.idleTimeoutMillis, connectionTimeoutMillis: database.connectionTimeoutMillis });

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
