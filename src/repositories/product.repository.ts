import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { ProductListQuery } from "@/validations/product";

export type ProductTransaction = Prisma.TransactionClient;
const categorySelect = { id: true, code: true, name: true, isActive: true } satisfies Prisma.ProductCategorySelect;
const unitSelect = { id: true, code: true, nameTh: true, nameEn: true, symbol: true, decimalScale: true, isActive: true } satisfies Prisma.UnitOfMeasureSelect;
const productUnitInclude = { unit: { select: unitSelect } } satisfies Prisma.ProductUnitInclude;
const detailInclude = { category: { select: categorySelect }, units: { include: productUnitInclude, orderBy: [{ isBase: "desc" as const }, { createdAt: "asc" as const }] } } satisfies Prisma.ProductInclude;
const listSelect = { id: true, sku: true, name: true, description: true, status: true, trackInventory: true, reorderLevel: true, createdAt: true, updatedAt: true, category: { select: categorySelect }, units: { where: { isBase: true }, take: 1, include: productUnitInclude } } satisfies Prisma.ProductSelect;

function productWhere(query: ProductListQuery): Prisma.ProductWhereInput { const search = query.q ? { OR: [{ sku: { contains: query.q, mode: "insensitive" as const } }, { name: { contains: query.q, mode: "insensitive" as const } }, { description: { contains: query.q, mode: "insensitive" as const } }, { units: { some: { barcode: { contains: query.q, mode: "insensitive" as const } } } }] } : {}; return { deletedAt: null, ...search, ...(query.categoryId === "ALL" ? {} : { categoryId: query.categoryId }), ...(query.status === "ALL" ? {} : { status: query.status }) }; }

export async function findProducts(query: ProductListQuery) { const where = productWhere(query); const orderBy = { [query.sort]: query.order } as Prisma.ProductOrderByWithRelationInput; const [rows, total] = await db.$transaction([db.product.findMany({ where, select: listSelect, orderBy: [orderBy, { id: "asc" }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }), db.product.count({ where })]); return { rows, total }; }
export function findProductById(id: string) { return db.product.findFirst({ where: { id, deletedAt: null }, include: detailInclude }); }
export function findProductByIdForUpdate(id: string, tx: ProductTransaction) { return tx.product.findFirst({ where: { id, deletedAt: null }, include: { units: true } }); }
export function findProductBySku(sku: string, tx: ProductTransaction) { return tx.product.findUnique({ where: { sku }, select: { id: true } }); }
export function findProductUnitByBarcode(barcode: string, tx: ProductTransaction) { return tx.productUnit.findUnique({ where: { barcode }, select: { id: true, productId: true } }); }
export function findActiveCategory(id: string, tx: ProductTransaction) { return tx.productCategory.findFirst({ where: { id, isActive: true }, select: { id: true } }); }
export function findActiveUnit(id: string, tx: ProductTransaction) { return tx.unitOfMeasure.findFirst({ where: { id, isActive: true }, select: { id: true } }); }
export function listProductCategories() { return db.productCategory.findMany({ select: { ...categorySelect, _count: { select: { products: true } } }, orderBy: [{ isActive: "desc" }, { name: "asc" }] }); }
export function listUnits() { return db.unitOfMeasure.findMany({ select: { ...unitSelect, _count: { select: { productUnits: true } } }, orderBy: [{ isActive: "desc" }, { nameTh: "asc" }] }); }
export function findCategoryByCode(code: string, tx: ProductTransaction) { return tx.productCategory.findUnique({ where: { code }, select: { id: true } }); }
export function findUnitByCode(code: string, tx: ProductTransaction) { return tx.unitOfMeasure.findUnique({ where: { code }, select: { id: true } }); }
export function findCategoryById(id: string, tx: ProductTransaction) { return tx.productCategory.findUnique({ where: { id }, select: categorySelect }); }
export function findUnitById(id: string, tx: ProductTransaction) { return tx.unitOfMeasure.findUnique({ where: { id }, select: unitSelect }); }
export function createProductRecord(tx: ProductTransaction, data: Prisma.ProductUncheckedCreateInput) { return tx.product.create({ data, select: { id: true } }); }
export function createProductUnitRecord(tx: ProductTransaction, data: Prisma.ProductUnitUncheckedCreateInput) { return tx.productUnit.create({ data, select: { id: true } }); }
export function updateProductRecord(tx: ProductTransaction, id: string, data: Prisma.ProductUncheckedUpdateInput) { return tx.product.update({ where: { id }, data, select: { id: true } }); }
export function updateProductUnitRecord(tx: ProductTransaction, id: string, data: Prisma.ProductUnitUncheckedUpdateInput) { return tx.productUnit.update({ where: { id }, data, select: { id: true } }); }
export function createCategoryRecord(tx: ProductTransaction, data: Prisma.ProductCategoryUncheckedCreateInput) { return tx.productCategory.create({ data, select: categorySelect }); }
export function updateCategoryRecord(tx: ProductTransaction, id: string, data: Prisma.ProductCategoryUncheckedUpdateInput) { return tx.productCategory.update({ where: { id }, data, select: categorySelect }); }
export function createUnitRecord(tx: ProductTransaction, data: Prisma.UnitOfMeasureUncheckedCreateInput) { return tx.unitOfMeasure.create({ data, select: unitSelect }); }
export function updateUnitRecord(tx: ProductTransaction, id: string, data: Prisma.UnitOfMeasureUncheckedUpdateInput) { return tx.unitOfMeasure.update({ where: { id }, data, select: unitSelect }); }
export function createProductAuditLog(tx: ProductTransaction, data: Prisma.AuditLogUncheckedCreateInput) { return tx.auditLog.create({ data }); }
export function listProductAuditLogs(id: string) { return db.auditLog.findMany({ where: { entityType: "Product", entityId: id }, select: { id: true, action: true, actorName: true, createdAt: true, metadata: true }, orderBy: { createdAt: "desc" }, take: 50 }); }
export function withProductTransaction<T>(operation: (tx: ProductTransaction) => Promise<T>) { return db.$transaction(operation); }
