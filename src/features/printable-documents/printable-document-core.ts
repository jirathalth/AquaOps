export type AddressSnapshot = { addressLine1?: unknown; addressLine2?: unknown; subdistrict?: unknown; district?: unknown; province?: unknown; postalCode?: unknown };

export function formatAddress(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const address = value as AddressSnapshot;
  return [address.addressLine1, address.addressLine2, address.subdistrict, address.district, address.province, address.postalCode].filter((item): item is string => typeof item === "string" && Boolean(item.trim())).join(" ");
}

export function formatBusinessAddress(input: { addressLine: string | null; subdistrict: string | null; district: string | null; province: string | null; postalCode: string | null }) {
  return [input.addressLine, input.subdistrict, input.district, input.province, input.postalCode].filter((item): item is string => Boolean(item?.trim())).join(" ");
}

export function formatBranch(code: string | null | undefined) { return code ? code === "00000" ? "สำนักงานใหญ่" : `สาขา ${code}` : ""; }
