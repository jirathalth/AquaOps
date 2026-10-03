"use client";

import { Combobox } from "@/components/shared/form-controls";
import { FormField } from "@/components/shared/form-layout";
import { Input } from "@/components/ui/input";
import { findThaiDistrict, findThaiProvince, findThaiSubdistrict, thaiDistrictLabel, thaiDistricts, thaiProvinces, thaiSubdistrictLabel, thaiSubdistricts, type ThaiAddressValue } from "@/lib/thai-address";

type FieldErrors = Partial<Record<keyof ThaiAddressValue, string | undefined>>;
type Props = { idPrefix: string; value: ThaiAddressValue; onChange: (value: Partial<ThaiAddressValue>) => void; errors?: FieldErrors; disabled?: boolean };

function optionsFor(current: string, options: Array<{ name: string }>) { return current && !options.some((item) => item.name === current) ? [{ value: current, label: `${current} (ข้อมูลเดิม)` }, ...options.map((item) => ({ value: item.name, label: item.name }))] : options.map((item) => ({ value: item.name, label: item.name })); }

export function ThaiAddressFields({ idPrefix, value, onChange, errors, disabled }: Props) {
  const province = findThaiProvince(value.province);
  const district = findThaiDistrict(value.district, province?.code);
  const provinces = optionsFor(value.province, thaiProvinces);
  const districts = province ? optionsFor(value.district, thaiDistricts.filter((item) => item.provinceCode === province.code)) : [];
  const subdistricts = province && district ? optionsFor(value.subdistrict, thaiSubdistricts.filter((item) => item.provinceCode === province.code && item.districtCode === district.code)) : [];
  const districtLabel = thaiDistrictLabel(province);
  const subdistrictLabel = thaiSubdistrictLabel(province);
  return <><FormField label="จังหวัด" htmlFor={`${idPrefix}-province`} required error={errors?.province}><Combobox id={`${idPrefix}-province`} value={value.province} disabled={disabled} placeholder="ค้นหาจังหวัด" options={provinces} aria-invalid={Boolean(errors?.province)} onValueChange={(nextValue) => { const next = findThaiProvince(nextValue); onChange({ province: next?.name ?? nextValue, district: "", subdistrict: "", postalCode: "" }); }} /></FormField><FormField label={districtLabel} htmlFor={`${idPrefix}-district`} error={errors?.district}><Combobox id={`${idPrefix}-district`} value={value.district} disabled={disabled || !province} placeholder={province ? `ค้นหา${districtLabel}` : "เลือกจังหวัดก่อน"} options={districts} aria-invalid={Boolean(errors?.district)} onValueChange={(nextValue) => { const next = findThaiDistrict(nextValue, province?.code); onChange({ district: next?.name ?? nextValue, subdistrict: "", postalCode: "" }); }} /></FormField><FormField label={subdistrictLabel} htmlFor={`${idPrefix}-subdistrict`} error={errors?.subdistrict}><Combobox id={`${idPrefix}-subdistrict`} value={value.subdistrict} disabled={disabled || !district} placeholder={district ? `ค้นหา${subdistrictLabel}` : `เลือก${districtLabel}ก่อน`} options={subdistricts} aria-invalid={Boolean(errors?.subdistrict)} onValueChange={(nextValue) => { const next = findThaiSubdistrict(nextValue, province?.code, district?.code); onChange({ subdistrict: next?.name ?? nextValue, postalCode: next?.postalCodes.length === 1 ? next.postalCodes[0] : "" }); }} /></FormField><FormField label="รหัสไปรษณีย์" htmlFor={`${idPrefix}-postal`} error={errors?.postalCode}><Input id={`${idPrefix}-postal`} value={value.postalCode} readOnly aria-readonly="true" inputMode="numeric" className="bg-muted/60 tabular-nums" aria-invalid={Boolean(errors?.postalCode)} /></FormField></>;
}
