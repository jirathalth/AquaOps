import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { PriceListQuery } from "@/validations/pricing";

export type PricingTransaction = Prisma.TransactionClient;
const productUnitOptionSelect = { id: true, productId: true, unitId: true, isActive: true, retailPrice: true, wholesalePrice: true, product: { select: { sku: true, name: true, status: true, deletedAt: true } }, unit: { select: { nameTh: true, symbol: true, isActive: true } } } satisfies Prisma.ProductUnitSelect;
const priceListSelect = { id: true, code: true, name: true, description: true, status: true, currency: true, validFrom: true, validTo: true, createdAt: true, updatedAt: true, _count: { select: { customers: true, items: true } } } satisfies Prisma.PriceListSelect;

function priceListWhere(query: PriceListQuery): Prisma.PriceListWhereInput { return { ...(query.q ? { OR: [{ code: { contains: query.q, mode: "insensitive" } }, { name: { contains: query.q, mode: "insensitive" } }, { description: { contains: query.q, mode: "insensitive" } }] } : {}), ...(query.status === "ALL" ? {} : { status: query.status }) }; }
export async function findPriceLists(query: PriceListQuery) { const where = priceListWhere(query); const orderBy = { [query.sort]: query.order } as Prisma.PriceListOrderByWithRelationInput; const [rows, total] = await db.$transaction([db.priceList.findMany({ where, select: priceListSelect, orderBy: [orderBy, { id: "asc" }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }), db.priceList.count({ where })]); return { rows, total }; }
export function findPriceListById(id: string) { return db.priceList.findUnique({ where: { id }, select: { ...priceListSelect, items: { include: { productUnit: { select: productUnitOptionSelect } }, orderBy: [{ productUnit: { product: { name: "asc" } } }, { minimumQuantity: "asc" }] } } }); }
export function findPriceListByIdForUpdate(id: string, tx: PricingTransaction) { return tx.priceList.findUnique({ where: { id }, select: priceListSelect }); }
export function findPriceListByCode(code: string, tx: PricingTransaction) { return tx.priceList.findUnique({ where: { code }, select: { id: true } }); }
export function listPricingProductUnits() { return db.productUnit.findMany({ where: { product: { deletedAt: null } }, select: productUnitOptionSelect, orderBy: [{ product: { name: "asc" } }, { unit: { nameTh: "asc" } }] }); }
export function findPricingProductUnit(id: string, tx: PricingTransaction) { return tx.productUnit.findUnique({ where: { id }, select: productUnitOptionSelect }); }
export function findPriceListItemById(id: string, tx: PricingTransaction) { return tx.priceListItem.findUnique({ where: { id }, select: { id: true, priceListId: true, productUnitId: true, minimumQuantity: true, unitPrice: true } }); }
export function findDuplicatePriceListItem(priceListId: string, productUnitId: string, minimumQuantity: string, tx: PricingTransaction) { return tx.priceListItem.findUnique({ where: { priceListId_productUnitId_minimumQuantity: { priceListId, productUnitId, minimumQuantity } }, select: { id: true } }); }
export function createPriceListRecord(tx: PricingTransaction, data: Prisma.PriceListUncheckedCreateInput) { return tx.priceList.create({ data, select: { id: true } }); }
export function updatePriceListRecord(tx: PricingTransaction, id: string, data: Prisma.PriceListUncheckedUpdateInput) { return tx.priceList.update({ where: { id }, data, select: { id: true } }); }
export function createPriceListItemRecord(tx: PricingTransaction, data: Prisma.PriceListItemUncheckedCreateInput) { return tx.priceListItem.create({ data, select: { id: true } }); }
export function updatePriceListItemRecord(tx: PricingTransaction, id: string, data: Prisma.PriceListItemUncheckedUpdateInput) { return tx.priceListItem.update({ where: { id }, data, select: { id: true } }); }
export function deletePriceListItemRecord(tx: PricingTransaction, id: string) { return tx.priceListItem.delete({ where: { id }, select: { id: true } }); }

export function listCustomerPrices(customerId: string) { return db.customerProductPrice.findMany({ where: { customerId }, include: { productUnit: { select: productUnitOptionSelect } }, orderBy: [{ validTo: "asc" }, { productUnit: { product: { name: "asc" } } }, { validFrom: "desc" }] }); }
export function findCustomerForPricing(customerId: string, tx: PricingTransaction) { return tx.customer.findFirst({ where: { id: customerId, deletedAt: null }, select: { id: true, type: true, status: true } }); }
export function findCustomerPriceById(id: string, tx: PricingTransaction) { return tx.customerProductPrice.findUnique({ where: { id }, select: { id: true, customerId: true, productUnitId: true, unitPrice: true, validFrom: true, validTo: true } }); }
export function findActiveCustomerPrice(customerId: string, productUnitId: string, at: Date, tx: PricingTransaction, excludeId?: string) { return tx.customerProductPrice.findFirst({ where: { customerId, productUnitId, validFrom: { lte: at }, OR: [{ validTo: null }, { validTo: { gte: at } }], ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } }); }
export function createCustomerPriceRecord(tx: PricingTransaction, data: Prisma.CustomerProductPriceUncheckedCreateInput) { return tx.customerProductPrice.create({ data, select: { id: true } }); }
export function updateCustomerPriceRecord(tx: PricingTransaction, id: string, data: Prisma.CustomerProductPriceUncheckedUpdateInput) { return tx.customerProductPrice.update({ where: { id }, data, select: { id: true } }); }

export async function findPriceResolutionContext(input: { customerId: string; productId: string; unitId: string; quantity: string; at: Date }, tx?: PricingTransaction) {
  const client = tx ?? db;
  const [customer, productUnit] = await Promise.all([
    client.customer.findFirst({ where: { id: input.customerId, deletedAt: null }, select: { id: true, type: true, status: true, defaultPriceList: { select: { id: true, code: true, name: true, status: true, validFrom: true, validTo: true, items: { where: { productUnit: { productId: input.productId, unitId: input.unitId }, minimumQuantity: { lte: input.quantity } }, select: { unitPrice: true }, orderBy: { minimumQuantity: "desc" }, take: 1 } } }, customPrices: { where: { productUnit: { productId: input.productId, unitId: input.unitId }, validFrom: { lte: input.at }, OR: [{ validTo: null }, { validTo: { gte: input.at } }] }, select: { id: true, unitPrice: true }, orderBy: { validFrom: "desc" }, take: 1 } } }),
    client.productUnit.findFirst({ where: { productId: input.productId, unitId: input.unitId }, select: productUnitOptionSelect }),
  ]);
  return { customer, productUnit };
}

export function createPricingAuditLog(tx: PricingTransaction, data: Prisma.AuditLogUncheckedCreateInput) { return tx.auditLog.create({ data }); }
export function withPricingTransaction<T>(operation: (tx: PricingTransaction) => Promise<T>) { return db.$transaction(operation); }
