import { db } from "@/lib/db";

export const systemRepository = { async isDatabaseAvailable() { await db.$queryRaw`SELECT 1`; return true; } };
