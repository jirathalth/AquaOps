import { z } from "zod";
import { productSortFields } from "@/config/products";

const optionalText = (max: number) => z.string().trim().max(max);
export const priceDecimalString = z.string().trim().regex(/^\d{1,10}(?:\.\d{1,4})?$/, "กรุณากรอกจำนวนเงินไม่เกิน 4 ตำแหน่ง");
export const quantityDecimalString = z.string().trim().regex(/^\d{1,11}(?:\.\d{1,3})?$/, "กรุณากรอกจำนวนไม่เกิน 3 ตำแหน่ง");
const code = (label: string, max: number) => z.string().trim().min(1, `กรุณากรอก${label}`).max(max).regex(/^[A-Za-z0-9._-]+$/, `${label}ใช้ได้เฉพาะตัวอักษร ตัวเลข จุด _ และ -`);

export const productFormSchema = z.object({
  id: z.uuid().optional(),
  sku: code("SKU", 64),
  name: z.string().trim().min(1, "กรุณากรอกชื่อสินค้า").max(200),
  description: optionalText(2000),
  categoryId: z.union([z.literal(""), z.uuid()]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  trackInventory: z.boolean(),
  reorderLevel: quantityDecimalString,
  baseUnitId: z.uuid("กรุณาเลือกหน่วยหลัก"),
  barcode: optionalText(64).refine((value) => !/\s/.test(value), "บาร์โค้ดต้องไม่มีช่องว่าง"),
  cost: priceDecimalString,
  retailPrice: priceDecimalString,
  wholesalePrice: priceDecimalString,
});

export const productStatusSchema = z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "INACTIVE"]) });

export const productCategorySchema = z.object({ id: z.uuid().optional(), code: code("รหัสหมวดหมู่", 32), name: z.string().trim().min(1, "กรุณากรอกชื่อหมวดหมู่").max(120), isActive: z.boolean() });
export const productCategoryStatusSchema = z.object({ id: z.uuid(), isActive: z.boolean() });

export const unitSchema = z.object({ id: z.uuid().optional(), code: code("รหัสหน่วย", 32), nameTh: z.string().trim().min(1, "กรุณากรอกชื่อหน่วย").max(100), nameEn: optionalText(100), symbol: z.string().trim().min(1, "กรุณากรอกสัญลักษณ์หน่วย").max(32), decimalScale: z.number().int().min(0).max(6), isActive: z.boolean() });
export const unitStatusSchema = z.object({ id: z.uuid(), isActive: z.boolean() });

const singleQueryValue = (value: unknown) => Array.isArray(value) ? value[0] : value;
export const productListQuerySchema = z.object({
  q: z.preprocess(singleQueryValue, z.string().trim().max(120).default("")),
  categoryId: z.preprocess(singleQueryValue, z.union([z.literal("ALL"), z.uuid()]).default("ALL")),
  status: z.preprocess(singleQueryValue, z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL")),
  sort: z.preprocess(singleQueryValue, z.enum(productSortFields).default("updatedAt")),
  order: z.preprocess(singleQueryValue, z.enum(["asc", "desc"]).default("desc")),
  page: z.preprocess(singleQueryValue, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(singleQueryValue, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductCategoryValues = z.infer<typeof productCategorySchema>;
export type UnitValues = z.infer<typeof unitSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
