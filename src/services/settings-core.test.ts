import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { documentSettingsSchema, localizationSettingsSchema, salesSettingsSchema } from "@/validations/settings";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
const migration = readFileSync(resolve(process.cwd(), "prisma/migrations/20261002000000_system_settings/migration.sql"), "utf8");
const service = readFileSync(resolve(process.cwd(), "src/services/settings.service.ts"), "utf8");
const actions = readFileSync(resolve(process.cwd(), "src/features/settings/actions.ts"), "utf8");

describe("Phase 13 settings boundaries", () => {
  it("uses a typed singleton with references to master data", () => { expect(schema).toContain("model BusinessSetting"); expect(schema).toContain("defaultPriceListId"); expect(schema).toContain("defaultWarehouseId"); expect(schema).not.toContain("databaseUrl"); expect(schema).not.toContain("authSecret"); expect(migration).toContain("business_settings_singleton_check"); });
  it("keeps settings updates authorized, transactional, versioned, and audited", () => { expect(actions).toContain('requirePermission("settings.manage")'); expect(service).toContain("withSettingsTransaction"); expect(service).toContain("SettingsConflictError"); expect(service).toContain('action: "SETTINGS_UPDATED"'); expect(service).toContain("beforeData"); expect(service).toContain("afterData"); });
  it("migrates document counters to prefix-independent identities", () => { for (const key of ["SALES_ORDER", "DELIVERY_TRIP", "INVENTORY_MOVEMENT", "INVOICE", "BILLING_NOTE", "PAYMENT"]) expect(migration).toContain(key); expect(migration).not.toContain("MAX("); });
});

describe("settings validation", () => {
  it("accepts Decimal-safe VAT strings and rejects out-of-range or overly precise values", () => { const base = { version: 1, defaultPriceListId: "", defaultCreditTermDays: 30, allowManualPriceOverride: true }; expect(salesSettingsSchema.safeParse({ ...base, defaultVatRate: "7.00" }).success).toBe(true); expect(salesSettingsSchema.safeParse({ ...base, defaultVatRate: "7.001" }).success).toBe(false); expect(salesSettingsSchema.safeParse({ ...base, defaultVatRate: "100.01" }).success).toBe(false); });
  it("rejects duplicate and unsafe document prefixes", () => { const base = { version: 1, salesOrderPrefix: "SO", deliveryTripPrefix: "DL", inventoryMovementPrefix: "STK", invoicePrefix: "INV", billingNotePrefix: "BL", paymentPrefix: "PAY", showTaxIdOnDocuments: true, showAddressOnDocuments: true, documentFooter: "", paymentInstructions: "" }; expect(documentSettingsSchema.safeParse(base).success).toBe(true); expect(documentSettingsSchema.safeParse({ ...base, invoicePrefix: "SO" }).success).toBe(false); expect(documentSettingsSchema.safeParse({ ...base, invoicePrefix: "INV X" }).success).toBe(false); });
  it("keeps localization within supported business semantics", () => { expect(localizationSettingsSchema.safeParse({ version: 1, locale: "th-TH", currency: "THB", timezone: "Asia/Bangkok" }).success).toBe(true); expect(localizationSettingsSchema.safeParse({ version: 1, locale: "en-US", currency: "USD", timezone: "UTC" }).success).toBe(false); });
});
