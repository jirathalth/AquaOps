import { describe, expect, it } from "vitest";
import { normalizeBarcode, normalizeCode, normalizeDecimal, normalizeProductInput } from "@/services/product-core";
import { productFormSchema } from "@/validations/product";

const product = { sku: " water-600 ", name: "น้ำดื่ม 600 มล.", description: "", categoryId: "", status: "ACTIVE", trackInventory: true, reorderLevel: "5.5", baseUnitId: "fd3a1187-7c0f-4d53-85c1-4d8a16363bc0", barcode: " 885001 ", cost: "2.125", retailPrice: "7", wholesalePrice: "4.5" } as const;

describe("product core", () => {
  it("normalizes codes, barcodes, quantities, and monetary decimals without Number conversion", () => { expect(normalizeCode(" water-600 ")).toBe("WATER-600"); expect(normalizeBarcode(" 885 001 ")).toBe("885001"); expect(normalizeDecimal("0007.5", 4)).toBe("7.5000"); const normalized = normalizeProductInput(productFormSchema.parse(product)); expect(normalized).toMatchObject({ sku: "WATER-600", barcode: "885001", reorderLevel: "5.500", cost: "2.1250", retailPrice: "7.0000", wholesalePrice: "4.5000" }); });
  it("rejects negative prices and malformed product identifiers", () => { expect(productFormSchema.safeParse({ ...product, cost: "-1" }).success).toBe(false); expect(productFormSchema.safeParse({ ...product, sku: "invalid sku" }).success).toBe(false); });
});
