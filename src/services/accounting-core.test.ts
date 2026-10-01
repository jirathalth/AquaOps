import { describe, expect, it } from "vitest";
import { addBusinessDays, addMoney, agingBucket, calculateOutstanding, deriveInvoiceStatus, subtractMoney } from "@/services/accounting-core";

describe("accounting fixed-decimal rules", () => {
  it("reconciles partial and multiple allocations without floating-point drift", () => { expect(calculateOutstanding("1000.10", ["333.37", "666.73"])).toBe("0.00"); expect(subtractMoney("0.30", "0.10")).toBe("0.20"); expect(addMoney(["0.10", "0.20"])).toBe("0.30"); });
  it("rejects over-allocation", () => { expect(() => calculateOutstanding("100.00", ["100.01"])).toThrow("ยอดจัดสรรเกินยอดใบแจ้งหนี้"); });
  it("uses snapshotted credit terms for deterministic due dates", () => { expect(addBusinessDays("2026-01-31", 30)).toBe("2026-03-02"); expect(addBusinessDays("2026-02-01", 0)).toBe("2026-02-01"); });
  it.each([["2026-10-01", "2026-10-01", "CURRENT"], ["2026-09-30", "2026-10-01", "DAYS_1_30"], ["2026-09-01", "2026-10-01", "DAYS_1_30"], ["2026-08-31", "2026-10-01", "DAYS_31_60"], ["2026-08-02", "2026-10-01", "DAYS_31_60"], ["2026-08-01", "2026-10-01", "DAYS_61_90"], ["2026-07-03", "2026-10-01", "DAYS_61_90"], ["2026-07-02", "2026-10-01", "DAYS_90_PLUS"]] as const)("classifies %s at %s as %s", (due, asOf, bucket) => { expect(agingBucket(due, asOf)).toBe(bucket); });
  it("applies paid, overdue, partial, then issued precedence", () => { expect(deriveInvoiceStatus({ total: "100.00", outstanding: "0.00", dueDate: "2026-01-01", asOfDate: "2026-10-01" })).toBe("PAID"); expect(deriveInvoiceStatus({ total: "100.00", outstanding: "50.00", dueDate: "2026-01-01", asOfDate: "2026-10-01" })).toBe("OVERDUE"); expect(deriveInvoiceStatus({ total: "100.00", outstanding: "50.00", dueDate: "2026-12-01", asOfDate: "2026-10-01" })).toBe("PARTIALLY_PAID"); });
});
