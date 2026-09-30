import { z } from "zod";
import { movementSortFields, stockSortFields, warehouseSortFields } from "@/config/inventory";
import { quantityDecimalString } from "@/validations/product";

const single = (value: unknown) => Array.isArray(value) ? value[0] : value;
const optionalDate = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "กรุณาระบุวันที่ให้ถูกต้อง")]);
const positiveQuantity = quantityDecimalString.refine((value) => !/^0(?:\.0+)?$/.test(value), "จำนวนต้องมากกว่า 0");
const code = z.string().trim().min(1, "กรุณากรอกรหัสคลังสินค้า").max(32).regex(/^[A-Za-z0-9._-]+$/, "รหัสใช้ได้เฉพาะตัวอักษร ตัวเลข จุด _ และ -");

export const warehouseFormSchema = z.object({ id: z.uuid().optional(), code, name: z.string().trim().min(1, "กรุณากรอกชื่อคลังสินค้า").max(120), isDefault: z.boolean() });
export const warehouseStatusSchema = z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "INACTIVE"]) });
export const warehouseListQuerySchema = z.object({
  q: z.preprocess(single, z.string().trim().max(120).default("")), status: z.preprocess(single, z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL")),
  sort: z.preprocess(single, z.enum(warehouseSortFields).default("updatedAt")), order: z.preprocess(single, z.enum(["asc", "desc"]).default("asc")),
  page: z.preprocess(single, z.coerce.number().int().min(1).default(1)), pageSize: z.preprocess(single, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
});

export const stockListQuerySchema = z.object({
  q: z.preprocess(single, z.string().trim().max(120).default("")), warehouseId: z.preprocess(single, z.union([z.literal("ALL"), z.uuid()]).default("ALL")),
  categoryId: z.preprocess(single, z.union([z.literal("ALL"), z.uuid()]).default("ALL")), status: z.preprocess(single, z.enum(["ALL", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).default("ALL")),
  productStatus: z.preprocess(single, z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL")), sort: z.preprocess(single, z.enum(stockSortFields).default("updatedAt")),
  order: z.preprocess(single, z.enum(["asc", "desc"]).default("desc")), page: z.preprocess(single, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(single, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
});

export const movementListQuerySchema = z.object({
  q: z.preprocess(single, z.string().trim().max(120).default("")), warehouseId: z.preprocess(single, z.union([z.literal("ALL"), z.uuid()]).default("ALL")),
  productId: z.preprocess(single, z.union([z.literal("ALL"), z.uuid()]).default("ALL")), type: z.preprocess(single, z.enum(["ALL", "OPENING", "RECEIPT", "ISSUE", "TRANSFER", "ADJUSTMENT", "SALE", "DELIVERY", "RETURN"]).default("ALL")),
  dateFrom: z.preprocess(single, optionalDate.default("")), dateTo: z.preprocess(single, optionalDate.default("")), sort: z.preprocess(single, z.enum(movementSortFields).default("occurredAt")),
  order: z.preprocess(single, z.enum(["asc", "desc"]).default("desc")), page: z.preprocess(single, z.coerce.number().int().min(1).default(1)),
  pageSize: z.preprocess(single, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
}).superRefine((value, context) => { if (value.dateFrom && value.dateTo && value.dateTo < value.dateFrom) context.addIssue({ code: "custom", path: ["dateTo"], message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น" }); });

export const stockAdjustmentSchema = z.object({
  warehouseId: z.uuid("กรุณาเลือกคลังสินค้า"), productUnitId: z.uuid("กรุณาเลือกสินค้า"), direction: z.enum(["IN", "OUT"]), quantity: positiveQuantity,
  reason: z.enum(["PHYSICAL_COUNT", "DATA_CORRECTION", "FOUND_STOCK", "MISSING_STOCK", "OTHER"]), note: z.string().trim().max(1000),
}).superRefine((value, context) => { if (value.reason === "OTHER" && !value.note) context.addIssue({ code: "custom", path: ["note"], message: "กรุณาระบุรายละเอียดเมื่อเลือกเหตุผลอื่น ๆ" }); });

export const stockTransferSchema = z.object({
  sourceWarehouseId: z.uuid("กรุณาเลือกคลังต้นทาง"), destinationWarehouseId: z.uuid("กรุณาเลือกคลังปลายทาง"), productUnitId: z.uuid("กรุณาเลือกสินค้า"), quantity: positiveQuantity, note: z.string().trim().max(1000),
}).superRefine((value, context) => { if (value.sourceWarehouseId === value.destinationWarehouseId) context.addIssue({ code: "custom", path: ["destinationWarehouseId"], message: "คลังต้นทางและคลังปลายทางต้องไม่ใช่คลังเดียวกัน" }); });

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;
export type WarehouseListQuery = z.infer<typeof warehouseListQuerySchema>;
export type StockListQuery = z.infer<typeof stockListQuerySchema>;
export type MovementListQuery = z.infer<typeof movementListQuerySchema>;
export type StockAdjustmentValues = z.infer<typeof stockAdjustmentSchema>;
export type StockTransferValues = z.infer<typeof stockTransferSchema>;
