import { describe, expect, it } from "vitest";
import { formatAddress, formatBranch, formatBusinessAddress } from "@/features/printable-documents/printable-document-core";

describe("printable document optional fields", () => {
  it("omits missing address fields without placeholders", () => { expect(formatAddress({ addressLine1: "99 ถนนสุขุมวิท", district: "วัฒนา", province: "กรุงเทพฯ", postalCode: null })).toBe("99 ถนนสุขุมวิท วัฒนา กรุงเทพฯ"); });
  it("returns an empty string for an absent snapshot", () => { expect(formatAddress(null)).toBe(""); });
  it("formats business addresses and tax branches", () => { expect(formatBusinessAddress({ addressLine: "1 ถนนหลัก", subdistrict: null, district: "เมือง", province: "เชียงใหม่", postalCode: "50000" })).toBe("1 ถนนหลัก เมือง เชียงใหม่ 50000"); expect(formatBranch("00000")).toBe("สำนักงานใหญ่"); expect(formatBranch("00001")).toBe("สาขา 00001"); });
});
