import geographyRows from "@/data/thai-geography.json";

type GeographyRow = [number, string, number, string, number, string, string];
export type ThaiAddressValue = { province: string; district: string; subdistrict: string; postalCode: string };
export type ThaiAddressField = keyof ThaiAddressValue;

export type ThaiProvince = { code: number; name: string };
export type ThaiDistrict = { code: number; provinceCode: number; name: string };
export type ThaiSubdistrict = { code: number; provinceCode: number; districtCode: number; name: string; postalCodes: string[] };

const rows = geographyRows as GeographyRow[];
const trimPrefixes = /^(จังหวัด|อำเภอ|เขต|ตำบล|แขวง)\s*/;

export function normalizeThaiAddressName(value: string) { return value.trim().replace(trimPrefixes, "").replace(/[.\s]/g, "").replace("กรุงเทพฯ", "กรุงเทพมหานคร"); }

const uniqueBy = <T>(items: T[], key: (item: T) => string | number) => Array.from(new Map(items.map((item) => [key(item), item])).values());
export const thaiProvinces = uniqueBy(rows.map(([code, name]) => ({ code, name })), (item) => item.code);
export const thaiDistricts = uniqueBy(rows.map(([provinceCode, , code, name]) => ({ code, provinceCode, name })), (item) => item.code);
export const thaiSubdistricts = Array.from(rows.reduce((items, [provinceCode, , districtCode, , code, name, postalCode]) => {
  const current = items.get(code);
  if (current) current.postalCodes.add(postalCode);
  else items.set(code, { code, provinceCode, districtCode, name, postalCodes: new Set([postalCode]) });
  return items;
}, new Map<number, { code: number; provinceCode: number; districtCode: number; name: string; postalCodes: Set<string> }>()).values()).map((item) => ({ ...item, postalCodes: [...item.postalCodes] }));

function byName<T extends { name: string }>(items: T[], value: string) { const normalized = normalizeThaiAddressName(value); return items.find((item) => normalizeThaiAddressName(item.name) === normalized); }

export function findThaiProvince(value: string) { return byName(thaiProvinces, value); }
export function findThaiDistrict(value: string, provinceCode?: number) { return byName(provinceCode ? thaiDistricts.filter((item) => item.provinceCode === provinceCode) : thaiDistricts, value); }
export function findThaiSubdistrict(value: string, provinceCode?: number, districtCode?: number) { return byName(thaiSubdistricts.filter((item) => (provinceCode === undefined || item.provinceCode === provinceCode) && (districtCode === undefined || item.districtCode === districtCode)), value); }
export function thaiDistrictLabel(province: ThaiProvince | undefined) { return province?.code === 10 ? "เขต" : "อำเภอ"; }
export function thaiSubdistrictLabel(province: ThaiProvince | undefined) { return province?.code === 10 ? "แขวง" : "ตำบล"; }

export function validateThaiAddress(value: ThaiAddressValue) {
  const province = findThaiProvince(value.province);
  if (!province) return undefined;
  const districtAnywhere = value.district ? findThaiDistrict(value.district) : undefined;
  const district = value.district ? findThaiDistrict(value.district, province.code) : undefined;
  if (districtAnywhere && !district) return { field: "district" as const, message: "เขต / อำเภอไม่อยู่ในจังหวัดที่เลือก" };
  const subdistrictAnywhere = value.subdistrict ? findThaiSubdistrict(value.subdistrict) : undefined;
  const subdistrict = value.subdistrict && district ? findThaiSubdistrict(value.subdistrict, province.code, district.code) : undefined;
  if (subdistrictAnywhere && !subdistrict) return { field: "subdistrict" as const, message: "แขวง / ตำบลไม่อยู่ในเขต / อำเภอที่เลือก" };
  if (subdistrict && subdistrict.postalCodes.length !== 1) return { field: "postalCode" as const, message: "ไม่สามารถระบุรหัสไปรษณีย์ของแขวง / ตำบลนี้ได้อย่างปลอดภัย" };
  if (subdistrict && value.postalCode && subdistrict.postalCodes[0] !== value.postalCode) return { field: "postalCode" as const, message: "รหัสไปรษณีย์ไม่ตรงกับแขวง / ตำบลที่เลือก" };
  return undefined;
}
