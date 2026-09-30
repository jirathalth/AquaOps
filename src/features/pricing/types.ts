import type { PriceListFormValues } from "@/validations/pricing";

export type PriceSource = "CUSTOMER_OVERRIDE" | "PRICE_LIST" | "PRODUCT_DEFAULT";
export type ProductUnitOption = { id: string; productId: string; sku: string; productName: string; unitId: string; unitName: string; unitSymbol: string; retailPrice: string; wholesalePrice: string; isActive: boolean };
export type PriceListRow = { id: string; code: string; name: string; description: string | null; status: "DRAFT" | "ACTIVE" | "INACTIVE"; currency: string; validFrom: string | null; validTo: string | null; customerCount: number; itemCount: number; createdAt: string; updatedAt: string };
export type PriceListItemData = { id: string; productUnitId: string; minimumQuantity: string; unitPrice: string; productUnit: ProductUnitOption };
export type PriceListDetailData = PriceListFormValues & { id: string; currency: string; customerCount: number; createdAt: string; updatedAt: string; items: PriceListItemData[] };
export type CustomerPriceData = { id: string; customerId: string; productUnitId: string; unitPrice: string; validFrom: string; validTo: string | null; isActive: boolean; productUnit: ProductUnitOption };
export type ResolvedPrice = { unitPrice: string; source: PriceSource; priceList: { id: string; code: string; name: string } | null; customerOverrideId: string | null };
