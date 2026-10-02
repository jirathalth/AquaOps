import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type SettingsTransaction = Prisma.TransactionClient;
export type SettingsClient = typeof db | SettingsTransaction;
export const SETTINGS_ID = "default";

export function findSettings(client: SettingsClient = db) { return client.businessSetting.findUnique({ where: { id: SETTINGS_ID } }); }
export function listSettingsOptions() { return Promise.all([
  db.priceList.findMany({ where: { status: "ACTIVE" }, select: { id: true, code: true, name: true }, orderBy: { name: "asc" } }),
  db.warehouse.findMany({ where: { status: "ACTIVE", type: "STORAGE" }, select: { id: true, code: true, name: true, isDefault: true }, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
]); }
export function updateSettings(tx: SettingsTransaction, version: number, data: Prisma.BusinessSettingUncheckedUpdateManyInput) { return tx.businessSetting.updateMany({ where: { id: SETTINGS_ID, version }, data: { ...data, version: { increment: 1 } } }); }
export function createSettingsAudit(tx: SettingsTransaction, data: Prisma.AuditLogUncheckedCreateInput) { return tx.auditLog.create({ data }); }
export function findActivePriceList(tx: SettingsTransaction, id: string) { return tx.priceList.findFirst({ where: { id, status: "ACTIVE" }, select: { id: true, code: true, name: true } }); }
export function findActiveStorageWarehouse(tx: SettingsTransaction, id: string) { return tx.warehouse.findFirst({ where: { id, status: "ACTIVE", type: "STORAGE" }, select: { id: true, code: true, name: true } }); }
export function listCurrentSequences(yearMonth: string) { return db.documentSequence.findMany({ where: { key: { in: ["SALES_ORDER", "DELIVERY_TRIP", "INVENTORY_MOVEMENT", "INVOICE", "BILLING_NOTE", "PAYMENT"].map((type) => `${type}-${yearMonth}`) } }, select: { key: true, currentValue: true, updatedAt: true } }); }
export async function prefixUsedByOtherDocument(tx: SettingsTransaction, prefix: string, ownType: string) {
  const startsWith = `${prefix}-`;
  if (ownType !== "SALES_ORDER" && await tx.salesOrder.count({ where: { orderNo: { startsWith } } })) return true;
  if (ownType !== "DELIVERY_TRIP" && await tx.deliveryTrip.count({ where: { tripNo: { startsWith } } })) return true;
  if (ownType !== "INVENTORY_MOVEMENT" && await tx.inventoryMovement.count({ where: { movementNo: { startsWith } } })) return true;
  if (ownType !== "INVOICE" && await tx.invoice.count({ where: { invoiceNo: { startsWith } } })) return true;
  if (ownType !== "BILLING_NOTE" && await tx.billingNote.count({ where: { billingNo: { startsWith } } })) return true;
  if (ownType !== "PAYMENT" && await tx.payment.count({ where: { paymentNo: { startsWith } } })) return true;
  return false;
}
export function withSettingsTransaction<T>(operation: (tx: SettingsTransaction) => Promise<T>) { return db.$transaction(operation, { isolationLevel: "Serializable" }); }
