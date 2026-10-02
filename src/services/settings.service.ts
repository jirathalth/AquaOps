import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { APP_NAME, BUSINESS_TIMEZONE } from "@/constants/app";
import * as repository from "@/repositories/settings.repository";
import { getSystemHealth } from "@/services/system.service";
import type { DocumentSettingsValues, FinanceSettingsValues, GeneralSettingsValues, InventoryDeliverySettingsValues, LocalizationSettingsValues, SalesSettingsValues } from "@/validations/settings";
import packageJson from "../../package.json";

export class SettingsRuleError extends Error { constructor(message: string) { super(message); this.name = "SettingsRuleError"; } }
export class SettingsConflictError extends SettingsRuleError { constructor() { super("การตั้งค่าถูกแก้ไขโดยผู้ดูแลระบบคนอื่น กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง"); this.name = "SettingsConflictError"; } }
type Actor = { id: string | null; name: string };
type Group = "general" | "sales" | "documents" | "inventory-delivery" | "finance" | "localization";

const required = async (client?: repository.SettingsClient) => { const row = await repository.findSettings(client); if (!row) throw new SettingsRuleError("ไม่พบการตั้งค่าระบบ กรุณาตรวจสอบ migration และลองอีกครั้ง"); return row; };
const nullable = (value: string) => value || null;
const json = (value: Record<string, unknown>) => value as Prisma.InputJsonValue;
const actorData = (actor: Actor) => ({ actorId: actor.id, actorName: actor.name });
const dateKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TIMEZONE, year: "numeric", month: "2-digit" }).format(new Date()).replace("-", "");

export async function getBusinessSettings(client?: repository.SettingsClient) { const row = await required(client); return { businessName: row.businessName, legalName: row.legalName, taxId: row.taxId, branch: row.branch, addressLine: row.addressLine, subdistrict: row.subdistrict, district: row.district, province: row.province, postalCode: row.postalCode, phone: row.phone, email: row.email, website: row.website, logoUrl: row.logoUrl }; }
export async function getSalesSettings(client?: repository.SettingsClient) { const row = await required(client); return { defaultPriceListId: row.defaultPriceListId, defaultCreditTermDays: row.defaultCreditTermDays, defaultVatRate: row.defaultVatRate.toFixed(2), allowManualPriceOverride: row.allowManualPriceOverride }; }
export async function getDocumentSettings(client?: repository.SettingsClient) { const row = await required(client); return { salesOrderPrefix: row.salesOrderPrefix, deliveryTripPrefix: row.deliveryTripPrefix, inventoryMovementPrefix: row.inventoryMovementPrefix, invoicePrefix: row.invoicePrefix, billingNotePrefix: row.billingNotePrefix, paymentPrefix: row.paymentPrefix, showTaxIdOnDocuments: row.showTaxIdOnDocuments, showAddressOnDocuments: row.showAddressOnDocuments, documentFooter: row.documentFooter, paymentInstructions: row.paymentInstructions }; }
export async function getInventoryDeliverySettings(client?: repository.SettingsClient) { const row = await required(client); return { defaultWarehouseId: row.defaultWarehouseId, defaultDeliverySourceWarehouseId: row.defaultDeliverySourceWarehouseId }; }
export async function getFinanceSettings(client?: repository.SettingsClient) { const row = await required(client); return { defaultPaymentMethod: row.defaultPaymentMethod, billingInstructions: row.billingInstructions }; }
export async function getLocalizationSettings(client?: repository.SettingsClient) { const row = await required(client); return { locale: row.locale, currency: row.currency, timezone: row.timezone }; }

function plain(row: Awaited<ReturnType<typeof required>>) { return {
  version: row.version,
  general: { businessName: row.businessName, legalName: row.legalName ?? "", taxId: row.taxId ?? "", branch: row.branch ?? "", addressLine: row.addressLine ?? "", subdistrict: row.subdistrict ?? "", district: row.district ?? "", province: row.province ?? "", postalCode: row.postalCode ?? "", phone: row.phone ?? "", email: row.email ?? "", website: row.website ?? "", logoUrl: row.logoUrl ?? "" },
  sales: { defaultPriceListId: row.defaultPriceListId ?? "", defaultCreditTermDays: row.defaultCreditTermDays, defaultVatRate: row.defaultVatRate.toFixed(2), allowManualPriceOverride: row.allowManualPriceOverride },
  documents: { salesOrderPrefix: row.salesOrderPrefix, deliveryTripPrefix: row.deliveryTripPrefix, inventoryMovementPrefix: row.inventoryMovementPrefix, invoicePrefix: row.invoicePrefix, billingNotePrefix: row.billingNotePrefix, paymentPrefix: row.paymentPrefix, showTaxIdOnDocuments: row.showTaxIdOnDocuments, showAddressOnDocuments: row.showAddressOnDocuments, documentFooter: row.documentFooter ?? "", paymentInstructions: row.paymentInstructions ?? "" },
  inventoryDelivery: { defaultWarehouseId: row.defaultWarehouseId ?? "", defaultDeliverySourceWarehouseId: row.defaultDeliverySourceWarehouseId ?? "" },
  finance: { defaultPaymentMethod: row.defaultPaymentMethod, billingInstructions: row.billingInstructions ?? "" },
  localization: { locale: row.locale as "th-TH", currency: row.currency as "THB", timezone: row.timezone as "Asia/Bangkok" },
}; }

export async function getSettingsPageData() {
  const row = await required(); const [options, sequences, health] = await Promise.all([repository.listSettingsOptions(), repository.listCurrentSequences(dateKey()), getSystemHealth()]);
  const [priceLists, warehouses] = options; const counters = Object.fromEntries(sequences.map((sequence) => [sequence.key.split("-").slice(0, -1).join("-"), sequence.currentValue]));
  return { ...plain(row), options: { priceLists, warehouses }, counters, system: { applicationName: APP_NAME, version: packageJson.version, environment: process.env.NODE_ENV === "production" ? "Production" : "Development", application: health.status === "ok" ? "Healthy" : "Degraded", database: health.database === "connected" ? "Connected" : "Unavailable" } };
}

async function mutate(group: Group, version: number, data: Prisma.BusinessSettingUncheckedUpdateManyInput, beforeKeys: readonly string[], actor: Actor, validate?: (tx: repository.SettingsTransaction, current: Awaited<ReturnType<typeof required>>) => Promise<void>) {
  return repository.withSettingsTransaction(async (tx) => {
    const current = await required(tx); if (current.version !== version) throw new SettingsConflictError(); if (validate) await validate(tx, current);
    const before = Object.fromEntries(beforeKeys.map((key) => [key, current[key as keyof typeof current] instanceof Prisma.Decimal ? (current[key as keyof typeof current] as Prisma.Decimal).toString() : current[key as keyof typeof current]]));
    const changed = await repository.updateSettings(tx, version, data); if (changed.count !== 1) throw new SettingsConflictError(); const updated = await required(tx);
    const after = Object.fromEntries(beforeKeys.map((key) => [key, updated[key as keyof typeof updated] instanceof Prisma.Decimal ? (updated[key as keyof typeof updated] as Prisma.Decimal).toString() : updated[key as keyof typeof updated]]));
    await repository.createSettingsAudit(tx, { ...actorData(actor), action: "SETTINGS_UPDATED", entityType: "BusinessSetting", entityId: `${repository.SETTINGS_ID}:${group}`, beforeData: json(before), afterData: json(after), metadata: json({ group }) });
    return updated.version;
  });
}

export function updateGeneralSettings(input: GeneralSettingsValues, actor: Actor) { const { version, ...value } = input; const keys = Object.keys(value); return mutate("general", version, Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typeof item === "string" && key !== "businessName" ? nullable(item) : item])), keys, actor); }
export function updateSalesSettings(input: SalesSettingsValues, actor: Actor) { const { version, ...value } = input; return mutate("sales", version, { ...value, defaultPriceListId: nullable(value.defaultPriceListId), defaultVatRate: value.defaultVatRate }, Object.keys(value), actor, async (tx) => { if (value.defaultPriceListId && !await repository.findActivePriceList(tx, value.defaultPriceListId)) throw new SettingsRuleError("รายการราคาที่เลือกไม่ได้เปิดใช้งาน"); }); }
export function updateInventoryDeliverySettings(input: InventoryDeliverySettingsValues, actor: Actor) { const { version, ...value } = input; return mutate("inventory-delivery", version, { defaultWarehouseId: nullable(value.defaultWarehouseId), defaultDeliverySourceWarehouseId: nullable(value.defaultDeliverySourceWarehouseId) }, Object.keys(value), actor, async (tx) => { for (const id of [value.defaultWarehouseId, value.defaultDeliverySourceWarehouseId].filter(Boolean)) if (!await repository.findActiveStorageWarehouse(tx, id)) throw new SettingsRuleError("คลังสินค้าที่เลือกไม่ได้เปิดใช้งานหรือไม่ใช่คลังจัดเก็บ"); }); }
export function updateFinanceSettings(input: FinanceSettingsValues, actor: Actor) { const { version, ...value } = input; return mutate("finance", version, { ...value, billingInstructions: nullable(value.billingInstructions) }, Object.keys(value), actor); }
export function updateLocalizationSettings(input: LocalizationSettingsValues, actor: Actor) { const { version, ...value } = input; return mutate("localization", version, value, Object.keys(value), actor); }

export function updateDocumentSettings(input: DocumentSettingsValues, actor: Actor) {
  const { version, ...value } = input; const mappings = [{ field: "salesOrderPrefix", type: "SALES_ORDER" }, { field: "deliveryTripPrefix", type: "DELIVERY_TRIP" }, { field: "inventoryMovementPrefix", type: "INVENTORY_MOVEMENT" }, { field: "invoicePrefix", type: "INVOICE" }, { field: "billingNotePrefix", type: "BILLING_NOTE" }, { field: "paymentPrefix", type: "PAYMENT" }] as const;
  return mutate("documents", version, { ...value, documentFooter: nullable(value.documentFooter), paymentInstructions: nullable(value.paymentInstructions) }, Object.keys(value), actor, async (tx, current) => { for (const mapping of mappings) if (value[mapping.field] !== current[mapping.field] && await repository.prefixUsedByOtherDocument(tx, value[mapping.field], mapping.type)) throw new SettingsRuleError(`คำนำหน้า ${value[mapping.field]} เคยใช้กับเอกสารประเภทอื่น จึงไม่สามารถนำมาใช้ซ้ำได้`); });
}
