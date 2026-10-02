import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { permissionRegistry } from "../src/config/permissions";
import { defaultRolePermissions, systemRoles, type SystemRoleCode } from "../src/config/roles";
import { assertDemoSeedAllowed, getRuntimeDatabaseConfig } from "../src/config/database-environment";
import { buildMappingSyncPlan } from "../src/services/rbac-bootstrap-core";
import { calculateSalesOrderTotals } from "../src/services/sales-order-core";
import { addMoney, calculateOutstanding } from "../src/services/accounting-core";

const database = getRuntimeDatabaseConfig();
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: database.connectionString, max: database.max, idleTimeoutMillis: database.idleTimeoutMillis, connectionTimeoutMillis: database.connectionTimeoutMillis }) });

async function seedAuthorization() {
  for (const permission of permissionRegistry) await db.permission.upsert({ where: { code: permission.code }, update: { name: permission.label, description: permission.group }, create: { code: permission.code, name: permission.label, description: permission.group } });
  for (const [code, definition] of Object.entries(systemRoles) as [SystemRoleCode, (typeof systemRoles)[SystemRoleCode]][]) {
    const role = await db.role.upsert({ where: { code }, update: { ...definition, isSystem: true, isActive: true }, create: { code, ...definition, isSystem: true } });
    const permissions = await db.permission.findMany({ where: { code: { in: [...defaultRolePermissions[code]] } }, select: { id: true } });
    const existing = await db.rolePermission.findMany({ where: { roleId: role.id }, select: { permissionId: true } });
    const plan = buildMappingSyncPlan(existing.map(({ permissionId }) => permissionId), permissions.map(({ id }) => id));
    await db.$transaction([
      ...(plan.remove.length ? [db.rolePermission.deleteMany({ where: { roleId: role.id, permissionId: { in: plan.remove } } })] : []),
      ...(plan.add.length ? [db.rolePermission.createMany({ data: plan.add.map((permissionId) => ({ roleId: role.id, permissionId })), skipDuplicates: true })] : []),
    ]);
  }
}

async function createCredentialUser(input: { email: string; name: string; password: string; roleCode: SystemRoleCode }) {
  const email = input.email.toLowerCase();
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) throw new Error("Bootstrap user already exists; no account or role was changed");
  const userId = randomUUID();
  const password = await hashPassword(input.password);
  const role = await db.role.findUniqueOrThrow({ where: { code: input.roleCode }, select: { id: true } });
  await db.$transaction(async (tx) => {
    await tx.user.create({ data: { id: userId, email, name: input.name, status: "ACTIVE", emailVerified: true } });
    await tx.account.create({ data: { id: randomUUID(), accountId: userId, providerId: "credential", userId, password } });
    await tx.userRole.create({ data: { userId, roleId: role.id } });
  });
}

async function ensureInitialOwner() {
  const bootstrapEmail = process.env.AQUAOPS_BOOTSTRAP_EMAIL?.trim();
  const bootstrapPassword = process.env.AQUAOPS_BOOTSTRAP_PASSWORD;
  if (!bootstrapEmail && !bootstrapPassword) return;
  if (!bootstrapEmail || !bootstrapPassword || bootstrapPassword.length < 12) throw new Error("Bootstrap email and a password of at least 12 characters are both required");
  const privilegedUsers = await db.userRole.count({ where: { user: { status: "ACTIVE" }, role: { isActive: true, code: { in: ["OWNER", "ADMIN"] } } } });
  if (privilegedUsers > 0) throw new Error("Initial owner bootstrap refused because an active Owner or Admin already exists");
  await createCredentialUser({ email: bootstrapEmail, name: "AquaOps Owner", password: bootstrapPassword, roleCode: "OWNER" });
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
    { code: "CUS-000005", type: "RETAIL" as const, status: "ACTIVE" as const, legalName: "ลูกค้าราคามาตรฐาน", displayName: "ลูกค้าราคามาตรฐาน", phone: "080-000-0005", defaultSaleType: "CASH" as const, creditLimit: "0.00", creditTermDays: 0, billingCycle: "NONE" as const, defaultPriceListId: null, notes: "ใช้ตรวจสอบราคามาตรฐานสินค้า", addresses: [{ type: "SHIPPING" as const, label: "บ้าน", addressLine1: "101 ถนนตัวอย่าง", district: "เมือง", province: "กรุงเทพมหานคร", postalCode: "10000", countryCode: "TH", isDefault: true }] },
  ];
  for (const { addresses, ...data } of customers) {
    const customer = await db.customer.upsert({ where: { code: data.code }, update: data, create: data });
    await db.customerAddress.deleteMany({ where: { customerId: customer.id } });
    if (addresses.length) await db.customerAddress.createMany({ data: addresses.map((address) => ({ customerId: customer.id, ...address })) });
  }
  await db.$executeRaw`SELECT setval('customer_code_seq', GREATEST((SELECT COALESCE(MAX(SUBSTRING("code" FROM 5)::BIGINT), 0) FROM "customers" WHERE "code" ~ '^CUS-[0-9]+$'), 1), true)`;
}

async function seedCatalogPricing() {
  const categoryDefinitions = [
    { code: "DRINKING_WATER", name: "น้ำดื่ม" },
    { code: "LARGE_BOTTLE", name: "ถังและขวดขนาดใหญ่" },
    { code: "PACKAGING", name: "บรรจุภัณฑ์" },
  ];
  const categories = new Map<string, string>();
  for (const definition of categoryDefinitions) { const category = await db.productCategory.upsert({ where: { code: definition.code }, update: { ...definition, isActive: true }, create: definition }); categories.set(definition.code, category.id); }
  const unitDefinitions = [
    { code: "BOTTLE", nameTh: "ขวด", nameEn: "Bottle", symbol: "ขวด" },
    { code: "PACK", nameTh: "แพ็ก", nameEn: "Pack", symbol: "แพ็ก" },
    { code: "CARTON", nameTh: "ลัง", nameEn: "Carton", symbol: "ลัง" },
    { code: "TANK", nameTh: "ถัง", nameEn: "Tank", symbol: "ถัง" },
  ];
  const units = new Map<string, string>();
  for (const definition of unitDefinitions) { const unit = await db.unitOfMeasure.upsert({ where: { code: definition.code }, update: { ...definition, decimalScale: 0, isActive: true }, create: { ...definition, decimalScale: 0 } }); units.set(definition.code, unit.id); }
  const products = [
    { sku: "WATER-350-PACK", name: "น้ำดื่ม 350 มล. แพ็ก 12 ขวด", category: "DRINKING_WATER", unit: "PACK", barcode: "8850000000011", cost: "28.5000", retail: "45.0000", wholesale: "38.0000", reorder: "30.000" },
    { sku: "WATER-600-PACK", name: "น้ำดื่ม 600 มล. แพ็ก 12 ขวด", category: "DRINKING_WATER", unit: "PACK", barcode: "8850000000028", cost: "34.0000", retail: "55.0000", wholesale: "47.0000", reorder: "40.000" },
    { sku: "WATER-1500-PACK", name: "น้ำดื่ม 1.5 ลิตร แพ็ก 6 ขวด", category: "DRINKING_WATER", unit: "PACK", barcode: "8850000000035", cost: "39.0000", retail: "60.0000", wholesale: "52.0000", reorder: "25.000" },
    { sku: "WATER-350-BOTTLE", name: "น้ำดื่ม 350 มล.", category: "DRINKING_WATER", unit: "BOTTLE", barcode: "8850000000042", cost: "2.4000", retail: "5.0000", wholesale: "3.5000", reorder: "120.000" },
    { sku: "WATER-600-BOTTLE", name: "น้ำดื่ม 600 มล.", category: "DRINKING_WATER", unit: "BOTTLE", barcode: "8850000000059", cost: "2.9000", retail: "7.0000", wholesale: "4.5000", reorder: "120.000" },
    { sku: "WATER-1500-BOTTLE", name: "น้ำดื่ม 1.5 ลิตร", category: "DRINKING_WATER", unit: "BOTTLE", barcode: "8850000000066", cost: "6.0000", retail: "12.0000", wholesale: "9.0000", reorder: "60.000" },
    { sku: "WATER-5L-BOTTLE", name: "น้ำดื่ม 5 ลิตร", category: "LARGE_BOTTLE", unit: "BOTTLE", barcode: "8850000000073", cost: "16.0000", retail: "30.0000", wholesale: "25.0000", reorder: "30.000" },
    { sku: "WATER-18L-TANK", name: "น้ำดื่มถัง 18.9 ลิตร", category: "LARGE_BOTTLE", unit: "TANK", barcode: "8850000000080", cost: "18.0000", retail: "45.0000", wholesale: "38.0000", reorder: "40.000" },
    { sku: "EMPTY-18L-TANK", name: "ถังเปล่า 18.9 ลิตร", category: "PACKAGING", unit: "TANK", barcode: "8850000000097", cost: "120.0000", retail: "180.0000", wholesale: "160.0000", reorder: "15.000" },
    { sku: "CUP-220-CARTON", name: "น้ำดื่มถ้วย 220 มล. ลัง 48 ถ้วย", category: "DRINKING_WATER", unit: "CARTON", barcode: "8850000000103", cost: "72.0000", retail: "105.0000", wholesale: "92.0000", reorder: "20.000" },
    { sku: "CARTON-600", name: "กล่องลูกฟูกสำหรับน้ำ 600 มล.", category: "PACKAGING", unit: "CARTON", barcode: "8850000000110", cost: "8.0000", retail: "12.0000", wholesale: "10.0000", reorder: "50.000" },
  ];
  const productUnits = new Map<string, string>();
  for (const definition of products) {
    const product = await db.product.upsert({ where: { sku: definition.sku }, update: { name: definition.name, categoryId: categories.get(definition.category), status: "ACTIVE", trackInventory: true, reorderLevel: definition.reorder }, create: { sku: definition.sku, name: definition.name, categoryId: categories.get(definition.category), reorderLevel: definition.reorder } });
    const unitId = units.get(definition.unit)!;
    const productUnit = await db.productUnit.upsert({ where: { productId_unitId: { productId: product.id, unitId } }, update: { barcode: definition.barcode, cost: definition.cost, retailPrice: definition.retail, wholesalePrice: definition.wholesale, conversionFactor: "1.000000", isBase: true, isActive: true }, create: { productId: product.id, unitId, barcode: definition.barcode, cost: definition.cost, retailPrice: definition.retail, wholesalePrice: definition.wholesale, conversionFactor: "1.000000", isBase: true } });
    productUnits.set(definition.sku, productUnit.id);
  }
  const priceFactors: Record<string, string> = { RETAIL: "1.0000", "WHOLESALE-A": "0.9000", "WHOLESALE-B": "0.9400", DEALER: "0.8500" };
  for (const [code, factor] of Object.entries(priceFactors)) {
    const priceList = await db.priceList.findUniqueOrThrow({ where: { code }, select: { id: true } });
    for (const definition of products) {
      const defaultPrice = code === "RETAIL" ? definition.retail : definition.wholesale;
      const cents = BigInt(defaultPrice.replace(".", ""));
      const multiplier = BigInt(factor.replace(".", ""));
      const unitPrice = `${(cents * multiplier) / 10000n}`.padStart(5, "0").replace(/(\d{4})$/, ".$1");
      const productUnitId = productUnits.get(definition.sku)!;
      await db.priceListItem.upsert({ where: { priceListId_productUnitId_minimumQuantity: { priceListId: priceList.id, productUnitId, minimumQuantity: "1.000" } }, update: { unitPrice }, create: { priceListId: priceList.id, productUnitId, minimumQuantity: "1.000", unitPrice } });
    }
  }
  const customer = await db.customer.findUniqueOrThrow({ where: { code: "CUS-000002" }, select: { id: true } });
  const productUnitId = productUnits.get("WATER-600-PACK")!;
  const validFrom = new Date("2026-01-01T00:00:00.000+07:00");
  await db.customerProductPrice.upsert({ where: { customerId_productUnitId_validFrom: { customerId: customer.id, productUnitId, validFrom } }, update: { unitPrice: "42.5000", validTo: null }, create: { customerId: customer.id, productUnitId, unitPrice: "42.5000", validFrom } });
}

async function seedSalesOrders() {
  const warehouse = await db.warehouse.upsert({ where: { code: "MAIN" }, update: { name: "คลังสินค้าหลัก", type: "STORAGE", status: "ACTIVE", isDefault: true }, create: { code: "MAIN", name: "คลังสินค้าหลัก", type: "STORAGE", status: "ACTIVE", isDefault: true } });
  const customers = await db.customer.findMany({ where: { code: { in: ["CUS-000001", "CUS-000002", "CUS-000003", "CUS-000005"] } }, select: { id: true, code: true, displayName: true, type: true, defaultPriceListId: true, creditTermDays: true, creditLimit: true, defaultSaleType: true, addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] } } });
  const customerByCode = new Map(customers.map((customer) => [customer.code, customer]));
  const units = await db.productUnit.findMany({ where: { product: { sku: { in: ["WATER-350-PACK", "WATER-600-PACK", "WATER-1500-PACK", "WATER-18L-TANK"] } } }, include: { product: true, unit: true } });
  const unitBySku = new Map(units.map((unit) => [unit.product.sku, unit]));
  const definitions = [
    { orderNo: "SO-202609-00001", customer: "CUS-000001", status: "DRAFT" as const, discount: "0.00", lines: [{ sku: "WATER-350-PACK", quantity: "2.000", price: "45.0000", source: "PRICE_LIST", discount: "0.00", tax: "7.00" }] },
    { orderNo: "SO-202609-00002", customer: "CUS-000002", status: "CONFIRMED" as const, discount: "20.00", lines: [{ sku: "WATER-600-PACK", quantity: "10.000", price: "42.5000", source: "CUSTOMER_OVERRIDE", discount: "10.00", tax: "7.00" }, { sku: "WATER-1500-PACK", quantity: "5.000", price: "46.8000", source: "PRICE_LIST", discount: "0.00", tax: "7.00" }] },
    { orderNo: "SO-202609-00003", customer: "CUS-000003", status: "DRAFT" as const, discount: "15.00", lines: [{ sku: "WATER-18L-TANK", quantity: "8.000", price: "35.7200", source: "PRICE_LIST", discount: "5.00", tax: "7.00" }] },
    { orderNo: "SO-202609-00004", customer: "CUS-000005", status: "CONFIRMED" as const, discount: "0.00", lines: [{ sku: "WATER-350-PACK", quantity: "3.000", price: "45.0000", source: "PRODUCT_DEFAULT", discount: "0.00", tax: "0.00" }] },
    { orderNo: "SO-202609-00005", customer: "CUS-000001", status: "CANCELLED" as const, discount: "0.00", lines: [{ sku: "WATER-600-PACK", quantity: "1.000", price: "55.0000", source: "PRICE_LIST", discount: "0.00", tax: "7.00" }] },
    { orderNo: "SO-202609-00006", customer: "CUS-000002", status: "COMPLETED" as const, discount: "0.00", lines: [{ sku: "WATER-350-PACK", quantity: "12.000", price: "34.2000", source: "PRICE_LIST", discount: "0.00", tax: "7.00" }] },
    { orderNo: "SO-202609-00007", customer: "CUS-000002", status: "COMPLETED" as const, discount: "0.00", lines: [{ sku: "WATER-600-PACK", quantity: "15.000", price: "42.5000", source: "CUSTOMER_OVERRIDE", discount: "0.00", tax: "7.00" }] },
    { orderNo: "SO-202609-00008", customer: "CUS-000002", status: "COMPLETED" as const, discount: "0.00", lines: [{ sku: "WATER-1500-PACK", quantity: "8.000", price: "46.8000", source: "PRICE_LIST", discount: "0.00", tax: "7.00" }] },
    { orderNo: "SO-202609-00009", customer: "CUS-000003", status: "COMPLETED" as const, discount: "5.00", lines: [{ sku: "WATER-18L-TANK", quantity: "10.000", price: "35.7200", source: "PRICE_LIST", discount: "0.00", tax: "7.00" }] },
    { orderNo: "SO-202609-00010", customer: "CUS-000003", status: "COMPLETED" as const, discount: "0.00", lines: [{ sku: "WATER-350-PACK", quantity: "6.000", price: "35.7200", source: "PRICE_LIST", discount: "0.00", tax: "7.00" }] },
  ];
  for (const definition of definitions) {
    const customer = customerByCode.get(definition.customer)!;
    const shippingAddress = customer.addresses.find((address) => address.type === "SHIPPING" && address.isDefault) ?? customer.addresses.find((address) => address.type === "SHIPPING") ?? customer.addresses[0];
    const totals = calculateSalesOrderTotals(definition.lines.map((line) => ({ quantity: line.quantity, unitPrice: line.price, discountAmount: line.discount, taxRate: line.tax })), definition.discount);
    const addressSnapshot = shippingAddress ? { label: shippingAddress.label, contactName: shippingAddress.contactName, phone: shippingAddress.phone, addressLine1: shippingAddress.addressLine1, addressLine2: shippingAddress.addressLine2, subdistrict: shippingAddress.subdistrict, district: shippingAddress.district, province: shippingAddress.province, postalCode: shippingAddress.postalCode, countryCode: shippingAddress.countryCode, deliveryNotes: shippingAddress.deliveryNotes } : undefined;
    const order = await db.salesOrder.upsert({ where: { orderNo: definition.orderNo }, update: { customerId: customer.id, warehouseId: warehouse.id, priceListId: customer.defaultPriceListId, status: definition.status, saleType: customer.defaultSaleType, customerCodeSnapshot: customer.code, customerNameSnapshot: customer.displayName, customerTypeSnapshot: customer.type, creditTermDaysSnapshot: customer.defaultSaleType === "CREDIT" ? customer.creditTermDays : 0, creditLimitSnapshot: customer.defaultSaleType === "CREDIT" ? customer.creditLimit : "0.00", orderDate: new Date("2026-09-30T00:00:00.000Z"), shippingAddress: addressSnapshot, subtotal: totals.subtotal, documentDiscountAmount: totals.documentDiscountAmount, discountAmount: totals.discountAmount, taxAmount: totals.taxAmount, totalAmount: totals.totalAmount, confirmedAt: definition.status === "CONFIRMED" ? new Date("2026-09-30T09:00:00+07:00") : null, cancelledAt: definition.status === "CANCELLED" ? new Date("2026-09-30T10:00:00+07:00") : null }, create: { orderNo: definition.orderNo, customerId: customer.id, warehouseId: warehouse.id, priceListId: customer.defaultPriceListId, status: definition.status, saleType: customer.defaultSaleType, customerCodeSnapshot: customer.code, customerNameSnapshot: customer.displayName, customerTypeSnapshot: customer.type, creditTermDaysSnapshot: customer.defaultSaleType === "CREDIT" ? customer.creditTermDays : 0, creditLimitSnapshot: customer.defaultSaleType === "CREDIT" ? customer.creditLimit : "0.00", orderDate: new Date("2026-09-30T00:00:00.000Z"), shippingAddress: addressSnapshot, subtotal: totals.subtotal, documentDiscountAmount: totals.documentDiscountAmount, discountAmount: totals.discountAmount, taxAmount: totals.taxAmount, totalAmount: totals.totalAmount, confirmedAt: definition.status === "CONFIRMED" ? new Date("2026-09-30T09:00:00+07:00") : null, cancelledAt: definition.status === "CANCELLED" ? new Date("2026-09-30T10:00:00+07:00") : null } });
    if (!await db.invoice.count({ where: { salesOrderId: order.id } })) {
      await db.salesOrderItem.deleteMany({ where: { salesOrderId: order.id } });
      await db.salesOrderItem.createMany({ data: definition.lines.map((line, index) => { const unit = unitBySku.get(line.sku)!; return { salesOrderId: order.id, lineNo: index + 1, productId: unit.productId, productUnitId: unit.id, sku: unit.product.sku, description: unit.product.name, productNameSnapshot: unit.product.name, skuSnapshot: unit.product.sku, unitNameSnapshot: unit.unit.nameTh, quantity: line.quantity, conversionFactor: unit.conversionFactor, baseQuantity: line.quantity, fulfilledQuantity: definition.status === "COMPLETED" ? line.quantity : "0.000", unitPrice: line.price, resolvedUnitPrice: line.price, priceSource: line.source, isPriceOverridden: false, lineSubtotal: totals.lines[index]!.lineSubtotal, discountAmount: line.discount, taxRate: line.tax, taxAmount: totals.lines[index]!.taxAmount, lineTotal: totals.lines[index]!.lineTotal }; }) });
    }
    await db.salesOrderStatusHistory.deleteMany({ where: { salesOrderId: order.id } });
    await db.salesOrderStatusHistory.create({ data: { salesOrderId: order.id, fromStatus: definition.status === "DRAFT" ? null : "DRAFT", toStatus: definition.status, changedByName: "ข้อมูลตัวอย่าง", note: definition.status === "CANCELLED" ? "ยกเลิกเพื่อทดสอบขั้นตอนงาน" : "ข้อมูลตัวอย่าง Phase 7" } });
  }
  await db.documentSequence.upsert({ where: { key: "SALES_ORDER-202609" }, update: { currentValue: 10 }, create: { key: "SALES_ORDER-202609", currentValue: 10 } });
}

async function seedAccounting() {
  const orders = await db.salesOrder.findMany({ where: { orderNo: { in: ["SO-202609-00006", "SO-202609-00007", "SO-202609-00008", "SO-202609-00009", "SO-202609-00010"] } }, include: { customer: true, items: { orderBy: { lineNo: "asc" } } }, orderBy: { orderNo: "asc" } });
  const definitions = [
    { invoiceNo: "INV-202610-00001", orderNo: "SO-202609-00006", status: "ISSUED" as const, invoiceDate: "2026-10-01", dueDate: "2026-10-31" },
    { invoiceNo: "INV-202608-00001", orderNo: "SO-202609-00007", status: "OVERDUE" as const, invoiceDate: "2026-08-16", dueDate: "2026-09-15" },
    { invoiceNo: "INV-202608-00002", orderNo: "SO-202609-00008", status: "PAID" as const, invoiceDate: "2026-08-01", dueDate: "2026-08-31" },
    { invoiceNo: "INV-202607-00001", orderNo: "SO-202609-00009", status: "OVERDUE" as const, invoiceDate: "2026-07-16", dueDate: "2026-08-15" },
    { invoiceNo: "INV-202605-00001", orderNo: "SO-202609-00010", status: "OVERDUE" as const, invoiceDate: "2026-05-16", dueDate: "2026-06-15" },
  ];
  for (const definition of definitions) {
    if (await db.invoice.findUnique({ where: { invoiceNo: definition.invoiceNo }, select: { id: true } })) continue;
    const order = orders.find((item) => item.orderNo === definition.orderNo)!;
    const invoice = await db.invoice.create({ data: { invoiceNo: definition.invoiceNo, customerId: order.customerId, salesOrderId: order.id, status: "DRAFT", customerCodeSnapshot: order.customerCodeSnapshot, customerNameSnapshot: order.customerNameSnapshot, taxIdSnapshot: order.customer.taxId, taxBranchCodeSnapshot: order.customer.taxBranchCode, creditTermDaysSnapshot: order.creditTermDaysSnapshot, invoiceDate: new Date(`${definition.invoiceDate}T00:00:00.000Z`), dueDate: new Date(`${definition.dueDate}T00:00:00.000Z`), currency: order.currency, billingAddress: order.billingAddress ?? order.shippingAddress ?? undefined, subtotal: order.subtotal, discountAmount: order.discountAmount, taxAmount: order.taxAmount, totalAmount: order.totalAmount, notes: "ข้อมูลตัวอย่าง Phase 10", issuedAt: new Date(`${definition.invoiceDate}T09:00:00+07:00`), items: { create: order.items.map((item) => ({ lineNo: item.lineNo, salesOrderItemId: item.id, productId: item.productId, productUnitId: item.productUnitId, description: item.description, productNameSnapshot: item.productNameSnapshot, skuSnapshot: item.skuSnapshot, unitNameSnapshot: item.unitNameSnapshot, quantity: item.quantity, unitPrice: item.unitPrice, lineSubtotal: item.lineSubtotal, discountAmount: item.discountAmount, taxRate: item.taxRate, taxAmount: item.taxAmount, lineTotal: item.lineTotal })) } } });
    await db.invoice.update({ where: { id: invoice.id }, data: { status: definition.status } });
  }
  const invoices = await db.invoice.findMany({ where: { invoiceNo: { in: definitions.map((item) => item.invoiceNo) } }, orderBy: { invoiceNo: "asc" } });
  const byNo = new Map(invoices.map((invoice) => [invoice.invoiceNo, invoice]));
  const currentInvoice = byNo.get("INV-202610-00001")!; const partialInvoice = byNo.get("INV-202608-00001")!; const paidInvoice = byNo.get("INV-202608-00002")!; const multiA = byNo.get("INV-202607-00001")!; const multiB = byNo.get("INV-202605-00001")!;
  const paymentDefinitions = [
    { paymentNo: "PAY-202609-00001", customerId: partialInvoice.customerId, date: "2026-09-20", amount: "100.00", allocations: [{ invoiceId: partialInvoice.id, amount: "100.00" }] },
    { paymentNo: "PAY-202609-00002", customerId: paidInvoice.customerId, date: "2026-09-01", amount: paidInvoice.totalAmount.toString(), allocations: [{ invoiceId: paidInvoice.id, amount: paidInvoice.totalAmount.toString() }] },
    { paymentNo: "PAY-202609-00003", customerId: multiA.customerId, date: "2026-09-25", amount: "75.00", allocations: [{ invoiceId: multiA.id, amount: "25.00" }, { invoiceId: multiB.id, amount: "25.00" }] },
  ];
  for (const definition of paymentDefinitions) { if (await db.payment.findUnique({ where: { paymentNo: definition.paymentNo }, select: { id: true } })) continue; const payment = await db.payment.create({ data: { paymentNo: definition.paymentNo, customerId: definition.customerId, status: "PENDING", method: "BANK_TRANSFER", paymentDate: new Date(`${definition.date}T00:00:00.000Z`), amount: definition.amount, externalReference: `SEED-${definition.paymentNo}`, notes: "ข้อมูลตัวอย่าง Phase 10", allocations: { create: definition.allocations } } }); await db.payment.update({ where: { id: payment.id }, data: { status: "COMPLETED", completedAt: new Date(`${definition.date}T10:00:00+07:00`) } }); }
  if (!await db.billingNote.findUnique({ where: { billingNo: "BL-202609-00001" }, select: { id: true } })) { const amountA = calculateOutstanding(partialInvoice.totalAmount.toString(), ["100.00"]); const amountB = currentInvoice.totalAmount.toString(); const billing = await db.billingNote.create({ data: { billingNo: "BL-202609-00001", customerId: partialInvoice.customerId, status: "DRAFT", billingDate: new Date("2026-09-30T00:00:00.000Z"), dueDate: new Date("2026-10-15T00:00:00.000Z"), totalAmount: addMoney([amountA, amountB]), notes: "ใบวางบิลตัวอย่างหลายใบแจ้งหนี้", invoices: { create: [{ invoiceId: partialInvoice.id, amount: amountA }, { invoiceId: currentInvoice.id, amount: amountB }] } } }); await db.billingNote.update({ where: { id: billing.id }, data: { status: "ISSUED", issuedAt: new Date("2026-09-30T09:00:00+07:00") } }); }
  for (const [key, value] of [["INVOICE-202610", 1], ["INVOICE-202608", 2], ["INVOICE-202607", 1], ["INVOICE-202605", 1], ["PAYMENT-202609", 3], ["BILLING_NOTE-202609", 1]] as const) await db.documentSequence.upsert({ where: { key }, update: { currentValue: value }, create: { key, currentValue: value } });
}

async function seedInventory() {
  const mainWarehouse = await db.warehouse.findUniqueOrThrow({ where: { code: "MAIN" }, select: { id: true } });
  const factoryWarehouse = await db.warehouse.upsert({ where: { code: "FACTORY" }, update: { name: "โรงงาน", type: "STORAGE", status: "ACTIVE" }, create: { code: "FACTORY", name: "โรงงาน", type: "STORAGE", status: "ACTIVE" } });
  await db.warehouse.upsert({ where: { code: "DAMAGED" }, update: { name: "คลังสินค้าชำรุด", type: "STORAGE", status: "ACTIVE" }, create: { code: "DAMAGED", name: "คลังสินค้าชำรุด", type: "STORAGE", status: "ACTIVE" } });
  const vehicleWarehouse = await db.warehouse.upsert({ where: { code: "VEH-TRUCK01" }, update: { name: "คลังรถ 1กข 1234", type: "VEHICLE", status: "ACTIVE", isDefault: false }, create: { code: "VEH-TRUCK01", name: "คลังรถ 1กข 1234", type: "VEHICLE", status: "ACTIVE", isDefault: false } });
  await db.vehicle.upsert({ where: { code: "TRUCK01" }, update: { registrationNumber: "1กข 1234", description: "รถจัดส่งตัวอย่าง", status: "ACTIVE", warehouseId: vehicleWarehouse.id }, create: { code: "TRUCK01", registrationNumber: "1กข 1234", description: "รถจัดส่งตัวอย่าง", status: "ACTIVE", warehouseId: vehicleWarehouse.id } });
  const products = await db.product.findMany({ where: { sku: { in: ["WATER-350-PACK", "WATER-600-PACK", "WATER-1500-PACK"] } }, select: { id: true, sku: true } });
  const bySku = new Map(products.map((product) => [product.sku, product.id]));
  const definitions = [
    { movementNo: "STK-202609-00001", type: "OPENING" as const, occurredAt: new Date("2026-09-30T07:00:00+07:00"), destinationWarehouseId: mainWarehouse.id, referenceType: "OPENING_BALANCE", notes: "ยอดยกมาตัวอย่าง", entries: [[mainWarehouse.id, bySku.get("WATER-350-PACK")!, "120.000"], [mainWarehouse.id, bySku.get("WATER-600-PACK")!, "160.000"], [mainWarehouse.id, bySku.get("WATER-1500-PACK")!, "80.000"]] as const },
    { movementNo: "STK-202609-00002", type: "OPENING" as const, occurredAt: new Date("2026-09-30T07:10:00+07:00"), destinationWarehouseId: factoryWarehouse.id, referenceType: "OPENING_BALANCE", notes: "ยอดยกมาโรงงาน", entries: [[factoryWarehouse.id, bySku.get("WATER-350-PACK")!, "40.000"], [factoryWarehouse.id, bySku.get("WATER-600-PACK")!, "60.000"]] as const },
    { movementNo: "STK-202609-00003", type: "ADJUSTMENT" as const, occurredAt: new Date("2026-09-30T08:00:00+07:00"), destinationWarehouseId: mainWarehouse.id, referenceType: "STOCK_ADJUSTMENT", notes: "พบสินค้าเพิ่ม — ตัวอย่างการปรับปรุงสต็อก", entries: [[mainWarehouse.id, bySku.get("WATER-350-PACK")!, "5.000"]] as const },
    { movementNo: "STK-202609-00004", type: "TRANSFER" as const, occurredAt: new Date("2026-09-30T08:30:00+07:00"), sourceWarehouseId: mainWarehouse.id, destinationWarehouseId: factoryWarehouse.id, referenceType: "STOCK_TRANSFER", notes: "ตัวอย่างการโอนย้ายสต็อก", entries: [[mainWarehouse.id, bySku.get("WATER-600-PACK")!, "-10.000"], [factoryWarehouse.id, bySku.get("WATER-600-PACK")!, "10.000"]] as const },
  ];
  for (const definition of definitions) await db.$transaction(async (tx) => {
    if (await tx.inventoryMovement.findUnique({ where: { movementNo: definition.movementNo }, select: { id: true } })) return;
    const movement = await tx.inventoryMovement.create({ data: { movementNo: definition.movementNo, type: definition.type, occurredAt: definition.occurredAt, sourceWarehouseId: "sourceWarehouseId" in definition ? definition.sourceWarehouseId : undefined, destinationWarehouseId: definition.destinationWarehouseId, referenceType: definition.referenceType, referenceId: definition.movementNo, notes: definition.notes }, select: { id: true } });
    for (const [warehouseId, productId, quantity] of definition.entries) await tx.inventoryLedgerEntry.create({ data: { movementId: movement.id, warehouseId, productId, quantity } });
  });
  await db.$executeRaw`INSERT INTO "document_sequences" ("key", "currentValue", "updatedAt") VALUES ('INVENTORY_MOVEMENT-202609', 4, CURRENT_TIMESTAMP) ON CONFLICT ("key") DO UPDATE SET "currentValue" = GREATEST("document_sequences"."currentValue", 4), "updatedAt" = CURRENT_TIMESTAMP`;
}

async function main() {
  const command = process.argv[2] ?? "bootstrap";
  if (command !== "bootstrap" && command !== "demo") throw new Error("Seed command must be bootstrap or demo");
  if (command === "demo") assertDemoSeedAllowed();
  await seedAuthorization();
  await ensureInitialOwner();
  if (command === "demo") {
    const password = process.env.AQUAOPS_DEV_SEED_PASSWORD;
    if (!password || password.length < 12) throw new Error("AQUAOPS_DEV_SEED_PASSWORD must contain at least 12 characters");
    const users: [string, string, SystemRoleCode][] = [["owner@aquaops.local", "เจ้าของกิจการ (ทดสอบ)", "OWNER"], ["admin@aquaops.local", "ผู้ดูแลระบบ (ทดสอบ)", "ADMIN"], ["sales@aquaops.local", "ฝ่ายขาย (ทดสอบ)", "SALES"], ["accounting@aquaops.local", "ฝ่ายบัญชี (ทดสอบ)", "ACCOUNTING"], ["warehouse@aquaops.local", "ฝ่ายคลัง (ทดสอบ)", "WAREHOUSE"], ["delivery@aquaops.local", "ฝ่ายจัดส่ง (ทดสอบ)", "DELIVERY"], ["viewer@aquaops.local", "ผู้ดูข้อมูล (ทดสอบ)", "VIEWER"]];
    for (const [email, name, roleCode] of users) {
      if (!await db.user.findUnique({ where: { email }, select: { id: true } })) await createCredentialUser({ email, name, password, roleCode });
    }
    await seedCustomerData();
    await seedCatalogPricing();
    await seedSalesOrders();
    await seedInventory();
    await seedAccounting();
  }
}

main().finally(() => db.$disconnect());
