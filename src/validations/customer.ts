import { z } from "zod";
import { customerSortFields } from "@/config/customers";

const optionalText = (max: number) => z.string().trim().max(max);
const optionalEmail = z.union([z.literal(""), z.email("กรุณากรอกอีเมลให้ถูกต้อง")]);
const optionalPhone = z.string().trim().max(32).regex(/^[0-9+()\-\s]*$/, "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
const optionalTaxId = z.string().trim().regex(/^$|^\d{13}$/, "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก");
const optionalBranchCode = z.string().trim().regex(/^$|^\d{5}$/, "รหัสสาขาต้องเป็นตัวเลข 5 หลัก");
const moneyString = z.string().trim().regex(/^\d{1,12}(?:\.\d{1,2})?$/, "กรุณากรอกจำนวนเงินไม่เกิน 2 ตำแหน่ง");

export const customerAddressSchema = z.object({
  id: z.union([z.literal(""), z.uuid()]),
  type: z.enum(["BILLING", "SHIPPING"]),
  label: optionalText(100),
  contactName: optionalText(120),
  phone: optionalPhone,
  addressLine1: z.string().trim().min(1, "กรุณากรอกที่อยู่").max(255),
  addressLine2: optionalText(255),
  subdistrict: optionalText(100),
  district: optionalText(100),
  province: z.string().trim().min(1, "กรุณากรอกจังหวัด").max(100),
  postalCode: z.string().trim().regex(/^$|^\d{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก"),
  countryCode: z.string().trim().length(2),
  deliveryNotes: optionalText(500),
  isDefault: z.boolean(),
});

export const customerFormSchema = z.object({
  id: z.uuid().optional(),
  type: z.enum(["RETAIL", "WHOLESALE"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  displayName: z.string().trim().min(1, "กรุณากรอกชื่อลูกค้า").max(200),
  legalName: optionalText(200),
  taxId: optionalTaxId,
  taxBranchCode: optionalBranchCode,
  contactName: optionalText(120),
  phone: optionalPhone,
  email: optionalEmail,
  defaultSaleType: z.enum(["CASH", "CREDIT"]),
  creditTermDays: z.number().int("เครดิตต้องเป็นจำนวนวันเต็ม").min(0, "เครดิตต้องไม่น้อยกว่า 0").max(3650),
  creditLimit: moneyString,
  billingCycle: z.enum(["NONE", "DAY_15", "END_OF_MONTH", "DAY_15_AND_END_OF_MONTH", "CUSTOM"]),
  billingCycleNote: optionalText(200),
  defaultPriceListId: z.union([z.literal(""), z.uuid()]),
  notes: optionalText(2000),
  addresses: z.array(customerAddressSchema).max(20, "เพิ่มที่อยู่ได้ไม่เกิน 20 รายการ"),
}).superRefine((value, context) => {
  if (value.taxBranchCode && !value.taxId) context.addIssue({ code: "custom", path: ["taxId"], message: "กรุณากรอกเลขประจำตัวผู้เสียภาษีก่อนระบุสาขา" });
  if (value.billingCycle === "CUSTOM" && !value.billingCycleNote) context.addIssue({ code: "custom", path: ["billingCycleNote"], message: "กรุณาระบุรอบวางบิล" });
  for (const type of ["BILLING", "SHIPPING"] as const) if (value.addresses.filter((address) => address.type === type && address.isDefault).length > 1) context.addIssue({ code: "custom", path: ["addresses"], message: `กำหนดที่อยู่หลักประเภท ${type} ได้เพียงหนึ่งรายการ` });
});

const singleQueryValue = (value: unknown) => Array.isArray(value) ? value[0] : value;
export const customerListQuerySchema = z.object({
  q: z.preprocess(singleQueryValue, z.string().trim().max(120).default("")),
  type: z.preprocess(singleQueryValue, z.enum(["ALL", "RETAIL", "WHOLESALE"]).default("ALL")),
  status: z.preprocess(singleQueryValue, z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL")),
  priceListId: z.preprocess(singleQueryValue, z.union([z.literal("ALL"), z.uuid()]).default("ALL")),
  credit: z.preprocess(singleQueryValue, z.enum(["ALL", "CASH", "CREDIT"]).default("ALL")),
  sort: z.preprocess(singleQueryValue, z.enum(customerSortFields).default("updatedAt")),
  order: z.preprocess(singleQueryValue, z.enum(["asc", "desc"]).default("desc")),
  page: z.preprocess(singleQueryValue, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(singleQueryValue, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
});

export const customerStatusSchema = z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "INACTIVE"]) });
export type CustomerAddressValues = z.infer<typeof customerAddressSchema>;
export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
export type CustomerStatusValues = z.infer<typeof customerStatusSchema>;
