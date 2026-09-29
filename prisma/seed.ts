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

async function seedCustomerData() {
  const priceLists = [
    { code: "RETAIL", name: "ราคาปลีก", description: "ราคาขายปลีกมาตรฐาน" },
    { code: "WHOLESALE-A", name: "ราคาส่ง A", description: "ราคาสำหรับลูกค้าส่งกลุ่ม A" },
    { code: "WHOLESALE-B", name: "ราคาส่ง B", description: "ราคาสำหรับลูกค้าส่งกลุ่ม B" },
    { code: "DEALER", name: "ราคาตัวแทนจำหน่าย", description: "ราคาสำหรับตัวแทนจำหน่าย" },
  ];
  const priceListIds = new Map<string, string>();
  for (const item of priceLists) { const priceList = await db.priceList.upsert({ where: { code: item.code }, update: { ...item, status: "ACTIVE", currency: "THB" }, create: { ...item, status: "ACTIVE", currency: "THB" } }); priceListIds.set(item.code, priceList.id); }
  const customers = [
    { code: "CUS-000001", type: "RETAIL" as const, status: "ACTIVE" as const, legalName: "สมชาย ใจดี", displayName: "คุณสมชาย", contactName: "สมชาย ใจดี", phone: "081-234-5678", email: "somchai@example.test", defaultSaleType: "CASH" as const, creditLimit: "0.00", creditTermDays: 0, billingCycle: "NONE" as const, defaultPriceListId: priceListIds.get("RETAIL"), notes: "ลูกค้าปลีกตัวอย่าง", addresses: [{ type: "SHIPPING" as const, label: "บ้าน", addressLine1: "99/9 ถนนสุขุมวิท", subdistrict: "บางนา", district: "บางนา", province: "กรุงเทพมหานคร", postalCode: "10260", countryCode: "TH", isDefault: true }] },
    { code: "CUS-000002", type: "WHOLESALE" as const, status: "ACTIVE" as const, legalName: "บริษัท น้ำใส มาร์เก็ต จำกัด", displayName: "น้ำใส มาร์เก็ต", taxId: "0105569000001", taxBranchCode: "00000", contactName: "อรทัย ฝ่ายขาย", phone: "02-123-4567", email: "purchasing@namsai.example.test", defaultSaleType: "CREDIT" as const, creditLimit: "100000.00", creditTermDays: 30, billingCycle: "END_OF_MONTH" as const, defaultPriceListId: priceListIds.get("WHOLESALE-A"), notes: "ลูกค้าส่งเครดิตตัวอย่าง", addresses: [{ type: "BILLING" as const, label: "สำนักงานใหญ่", addressLine1: "88 ถนนรัชดาภิเษก", subdistrict: "ดินแดง", district: "ดินแดง", province: "กรุงเทพมหานคร", postalCode: "10400", countryCode: "TH", isDefault: true }, { type: "SHIPPING" as const, label: "คลังสินค้า", addressLine1: "55/5 ถนนบางนา-ตราด", subdistrict: "บางแก้ว", district: "บางพลี", province: "สมุทรปราการ", postalCode: "10540", countryCode: "TH", isDefault: true }] },
    { code: "CUS-000003", type: "WHOLESALE" as const, status: "ACTIVE" as const, legalName: "ร้านโชคดี", displayName: "ร้านโชคดี", contactName: "คุณนิด", phone: "089-555-0101", defaultSaleType: "CREDIT" as const, creditLimit: "30000.00", creditTermDays: 15, billingCycle: "DAY_15_AND_END_OF_MONTH" as const, defaultPriceListId: priceListIds.get("WHOLESALE-B"), notes: null, addresses: [{ type: "BILLING" as const, label: "หน้าร้าน", addressLine1: "12 ตลาดสดเทศบาล", district: "เมือง", province: "นนทบุรี", postalCode: "11000", countryCode: "TH", isDefault: true }] },
    { code: "CUS-000004", type: "RETAIL" as const, status: "INACTIVE" as const, legalName: "ลูกค้าตัวอย่าง ไม่ใช้งาน", displayName: "ลูกค้าตัวอย่าง ไม่ใช้งาน", phone: "080-000-0004", defaultSaleType: "CASH" as const, creditLimit: "0.00", creditTermDays: 0, billingCycle: "NONE" as const, defaultPriceListId: priceListIds.get("RETAIL"), notes: "ใช้ตรวจสอบตัวกรองสถานะ", addresses: [] },
  ];
  for (const { addresses, ...data } of customers) {
    const customer = await db.customer.upsert({ where: { code: data.code }, update: data, create: data });
    await db.customerAddress.deleteMany({ where: { customerId: customer.id } });
    if (addresses.length) await db.customerAddress.createMany({ data: addresses.map((address) => ({ customerId: customer.id, ...address })) });
  }
  await db.$executeRaw`SELECT setval('customer_code_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING("code" FROM 5)::BIGINT), 0) FROM "customers" WHERE "code" ~ '^CUS-[0-9]+$'), 1), true)`;
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
    await seedCustomerData();
  }
}

main().finally(() => db.$disconnect());
