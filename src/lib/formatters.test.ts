import { describe, expect, it } from "vitest";
import { formatCurrency, formatCurrencyDecimal, formatDateTime, formatPercentage, formatQuantity } from "@/lib/formatters";

describe("formatCurrency", () => {
  it("formats values as Thai baht", () => { expect(formatCurrency(1250)).toContain("1,250"); });
  it("uses two decimal places by default", () => { expect(formatCurrency(1250)).toMatch(/1,250[.,]00/); });
});

describe("business formatters", () => {
  it("formats decimal currency without floating-point conversion", () => { expect(formatCurrencyDecimal("12500.00")).toBe("฿12,500.00"); expect(formatCurrencyDecimal("-0.50")).toBe("-฿0.50"); });
  it("formats quantities and percentages consistently", () => { expect(formatQuantity(1250, "ขวด")).toBe("1,250 ขวด"); expect(formatPercentage(15.5)).toBe("15.5%"); });
  it("formats date and time in the business timezone", () => { expect(formatDateTime("2026-09-28T07:30:00.000Z")).toContain("14:30"); });
});
