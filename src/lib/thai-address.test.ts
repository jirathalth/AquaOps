import { describe, expect, it } from "vitest";
import { findThaiDistrict, findThaiProvince, findThaiSubdistrict, thaiDistrictLabel, thaiProvinces, thaiSubdistrictLabel, validateThaiAddress } from "@/lib/thai-address";
import { customerAddressSchema } from "@/validations/customer";
import { generalSettingsSchema } from "@/validations/settings";

describe("Thai geography address data", () => {
  it("includes all Thai provinces and resolves Bangkok terminology and postal code", () => {
    const bangkok = findThaiProvince("กรุงเทพฯ");
    const district = findThaiDistrict("วัฒนา", bangkok?.code);
    const subdistrict = findThaiSubdistrict("คลองเตยเหนือ", bangkok?.code, district?.code);
    expect(thaiProvinces).toHaveLength(77);
    expect(thaiDistrictLabel(bangkok)).toBe("เขต");
    expect(thaiSubdistrictLabel(bangkok)).toBe("แขวง");
    expect(subdistrict?.postalCodes).toEqual(["10110"]);
  });

  it("resolves a normal province hierarchy and postal code", () => {
    const province = findThaiProvince("เชียงใหม่");
    const district = findThaiDistrict("เมืองเชียงใหม่", province?.code);
    const subdistrict = findThaiSubdistrict("ศรีภูมิ", province?.code, district?.code);
    expect(thaiDistrictLabel(province)).toBe("อำเภอ");
    expect(thaiSubdistrictLabel(province)).toBe("ตำบล");
    expect(subdistrict?.postalCodes).toEqual(["50200"]);
  });

  it("normalizes Thai administrative prefixes and rejects stale combinations", () => {
    expect(findThaiProvince("จังหวัด เชียงใหม่")?.name).toBe("เชียงใหม่");
    expect(findThaiDistrict("อำเภอเมืองเชียงใหม่", 50)?.name).toBe("เมืองเชียงใหม่");
    expect(findThaiSubdistrict("ตำบลศรีภูมิ", 50, 5001)?.name).toBe("ศรีภูมิ");
    expect(validateThaiAddress({ province: "เชียงใหม่", district: "วัฒนา", subdistrict: "คลองเตยเหนือ", postalCode: "10110" })?.field).toBe("district");
    expect(validateThaiAddress({ province: "กรุงเทพมหานคร", district: "วัฒนา", subdistrict: "คลองเตยเหนือ", postalCode: "10200" })?.field).toBe("postalCode");
  });

  it("keeps saved legacy values valid while rejecting recognized impossible values", () => {
    expect(validateThaiAddress({ province: "กรุงเทพฯ", district: "เขตวัฒนา", subdistrict: "แขวงคลองเตยเหนือ", postalCode: "10110" })).toBeUndefined();
    expect(customerAddressSchema.safeParse({ id: "", type: "BILLING", label: "", contactName: "", phone: "", addressLine1: "1 ถนนสุขุมวิท", addressLine2: "", province: "เชียงใหม่", district: "วัฒนา", subdistrict: "คลองเตยเหนือ", postalCode: "10110", countryCode: "TH", deliveryNotes: "", isDefault: true }).success).toBe(false);
    expect(generalSettingsSchema.safeParse({ version: 1, businessName: "AquaOps", legalName: "", taxId: "", branch: "", addressLine: "", province: "เชียงใหม่", district: "วัฒนา", subdistrict: "คลองเตยเหนือ", postalCode: "10110", phone: "", email: "", website: "", logoUrl: "" }).success).toBe(false);
  });
});
