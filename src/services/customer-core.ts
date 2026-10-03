import type { CustomerFormValues } from "@/validations/customer";

export function formatCustomerCode(sequence: bigint | number | string) {
  const value = BigInt(sequence);
  if (value < 1n) throw new Error("Customer sequence must be positive");
  return `CUS-${value.toString().padStart(6, "0")}`;
}

export function normalizeCustomerInput(
  input: CustomerFormValues,
): CustomerFormValues {
  const isCash = input.defaultSaleType === "CASH";
  return {
    ...input,
    legalName: input.legalName || input.displayName,
    creditTermDays: isCash ? 0 : input.creditTermDays,
    creditLimit: isCash ? null : input.creditLimit,
    billingCycle: isCash ? "NONE" : input.billingCycle,
    billingCycleNote:
      isCash || input.billingCycle !== "CUSTOM" ? "" : input.billingCycleNote,
    addresses: input.addresses.map((address) => ({
      ...address,
      countryCode: address.countryCode.toUpperCase(),
    })),
  };
}

export function summarizeCustomerForAudit(
  input: CustomerFormValues,
  code?: string,
) {
  return {
    code,
    type: input.type,
    status: input.status,
    displayName: input.displayName,
    legalName: input.legalName,
    taxId: input.taxId || null,
    contactName: input.contactName || null,
    phone: input.phone || null,
    email: input.email || null,
    defaultSaleType: input.defaultSaleType,
    creditTermDays: input.creditTermDays,
    creditLimit: input.creditLimit,
    billingCycle: input.billingCycle,
    billingCycleNote: input.billingCycleNote || null,
    defaultPriceListId: input.defaultPriceListId || null,
    defaultVatRate: input.defaultVatRate,
    addressCount: input.addresses.length,
  };
}
