import "server-only";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { APIError, betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

const authSecret = process.env.BETTER_AUTH_SECRET;
const authBaseUrl = process.env.BETTER_AUTH_URL;
if (process.env.NODE_ENV === "production") {
  if (!authSecret || authSecret.length < 32) throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters in production");
  if (!authBaseUrl) throw new Error("BETTER_AUTH_URL is required in production");
  try { new URL(authBaseUrl); } catch { throw new Error("BETTER_AUTH_URL must be a valid absolute URL in production"); }
}

export const auth = betterAuth({
  appName: "AquaOps",
  baseURL: authBaseUrl,
  secret: authSecret,
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
