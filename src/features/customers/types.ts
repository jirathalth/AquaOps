import type { BillingCycleValue, CustomerStatusValue, CustomerTypeValue, SaleTypeValue } from "@/config/customers";
import type { CustomerAddressValues, CustomerFormValues } from "@/validations/customer";

export type PriceListOption = { id: string; code: string; name: string };
export type CustomerRow = { id: string; code: string; displayName: string; legalName: string; type: CustomerTypeValue; status: CustomerStatusValue; contactName: string | null; phone: string | null; defaultSaleType: SaleTypeValue; creditTermDays: number; creditLimit: string; createdAt: string; updatedAt: string; defaultPriceList: PriceListOption | null };
export type CustomerAddressData = Omit<CustomerAddressValues, "id"> & { id: string };
export type CustomerDetailData = Omit<CustomerFormValues, "id" | "addresses"> & { id: string; code: string; createdAt: string; updatedAt: string; billingCycle: BillingCycleValue; addresses: CustomerAddressData[]; defaultPriceList: (PriceListOption & { status: string }) | null };
