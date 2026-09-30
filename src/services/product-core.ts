import type { ProductCategoryValues, ProductFormValues, UnitValues } from "@/validations/product";

export function normalizeCode(value: string) { return value.trim().toUpperCase(); }
export function normalizeBarcode(value: string) { return value.trim().replace(/\s+/g, ""); }
export function normalizeDecimal(value: string, scale: number) { const [wholeRaw, fractionRaw = ""] = value.trim().split("."); const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0"; return `${whole}.${fractionRaw.padEnd(scale, "0").slice(0, scale)}`; }

export function normalizeProductInput(input: ProductFormValues): ProductFormValues { return { ...input, sku: normalizeCode(input.sku), barcode: normalizeBarcode(input.barcode), reorderLevel: normalizeDecimal(input.reorderLevel, 3), cost: normalizeDecimal(input.cost, 4), retailPrice: normalizeDecimal(input.retailPrice, 4), wholesalePrice: normalizeDecimal(input.wholesalePrice, 4) }; }
export function normalizeCategoryInput(input: ProductCategoryValues): ProductCategoryValues { return { ...input, code: normalizeCode(input.code) }; }
export function normalizeUnitInput(input: UnitValues): UnitValues { return { ...input, code: normalizeCode(input.code), symbol: input.symbol.trim() }; }

export function summarizeProductForAudit(input: ProductFormValues) { return { sku: input.sku, name: input.name, categoryId: input.categoryId || null, status: input.status, trackInventory: input.trackInventory, reorderLevel: input.reorderLevel, baseUnitId: input.baseUnitId, barcode: input.barcode || null, cost: input.cost, retailPrice: input.retailPrice, wholesalePrice: input.wholesalePrice }; }
