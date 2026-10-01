import type { PriceSource, ResolvedPrice } from "@/features/pricing/types";
import { normalizeCode, normalizeDecimal } from "@/services/product-core";
import type { CustomerPriceValues, PriceListFormValues, PriceListItemValues } from "@/validations/pricing";

type Candidate = { unitPrice: string; source: PriceSource; priceList?: { id: string; code: string; name: string } | null; customerOverrideId?: string | null };
export function selectResolvedPrice(input: { customerOverride?: Candidate | null; priceListPrice?: Candidate | null; customerType: "RETAIL" | "WHOLESALE"; retailPrice: string; wholesalePrice: string }): ResolvedPrice { const selected = input.customerOverride ?? input.priceListPrice ?? { unitPrice: input.customerType === "WHOLESALE" ? input.wholesalePrice : input.retailPrice, source: "PRODUCT_DEFAULT" as const }; return { unitPrice: selected.unitPrice, source: selected.source, priceList: selected.priceList ?? null, customerOverrideId: selected.customerOverrideId ?? null }; }

export function normalizePriceListInput(input: PriceListFormValues): PriceListFormValues { return { ...input, code: normalizeCode(input.code) }; }
export function normalizePriceListItemInput(input: PriceListItemValues): PriceListItemValues { return { ...input, minimumQuantity: normalizeDecimal(input.minimumQuantity, 3), unitPrice: normalizeDecimal(input.unitPrice, 4) }; }
export function normalizeCustomerPriceInput(input: CustomerPriceValues): CustomerPriceValues { return { ...input, unitPrice: normalizeDecimal(input.unitPrice, 4) }; }
export function parseBusinessDate(value: string) { return value ? new Date(`${value}T00:00:00.000+07:00`) : null; }
export function parseDateOnly(value: string) { return value ? new Date(`${value}T00:00:00.000Z`) : null; }
export function toDateInput(value: Date | null) { if (!value) return ""; return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(value); }
