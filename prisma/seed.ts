import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { permissionRegistry } from "../src/config/permissions";
import { defaultRolePermissions, systemRoles, type SystemRoleCode } from "../src/config/roles";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed AquaOps");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function seedAuthorization() {
  for (const permission of permissionRegistry) await db.permission.upsert({ where: { code: permission.code }, update: { name: permission.label, description: permission.group }, create: { code: permission.code, name: permission.label, description: permission.group } });
  for (const [code, definition] of Object.entries(systemRoles) as [SystemRoleCode, (typeof systemRoles)[SystemRoleCode]][]) {
    const role = await db.role.upsert({ where: { code }, update: { ...definition, isSystem: true, isActive: true }, create: { code, ...definition, isSystem: true } });
    const permissions = await db.permission.findMany({ where: { code: { in: [...defaultRolePermissions[code]] } }, select: { id: true } });
    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (permissions.length) await db.rolePermission.createMany({ data: permissions.map(({ id }) => ({ roleId: role.id, permissionId: id })) });
  }
}

async function upsertCredentialUser(input: { email: string; name: string; password: string; roleCode: SystemRoleCode }) {
  const email = input.email.toLowerCase();
  let user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    const userId = randomUUID();
    const password = await hashPassword(input.password);
    await db.$transaction(async (tx) => {
      await tx.user.create({ data: { id: userId, email, name: input.name, status: "ACTIVE", emailVerified: true } });
      await tx.account.create({ data: { id: randomUUID(), accountId: userId, providerId: "credential", userId, password } });
    });
    user = { id: userId };
  }
  const role = await db.role.findUniqueOrThrow({ where: { code: input.roleCode }, select: { id: true } });
  await db.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
}

async function main() {
  await seedAuthorization();
  const bootstrapEmail = process.env.AQUAOPS_BOOTSTRAP_EMAIL?.trim();
  const bootstrapPassword = process.env.AQUAOPS_BOOTSTRAP_PASSWORD;
  if (bootstrapEmail || bootstrapPassword) {
    if (!bootstrapEmail || !bootstrapPassword || bootstrapPassword.length < 12) throw new Error("Bootstrap email and a password of at least 12 characters are both required");
    await upsertCredentialUser({ email: bootstrapEmail, name: "AquaOps Owner", password: bootstrapPassword, roleCode: "OWNER" });
  }
  if (process.env.AQUAOPS_ENABLE_DEV_SEED === "true") {
    if (process.env.NODE_ENV === "production") throw new Error("Development users cannot be seeded in production");
    const password = process.env.AQUAOPS_DEV_SEED_PASSWORD;
    if (!password || password.length < 12) throw new Error("AQUAOPS_DEV_SEED_PASSWORD must contain at least 12 characters");
    const users: [string, string, SystemRoleCode][] = [["owner@aquaops.local", "เจ้าของกิจการ (ทดสอบ)", "OWNER"], ["admin@aquaops.local", "ผู้ดูแลระบบ (ทดสอบ)", "ADMIN"], ["sales@aquaops.local", "ฝ่ายขาย (ทดสอบ)", "SALES"], ["accounting@aquaops.local", "ฝ่ายบัญชี (ทดสอบ)", "ACCOUNTING"], ["warehouse@aquaops.local", "ฝ่ายคลัง (ทดสอบ)", "WAREHOUSE"], ["delivery@aquaops.local", "ฝ่ายจัดส่ง (ทดสอบ)", "DELIVERY"], ["viewer@aquaops.local", "ผู้ดูข้อมูล (ทดสอบ)", "VIEWER"]];
    for (const [email, name, roleCode] of users) await upsertCredentialUser({ email, name, password, roleCode });
  }
}

main().finally(() => db.$disconnect());
