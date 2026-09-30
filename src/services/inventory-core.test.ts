import { describe, expect, it } from "vitest";
import { addInventoryQuantities, compareInventoryQuantity, getStockStatus, normalizeInventoryQuantity, signedInventoryQuantity, validateInventoryUnitScale } from "@/services/inventory-core";

describe("inventory quantity rules", () => {
  it("normalizes signed ledger quantities without floating-point arithmetic", () => { expect(normalizeInventoryQuantity("24.5")).toBe("24.500"); expect(signedInventoryQuantity("12", "IN")).toBe("12.000"); expect(signedInventoryQuantity("12", "OUT")).toBe("-12.000"); expect(addInventoryQuantities("0.100", "0.200")).toBe("0.300"); });
  it("compares exact fractional quantities", () => { expect(compareInventoryQuantity("24.500", "24.5")).toBe(0); expect(compareInventoryQuantity("1.001", "1.000")).toBe(1); });
  it("enforces unit decimal scale", () => { expect(validateInventoryUnitScale("12.000", 0)).toBe("12.000"); expect(() => validateInventoryUnitScale("12.5", 0)).toThrow("ทศนิยม"); expect(validateInventoryUnitScale("24.5", 1)).toBe("24.500"); });
  it("derives stock status instead of persisting it", () => { expect(getStockStatus("0.000", "10.000")).toBe("OUT_OF_STOCK"); expect(getStockStatus("5.000", "10.000")).toBe("LOW_STOCK"); expect(getStockStatus("11.000", "10.000")).toBe("IN_STOCK"); });
  it("rejects zero movement quantity", () => { expect(() => signedInventoryQuantity("0", "OUT")).toThrow("มากกว่า 0"); });
});
