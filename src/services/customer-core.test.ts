import { describe, expect, it } from "vitest";
import { formatCustomerCode, normalizeCustomerInput, summarizeCustomerForAudit } from "@/services/customer-core";
import { customerFormSchema } from "@/validations/customer";

const validCustomer = { type: "WHOLESALE", status: "ACTIVE", displayName: "ร้านตัวอย่าง", legalName: "", taxId: "", taxBranchCode: "", contactName: "ผู้ติดต่อ", phone: "081-234-5678", email: "test@example.com", defaultSaleType: "CREDIT", creditTermDays: 30, creditLimit: "100000.25", billingCycle: "END_OF_MONTH", billingCycleNote: "", defaultPriceListId: "", notes: "", addresses: [{ id: "", type: "BILLING", label: "สำนักงานใหญ่", contactName: "", phone: "", addressLine1: "1 ถนนสุขุมวิท", addressLine2: "", subdistrict: "คลองเตย", district: "คลองเตย", province: "กรุงเทพมหานคร", postalCode: "10110", countryCode: "th", deliveryNotes: "", isDefault: true }] } as const;

describe("customer core", () => {
  it("formats concurrency sequence values as customer codes", () => { expect(formatCustomerCode(1n)).toBe("CUS-000001"); expect(formatCustomerCode(1234567n)).toBe("CUS-1234567"); expect(() => formatCustomerCode(0)).toThrow(); });
  it("preserves decimal credit values as strings and normalizes addresses", () => { const normalized = normalizeCustomerInput(customerFormSchema.parse(validCustomer)); expect(normalized.creditLimit).toBe("100000.25"); expect(normalized.legalName).toBe("ร้านตัวอย่าง"); expect(normalized.addresses[0]?.countryCode).toBe("TH"); expect(summarizeCustomerForAudit(normalized).addressCount).toBe(1); });
  it("clears credit and billing configuration for cash customers", () => { const normalized = normalizeCustomerInput(customerFormSchema.parse({ ...validCustomer, defaultSaleType: "CASH" })); expect(normalized).toMatchObject({ creditTermDays: 0, creditLimit: "0.00", billingCycle: "NONE", billingCycleNote: "" }); });
  it("rejects invalid tax, credit, and duplicate default addresses", () => { const result = customerFormSchema.safeParse({ ...validCustomer, taxId: "123", creditLimit: "-1", addresses: [validCustomer.addresses[0], { ...validCustomer.addresses[0], id: "" }] }); expect(result.success).toBe(false); });
});
