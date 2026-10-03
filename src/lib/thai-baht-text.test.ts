import { describe, expect, it } from "vitest";
import { thaiBahtText } from "@/lib/thai-baht-text";

describe("thaiBahtText", () => {
  it.each([
    ["0.00", "ศูนย์บาทถ้วน"],
    ["10.00", "สิบบาทถ้วน"],
    ["21.00", "ยี่สิบเอ็ดบาทถ้วน"],
    ["101.25", "หนึ่งร้อยเอ็ดบาทยี่สิบห้าสตางค์"],
    ["11000.00", "หนึ่งหมื่นหนึ่งพันบาทถ้วน"],
    ["1000001.01", "หนึ่งล้านเอ็ดบาทหนึ่งสตางค์"],
    ["10000000.00", "สิบล้านบาทถ้วน"],
  ])("renders %s in Thai", (value, expected) => { expect(thaiBahtText(value)).toBe(expected); });

  it("rejects values with unsupported precision", () => { expect(thaiBahtText("1.234")).toBe(""); });
});
