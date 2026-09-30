import { z } from "zod";
import { priceListSortFields } from "@/config/products";
import { priceDecimalString, quantityDecimalString } from "@/validations/product";

const optionalText = (max: number) => z.string().trim().max(max);
const code = z.string().trim().min(1, "กรุณากรอกรหัสรายการราคา").max(32).regex(/^[A-Za-z0-9._-]+$/, "ใช้ได้เฉพาะตัวอักษร ตัวเลข จุด _ และ -");
const dateString = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง")]);

export const priceListFormSchema = z.object({ id: z.uuid().optional(), code, name: z.string().trim().min(1, "กรุณากรอกชื่อรายการราคา").max(120), description: optionalText(2000), status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]), validFrom: dateString, validTo: dateString }).superRefine((value, context) => { if (value.validFrom && value.validTo && value.validTo < value.validFrom) context.addIssue({ code: "custom", path: ["validTo"], message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น" }); });
export const priceListStatusSchema = z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "INACTIVE"]) });
export const priceListItemSchema = z.object({ id: z.uuid().optional(), priceListId: z.uuid(), productUnitId: z.uuid("กรุณาเลือกสินค้าและหน่วย"), minimumQuantity: quantityDecimalString.refine((value) => !/^0(?:\.0+)?$/.test(value), "จำนวนขั้นต่ำต้องมากกว่า 0"), unitPrice: priceDecimalString });
export const priceListItemDeleteSchema = z.object({ id: z.uuid(), priceListId: z.uuid() });
export const customerPriceSchema = z.object({ id: z.uuid().optional(), customerId: z.uuid(), productUnitId: z.uuid("กรุณาเลือกสินค้าและหน่วย"), unitPrice: priceDecimalString });
export const customerPriceDeactivateSchema = z.object({ id: z.uuid(), customerId: z.uuid() });
export const pricePreviewSchema = z.object({ customerId: z.uuid(), productUnitId: z.uuid() });

const singleQueryValue = (value: unknown) => Array.isArray(value) ? value[0] : value;
export const priceListQuerySchema = z.object({
  q: z.preprocess(singleQueryValue, z.string().trim().max(120).default("")),
  status: z.preprocess(singleQueryValue, z.enum(["ALL", "DRAFT", "ACTIVE", "INACTIVE"]).default("ALL")),
  sort: z.preprocess(singleQueryValue, z.enum(priceListSortFields).default("updatedAt")),
  order: z.preprocess(singleQueryValue, z.enum(["asc", "desc"]).default("desc")),
  page: z.preprocess(singleQueryValue, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(singleQueryValue, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
});

export type PriceListFormValues = z.infer<typeof priceListFormSchema>;
export type PriceListItemValues = z.infer<typeof priceListItemSchema>;
export type CustomerPriceValues = z.infer<typeof customerPriceSchema>;
export type PriceListQuery = z.infer<typeof priceListQuerySchema>;
