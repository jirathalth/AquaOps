import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { MovementListQuery, StockListQuery, WarehouseListQuery } from "@/validations/inventory";

export type InventoryTransaction = Prisma.TransactionClient;
const warehouseSelect = { id: true, code: true, name: true, type: true, status: true, isDefault: true } satisfies Prisma.WarehouseSelect;
const productUnitSelect = { id: true, productId: true, barcode: true, conversionFactor: true, product: { select: { id: true, sku: true, name: true, status: true, trackInventory: true, deletedAt: true } }, unit: { select: { id: true, nameTh: true, symbol: true, decimalScale: true, isActive: true } } } satisfies Prisma.ProductUnitSelect;

export async function findWarehouses(query: WarehouseListQuery) {
  const where: Prisma.WarehouseWhereInput = { ...(query.q ? { OR: [{ code: { contains: query.q, mode: "insensitive" } }, { name: { contains: query.q, mode: "insensitive" } }] } : {}), ...(query.status === "ALL" ? {} : { status: query.status }) };
  const orderBy: Prisma.WarehouseOrderByWithRelationInput = { [query.sort]: query.order };
  const [rows, total] = await db.$transaction([db.warehouse.findMany({ where, select: { ...warehouseSelect, createdAt: true, updatedAt: true, _count: { select: { stockBalances: true, inventoryEntries: true } } }, orderBy: [orderBy, { id: "asc" }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }), db.warehouse.count({ where })]);
  return { rows, total };
}
export function listWarehouses(status?: "ACTIVE" | "INACTIVE") { return db.warehouse.findMany({ where: status ? { status } : undefined, select: warehouseSelect, orderBy: [{ isDefault: "desc" }, { name: "asc" }] }); }
export function findWarehouseById(id: string, client: InventoryTransaction = db) { return client.warehouse.findUnique({ where: { id }, select: { ...warehouseSelect, _count: { select: { inventoryEntries: true, stockBalances: true } } } }); }
export function createWarehouse(tx: InventoryTransaction, data: Prisma.WarehouseCreateInput) { return tx.warehouse.create({ data, select: warehouseSelect }); }
export function updateWarehouse(tx: InventoryTransaction, id: string, data: Prisma.WarehouseUpdateInput) { return tx.warehouse.update({ where: { id }, data, select: warehouseSelect }); }
export function clearDefaultWarehouse(tx: InventoryTransaction, exceptId?: string) { return tx.warehouse.updateMany({ where: { isDefault: true, ...(exceptId ? { id: { not: exceptId } } : {}) }, data: { isDefault: false } }); }

export function listInventoryProductUnits() { return db.productUnit.findMany({ where: { isBase: true, isActive: true, unit: { isActive: true }, product: { status: "ACTIVE", deletedAt: null, trackInventory: true } }, select: productUnitSelect, orderBy: [{ product: { name: "asc" } }, { product: { sku: "asc" } }] }); }
export function findInventoryProductUnit(id: string, tx: InventoryTransaction) { return tx.productUnit.findFirst({ where: { id, isBase: true, isActive: true, unit: { isActive: true }, product: { status: "ACTIVE", deletedAt: null, trackInventory: true } }, select: productUnitSelect }); }

export function findStockBalances(query: StockListQuery) {
  return db.stockBalance.findMany({ where: { ...(query.warehouseId === "ALL" ? {} : { warehouseId: query.warehouseId }), product: { trackInventory: true, deletedAt: null, ...(query.productStatus === "ALL" ? {} : { status: query.productStatus }), ...(query.categoryId === "ALL" ? {} : { categoryId: query.categoryId }), ...(query.q ? { OR: [{ sku: { contains: query.q, mode: "insensitive" } }, { name: { contains: query.q, mode: "insensitive" } }, { units: { some: { barcode: { contains: query.q, mode: "insensitive" } } } }] } : {}) } }, include: { warehouse: { select: warehouseSelect }, product: { select: { id: true, sku: true, name: true, status: true, reorderLevel: true, categoryId: true, category: { select: { name: true } }, units: { where: { isBase: true }, take: 1, select: { barcode: true, unit: { select: { nameTh: true, symbol: true } } } } } } } });
}
export function findLastMovements(keys: { warehouseId: string; productId: string }[]) { return keys.length ? db.inventoryLedgerEntry.groupBy({ by: ["warehouseId", "productId"], where: { OR: keys }, _max: { createdAt: true } }) : Promise.resolve([]); }
export function listStockFilterOptions() { return Promise.all([listWarehouses(), db.productCategory.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }), db.product.findMany({ where: { trackInventory: true, deletedAt: null }, select: { id: true, sku: true, name: true }, orderBy: [{ name: "asc" }, { sku: "asc" }] })]); }
export function findProductStock(productId: string) { return db.product.findFirst({ where: { id: productId, trackInventory: true, deletedAt: null }, select: { id: true, sku: true, name: true, status: true, reorderLevel: true, category: { select: { name: true } }, units: { where: { isBase: true }, take: 1, select: { barcode: true, unit: { select: { nameTh: true, symbol: true } } } }, stockBalances: { include: { warehouse: { select: warehouseSelect } }, orderBy: { warehouse: { name: "asc" } } }, inventoryEntries: { include: { warehouse: { select: { name: true } }, movement: { select: { movementNo: true, type: true, occurredAt: true, referenceType: true, referenceId: true, notes: true, createdBy: { select: { name: true } } } } }, orderBy: { createdAt: "desc" }, take: 20 } } }); }

export function findMovementEntries(query: MovementListQuery) {
  const where: Prisma.InventoryLedgerEntryWhereInput = {
    ...(query.warehouseId === "ALL" ? {} : { warehouseId: query.warehouseId }),
    ...(query.productId === "ALL" ? {} : { productId: query.productId }),
    ...(query.q ? { OR: [{ movement: { movementNo: { contains: query.q, mode: "insensitive" } } }, { movement: { referenceId: { contains: query.q, mode: "insensitive" } } }, { product: { sku: { contains: query.q, mode: "insensitive" } } }, { product: { name: { contains: query.q, mode: "insensitive" } } }] } : {}),
    movement: {
      ...(query.type === "ALL" ? {} : { type: query.type }),
      ...((query.dateFrom || query.dateTo) ? { occurredAt: { ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00+07:00`) } : {}), ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59.999+07:00`) } : {}) } } : {}),
    },
  };
  const orderBy: Prisma.InventoryLedgerEntryOrderByWithRelationInput = query.sort === "movementNo" ? { movement: { movementNo: query.order } } : query.sort === "product" ? { product: { name: query.order } } : query.sort === "warehouse" ? { warehouse: { name: query.order } } : query.sort === "quantity" ? { quantity: query.order } : { movement: { occurredAt: query.order } };
  return Promise.all([db.inventoryLedgerEntry.findMany({ where, include: { warehouse: { select: { id: true, name: true } }, product: { select: { id: true, sku: true, name: true, units: { where: { isBase: true }, take: 1, select: { unit: { select: { nameTh: true, symbol: true } } } } } }, movement: { include: { createdBy: { select: { name: true } } } } }, orderBy: [orderBy, { id: "asc" }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }), db.inventoryLedgerEntry.count({ where })]);
}

export async function nextInventoryMovementNumber(tx: InventoryTransaction, yearMonth: string) { const sequence = await tx.documentSequence.upsert({ where: { key: `STK-${yearMonth}` }, create: { key: `STK-${yearMonth}`, currentValue: 1 }, update: { currentValue: { increment: 1 } }, select: { currentValue: true } }); return `STK-${yearMonth}-${String(sequence.currentValue).padStart(5, "0")}`; }
export function findMovementByIdempotencyKey(tx: InventoryTransaction, idempotencyKey: string) { return tx.inventoryMovement.findUnique({ where: { idempotencyKey }, select: { id: true, movementNo: true, occurredAt: true } }); }
export function createInventoryMovement(tx: InventoryTransaction, data: Prisma.InventoryMovementUncheckedCreateInput) { return tx.inventoryMovement.create({ data, select: { id: true, movementNo: true, occurredAt: true } }); }
export function createInventoryLedgerEntry(tx: InventoryTransaction, data: Prisma.InventoryLedgerEntryUncheckedCreateInput) { return tx.inventoryLedgerEntry.create({ data, select: { id: true, quantity: true } }); }
export async function lockStockBalance(tx: InventoryTransaction, warehouseId: string, productId: string) { const rows = await tx.$queryRaw<{ onHandQuantity: { toFixed(scale: number): string }; reservedQuantity: { toFixed(scale: number): string } }[]>`SELECT "onHandQuantity", "reservedQuantity" FROM "stock_balances" WHERE "warehouseId" = ${warehouseId}::uuid AND "productId" = ${productId}::uuid FOR UPDATE`; return rows[0] ?? null; }
export function readStockBalance(tx: InventoryTransaction, warehouseId: string, productId: string) { return tx.stockBalance.findUnique({ where: { warehouseId_productId: { warehouseId, productId } }, select: { onHandQuantity: true, reservedQuantity: true } }); }
export function createInventoryAuditLog(tx: InventoryTransaction, data: Prisma.AuditLogUncheckedCreateInput) { return tx.auditLog.create({ data }); }
export function withInventoryTransaction<T>(operation: (tx: InventoryTransaction) => Promise<T>) { return db.$transaction(operation, { isolationLevel: "Serializable" }); }

export function reconcileInventoryProjection() { return db.$queryRaw<{ warehouseId: string; productId: string; ledgerQuantity: { toFixed(scale: number): string }; balanceQuantity: { toFixed(scale: number): string }; difference: { toFixed(scale: number): string } }[]>`
  SELECT COALESCE(l."warehouseId", b."warehouseId") AS "warehouseId", COALESCE(l."productId", b."productId") AS "productId",
    COALESCE(l.quantity, 0)::decimal(14,3) AS "ledgerQuantity", COALESCE(b."onHandQuantity", 0)::decimal(14,3) AS "balanceQuantity",
    (COALESCE(l.quantity, 0) - COALESCE(b."onHandQuantity", 0))::decimal(14,3) AS difference
  FROM (SELECT "warehouseId", "productId", SUM(quantity) AS quantity FROM "inventory_ledger_entries" GROUP BY "warehouseId", "productId") l
  FULL OUTER JOIN "stock_balances" b ON b."warehouseId" = l."warehouseId" AND b."productId" = l."productId"
  WHERE COALESCE(l.quantity, 0) <> COALESCE(b."onHandQuantity", 0)
  ORDER BY 1, 2`;
}
