import "server-only";
import { createCustomerAuditLog, createCustomerRecord, findActivePriceList, findCustomerById, findCustomerByIdForUpdate, findCustomers, listCustomerAuditLogs, listCustomerPriceLists, nextCustomerCodeSequence, replaceCustomerAddresses, updateCustomerRecord, withCustomerTransaction } from "@/repositories/customer.repository";
import { formatCustomerCode, normalizeCustomerInput, summarizeCustomerForAudit } from "@/services/customer-core";
import type { CustomerFormValues, CustomerListQuery } from "@/validations/customer";

export class CustomerRuleError extends Error { constructor(message: string) { super(message); this.name = "CustomerRuleError"; } }
const nullable = (value: string) => value || null;
function addressData(customerId: string, input: CustomerFormValues["addresses"]) { return input.map((address) => ({ customerId, type: address.type, label: nullable(address.label), contactName: nullable(address.contactName), phone: nullable(address.phone), addressLine1: address.addressLine1, addressLine2: nullable(address.addressLine2), subdistrict: nullable(address.subdistrict), district: nullable(address.district), province: address.province, postalCode: nullable(address.postalCode), countryCode: address.countryCode, deliveryNotes: nullable(address.deliveryNotes), isDefault: address.isDefault })); }
function customerData(input: CustomerFormValues, includeStatus = true) { return { ...(includeStatus ? { status: input.status } : {}), type: input.type, legalName: input.legalName, displayName: input.displayName, taxId: nullable(input.taxId), taxBranchCode: nullable(input.taxBranchCode), contactName: nullable(input.contactName), phone: nullable(input.phone), email: nullable(input.email), defaultSaleType: input.defaultSaleType, creditLimit: input.creditLimit, creditTermDays: input.creditTermDays, billingCycle: input.billingCycle, billingCycleNote: nullable(input.billingCycleNote), defaultPriceListId: nullable(input.defaultPriceListId), notes: nullable(input.notes) }; }
async function validatePriceList(id: string, tx: Parameters<typeof findActivePriceList>[1]) { if (id && !await findActivePriceList(id, tx)) throw new CustomerRuleError("ไม่พบราคาขายที่ใช้งานได้"); }
function serializeListRow(row: Awaited<ReturnType<typeof findCustomers>>["rows"][number]) { return { ...row, creditLimit: row.creditLimit.toFixed(2), createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() }; }

export async function getCustomers(query: CustomerListQuery) { const result = await findCustomers(query); return { rows: result.rows.map(serializeListRow), total: result.total, pageCount: Math.ceil(result.total / query.pageSize) }; }
export function getCustomerPriceLists() { return listCustomerPriceLists(); }
export async function getCustomer(id: string) { const customer = await findCustomerById(id); if (!customer) return null; return { ...customer, legalName: customer.legalName, taxId: customer.taxId ?? "", taxBranchCode: customer.taxBranchCode ?? "", contactName: customer.contactName ?? "", phone: customer.phone ?? "", email: customer.email ?? "", creditLimit: customer.creditLimit.toFixed(2), billingCycleNote: customer.billingCycleNote ?? "", defaultPriceListId: customer.defaultPriceListId ?? "", notes: customer.notes ?? "", createdAt: customer.createdAt.toISOString(), updatedAt: customer.updatedAt.toISOString(), addresses: customer.addresses.map((address) => ({ ...address, label: address.label ?? "", contactName: address.contactName ?? "", phone: address.phone ?? "", addressLine2: address.addressLine2 ?? "", subdistrict: address.subdistrict ?? "", district: address.district ?? "", postalCode: address.postalCode ?? "", deliveryNotes: address.deliveryNotes ?? "", createdAt: address.createdAt.toISOString(), updatedAt: address.updatedAt.toISOString() })) }; }
export async function getCustomerActivity(id: string) { return (await listCustomerAuditLogs(id)).map((log) => ({ ...log, createdAt: log.createdAt.toISOString() })); }

type CustomerActor = { id: string | null; name: string };

export async function createCustomer(input: CustomerFormValues, actor: CustomerActor) {
  const normalized = normalizeCustomerInput(input);
  return withCustomerTransaction(async (tx) => {
    await validatePriceList(normalized.defaultPriceListId, tx);
    const code = formatCustomerCode(await nextCustomerCodeSequence(tx));
    const customer = await createCustomerRecord(tx, { code, ...customerData(normalized) });
    await replaceCustomerAddresses(tx, customer.id, addressData(customer.id, normalized.addresses));
    await createCustomerAuditLog(tx, { actorId: actor.id, actorName: actor.name, action: "CUSTOMER_CREATED", entityType: "Customer", entityId: customer.id, afterData: summarizeCustomerForAudit(normalized, code) });
    return customer.id;
  });
}

export async function updateCustomer(input: CustomerFormValues & { id: string }, actor: CustomerActor) {
  const normalized = normalizeCustomerInput(input);
  return withCustomerTransaction(async (tx) => {
    const current = await findCustomerByIdForUpdate(input.id, tx);
    if (!current) throw new CustomerRuleError("ไม่พบลูกค้า");
    await validatePriceList(normalized.defaultPriceListId, tx);
    await updateCustomerRecord(tx, input.id, customerData(normalized, false));
    await replaceCustomerAddresses(tx, input.id, addressData(input.id, normalized.addresses));
    await createCustomerAuditLog(tx, { actorId: actor.id, actorName: actor.name, action: "CUSTOMER_UPDATED", entityType: "Customer", entityId: input.id, beforeData: { code: current.code, status: current.status, displayName: current.displayName, creditLimit: current.creditLimit.toFixed(2), addressCount: current.addresses.length }, afterData: summarizeCustomerForAudit({ ...normalized, status: current.status }, current.code) });
    return input.id;
  });
}

export async function changeCustomerStatus(id: string, status: "ACTIVE" | "INACTIVE", actor: CustomerActor) {
  return withCustomerTransaction(async (tx) => {
    const current = await findCustomerByIdForUpdate(id, tx);
    if (!current) throw new CustomerRuleError("ไม่พบลูกค้า");
    if (current.status === status) return id;
    await updateCustomerRecord(tx, id, { status });
    await createCustomerAuditLog(tx, { actorId: actor.id, actorName: actor.name, action: status === "ACTIVE" ? "CUSTOMER_REACTIVATED" : "CUSTOMER_DEACTIVATED", entityType: "Customer", entityId: id, beforeData: { status: current.status }, afterData: { status } });
    return id;
  });
}
