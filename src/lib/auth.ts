import { prismaAdapter } from "@better-auth/prisma-adapter";
import { APIError, betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

export const auth = betterAuth({
  appName: "AquaOps",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  user: { additionalFields: { status: { type: "string", defaultValue: "ACTIVE", input: false } } },
  databaseHooks: { session: {
    create: {
      before: async (session) => { const user = await db.user.findUnique({ where: { id: session.userId }, select: { status: true } }); if (!user || user.status !== "ACTIVE") throw new APIError("FORBIDDEN", { code: "USER_INACTIVE", message: "Account is inactive" }); },
      after: async (session) => { await db.auditLog.create({ data: { actorId: session.userId, action: "LOGIN", entityType: "Session", entityId: session.id, metadata: { ipAddress: session.ipAddress ?? null } } }); },
    },
    delete: { after: async (session) => { await db.auditLog.create({ data: { actorId: session.userId, action: "LOGOUT", entityType: "Session", entityId: session.id } }); } },
  } },
  plugins: [nextCookies()],
});
