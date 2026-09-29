import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { CustomerListQuery } from "@/validations/customer";

export type CustomerTransaction = Prisma.TransactionClient;

const listSelect = { id: true, code: true, displayName: true, legalName: true, type: true, status: true, contactName: true, phone: true, defaultSaleType: true, creditTermDays: true, creditLimit: true, createdAt: true, updatedAt: true, defaultPriceList: { select: { id: true, code: true, name: true } } } satisfies Prisma.CustomerSelect;
const detailInclude = { defaultPriceList: { select: { id: true, code: true, name: true, status: true } }, addresses: { orderBy: [{ type: "asc" as const }, { isDefault: "desc" as const }, { createdAt: "asc" as const }] } } satisfies Prisma.CustomerInclude;

function customerWhere(query: CustomerListQuery): Prisma.CustomerWhereInput {
  const search = query.q ? { OR: ["code", "displayName", "legalName", "contactName", "phone", "taxId"].map((field) => ({ [field]: { contains: query.q, mode: "insensitive" as const } })) } as Prisma.CustomerWhereInput : {};
  return { deletedAt: null, ...search, ...(query.type === "ALL" ? {} : { type: query.type }), ...(query.status === "ALL" ? {} : { status: query.status }), ...(query.priceListId === "ALL" ? {} : { defaultPriceListId: query.priceListId }), ...(query.credit === "ALL" ? {} : { defaultSaleType: query.credit }) };
}

export async function findCustomers(query: CustomerListQuery) {
  const where = customerWhere(query);
  const orderBy = { [query.sort]: query.order } as Prisma.CustomerOrderByWithRelationInput;
  const [rows, total] = await db.$transaction([db.customer.findMany({ where, select: listSelect, orderBy: [orderBy, { id: "asc" }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }), db.customer.count({ where })]);
  return { rows, total };
}

export function findCustomerById(id: string) { return db.customer.findFirst({ where: { id, deletedAt: null }, include: detailInclude }); }
export function findCustomerByIdForUpdate(id: string, tx: CustomerTransaction) { return tx.customer.findFirst({ where: { id, deletedAt: null }, include: { addresses: true } }); }
export function listCustomerAuditLogs(id: string) { return db.auditLog.findMany({ where: { entityType: "Customer", entityId: id }, select: { id: true, action: true, actorName: true, createdAt: true, metadata: true }, orderBy: { createdAt: "desc" }, take: 50 }); }
export function listCustomerPriceLists() { return db.priceList.findMany({ where: { status: "ACTIVE" }, select: { id: true, code: true, name: true }, orderBy: [{ name: "asc" }, { code: "asc" }] }); }
export function findActivePriceList(id: string, tx: CustomerTransaction) { return tx.priceList.findFirst({ where: { id, status: "ACTIVE" }, select: { id: true } }); }
export function withCustomerTransaction<T>(operation: (tx: CustomerTransaction) => Promise<T>) { return db.$transaction(operation); }
export async function nextCustomerCodeSequence(tx: CustomerTransaction) { const [row] = await tx.$queryRaw<Array<{ value: bigint }>>`SELECT nextval('customer_code_seq') AS value`; return row.value; }
export function createCustomerRecord(tx: CustomerTransaction, data: Prisma.CustomerUncheckedCreateInput) { return tx.customer.create({ data, include: detailInclude }); }
export function updateCustomerRecord(tx: CustomerTransaction, id: string, data: Prisma.CustomerUncheckedUpdateInput) { return tx.customer.update({ where: { id }, data, include: detailInclude }); }
export function replaceCustomerAddresses(tx: CustomerTransaction, customerId: string, addresses: Prisma.CustomerAddressCreateManyInput[]) { return Promise.all([tx.customerAddress.deleteMany({ where: { customerId } }), addresses.length ? tx.customerAddress.createMany({ data: addresses }) : Promise.resolve()]); }
export function createCustomerAuditLog(tx: CustomerTransaction, data: Prisma.AuditLogUncheckedCreateInput) { return tx.auditLog.create({ data }); }
