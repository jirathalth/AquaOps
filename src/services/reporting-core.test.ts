import { describe, expect, it } from "vitest";
import { aggregateMoneyByKey, bangkokTimestampRange, createCsv, isReportableSalesStatus, resolveReportRange, sanitizeCsvCell } from "@/services/reporting-core";
import { reportQuerySchema } from "@/validations/reporting";

describe("reporting date semantics", () => {
  const now = new Date("2026-09-30T18:30:00.000Z");
  it("uses the Bangkok business date and deterministic month ranges", () => { expect(resolveReportRange({}, now)).toEqual({ period: "this-month", dateFrom: "2026-10-01", dateTo: "2026-10-01" }); expect(resolveReportRange({ period: "previous-month" }, now)).toEqual({ period: "previous-month", dateFrom: "2026-09-01", dateTo: "2026-09-30" }); });
  it("creates half-open Bangkok timestamp boundaries", () => { const range = bangkokTimestampRange("2026-10-01", "2026-10-01"); expect(range.gte.toISOString()).toBe("2026-09-30T17:00:00.000Z"); expect(range.lt.toISOString()).toBe("2026-10-01T17:00:00.000Z"); });
});

describe("CSV safety", () => {
  it("escapes spreadsheet formulas, quotes, commas and Thai text", () => { expect(sanitizeCsvCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)"); expect(sanitizeCsvCell('น้ำดื่ม, "ใส"')).toBe('"น้ำดื่ม, ""ใส"""'); expect(createCsv(["สินค้า"], [["น้ำดื่ม"]])).toBe("\uFEFFสินค้า\r\nน้ำดื่ม"); });
});

describe("sales reporting rules", () => {
  it("excludes drafts, legacy pending orders, and cancelled orders", () => { expect(isReportableSalesStatus("DRAFT")).toBe(false); expect(isReportableSalesStatus("PENDING")).toBe(false); expect(isReportableSalesStatus("CANCELLED")).toBe(false); expect(isReportableSalesStatus("CONFIRMED")).toBe(true); });
  it("aggregates cash and credit without floating point arithmetic", () => { expect(aggregateMoneyByKey([{ key: "CASH", value: "0.10" }, { key: "CASH", value: "0.20" }, { key: "CREDIT", value: "100.25" }], ["CASH", "CREDIT"])).toEqual({ CASH: "0.30", CREDIT: "100.25" }); });
});

describe("report filters", () => {
  it("accepts URL-compatible values and rejects invalid dates, IDs, and enum values", () => { expect(reportQuerySchema.parse({ period: "custom", dateFrom: "2026-10-01", dateTo: "2026-10-31", status: "COMPLETED" })).toMatchObject({ dateFrom: "2026-10-01", status: "COMPLETED" }); expect(reportQuerySchema.safeParse({ dateFrom: "2026-13-40" }).success).toBe(false); expect(reportQuerySchema.safeParse({ customerId: "not-an-id" }).success).toBe(false); expect(reportQuerySchema.safeParse({ method: "CRYPTO" }).success).toBe(false); });
});
