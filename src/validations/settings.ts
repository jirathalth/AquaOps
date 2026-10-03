import { z } from "zod";
import { validateThaiAddress } from "@/lib/thai-address";

const optionalText = (maximum: number) => z.string().trim().max(maximum);
const optionalEmail = z.string().trim().max(254).refine((value) => !value || z.email().safeParse(value).success, "อีเมลไม่ถูกต้อง");
const optionalUrl = z.string().trim().max(500).refine((value) => !value || z.url().safeParse(value).success, "URL ไม่ถูกต้อง");
const version = z.number().int().positive();
const nullableId = z.union([z.uuid(), z.literal("")]);
const prefix = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,8}$/, "ใช้ A–Z หรือตัวเลข 2–8 ตัว โดยไม่มีเว้นวรรค");

function validRate(value: string) { const [integer = "", fraction = ""] = value.split("."); const scaled = BigInt(integer || "0") * 100n + BigInt(fraction.padEnd(2, "0")); return scaled <= 10_000n; }

export const generalSettingsSchema = z.object({
  version,
  businessName: z.string().trim().min(1, "กรุณากรอกชื่อกิจการ").max(200),
  legalName: optionalText(200),
  taxId: z.string().trim().refine((value) => !value || /^\d{13}$/.test(value), "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก"),
  branch: optionalText(100),
  addressLine: optionalText(255),
  subdistrict: optionalText(100),
  district: optionalText(100),
  province: optionalText(100),
  postalCode: z.string().trim().refine((value) => !value || /^\d{5}$/.test(value), "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก"),
  phone: z.string().trim().max(32).refine((value) => !value || /^[0-9+()\-\s]{6,32}$/.test(value), "หมายเลขโทรศัพท์ไม่ถูกต้อง"),
  email: optionalEmail,
  website: optionalUrl,
  logoUrl: optionalUrl,
}).superRefine((value, context) => {
  const issue = validateThaiAddress(value);
  if (issue) context.addIssue({ code: "custom", path: [issue.field], message: issue.message });
});

export const salesSettingsSchema = z.object({
  version,
  defaultPriceListId: nullableId,
  defaultCreditTermDays: z.number().int().min(0, "จำนวนวันต้องไม่ต่ำกว่า 0").max(3650, "จำนวนวันสูงเกินไป"),
  defaultVatRate: z.string().trim().regex(/^\d{1,3}(?:\.\d{1,2})?$/, "อัตราภาษีต้องมีทศนิยมไม่เกิน 2 ตำแหน่ง").refine(validRate, "อัตราภาษีต้องอยู่ระหว่าง 0 ถึง 100"),
  allowManualPriceOverride: z.boolean(),
});

export const documentSettingsSchema = z.object({
  version,
  salesOrderPrefix: prefix,
  deliveryTripPrefix: prefix,
  inventoryMovementPrefix: prefix,
  invoicePrefix: prefix,
  billingNotePrefix: prefix,
  paymentPrefix: prefix,
  showTaxIdOnDocuments: z.boolean(),
  showAddressOnDocuments: z.boolean(),
  documentFooter: optionalText(500),
  paymentInstructions: optionalText(1000),
}).superRefine((value, context) => {
  const fields = ["salesOrderPrefix", "deliveryTripPrefix", "inventoryMovementPrefix", "invoicePrefix", "billingNotePrefix", "paymentPrefix"] as const;
  const seen = new Set<string>();
  for (const field of fields) { if (seen.has(value[field])) context.addIssue({ code: "custom", path: [field], message: "คำนำหน้าต้องไม่ซ้ำกับเอกสารประเภทอื่น" }); seen.add(value[field]); }
});

export const inventoryDeliverySettingsSchema = z.object({ version, defaultWarehouseId: nullableId, defaultDeliverySourceWarehouseId: nullableId });
export const financeSettingsSchema = z.object({ version, defaultPaymentMethod: z.enum(["CASH", "BANK_TRANSFER", "QR_CODE", "CHEQUE", "OTHER"]), billingInstructions: optionalText(500) });
export const localizationSettingsSchema = z.object({ version, locale: z.literal("th-TH"), currency: z.literal("THB"), timezone: z.literal("Asia/Bangkok") });

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
export type SalesSettingsValues = z.infer<typeof salesSettingsSchema>;
export type DocumentSettingsValues = z.infer<typeof documentSettingsSchema>;
export type InventoryDeliverySettingsValues = z.infer<typeof inventoryDeliverySettingsSchema>;
export type FinanceSettingsValues = z.infer<typeof financeSettingsSchema>;
export type LocalizationSettingsValues = z.infer<typeof localizationSettingsSchema>;
