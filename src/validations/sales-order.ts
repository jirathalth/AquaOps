import { z } from "zod";
import { salesOrderSortFields } from "@/config/sales-orders";
import { priceDecimalString, quantityDecimalString } from "@/validations/product";

const money2 = z.string().trim().regex(/^\d{1,12}(?:\.\d{1,2})?$/, "กรุณากรอกจำนวนเงินไม่เกิน 2 ตำแหน่ง");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "กรุณาระบุวันที่ให้ถูกต้อง");
const optionalDate = z.union([z.literal(""), date]);

export const salesOrderItemSchema = z.object({
  id: z.uuid().optional(), productUnitId: z.uuid("กรุณาเลือกสินค้า"), quantity: quantityDecimalString.refine((value) => !/^0(?:\.0+)?$/.test(value), "จำนวนต้องมากกว่า 0"),
  unitPrice: priceDecimalString, resolvedUnitPrice: priceDecimalString, priceSource: z.enum(["CUSTOMER_OVERRIDE", "PRICE_LIST", "PRODUCT_DEFAULT"]),
  discountAmount: money2, taxRate: z.string().trim().regex(/^\d{1,3}(?:\.\d{1,2})?$/, "อัตราภาษีไม่ถูกต้อง").refine((value) => Number(value) <= 100, "อัตราภาษีต้องไม่เกิน 100"),
});

export const salesOrderFormSchema = z.object({
  id: z.uuid().optional(), customerId: z.uuid("กรุณาเลือกลูกค้า"), warehouseId: z.uuid("กรุณาเลือกคลังสินค้า"), orderDate: date,
  requestedDeliveryDate: optionalDate, saleType: z.enum(["CASH", "CREDIT"]), documentDiscountAmount: money2, notes: z.string().trim().max(2000),
  items: z.array(salesOrderItemSchema).min(1, "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ").max(100, "เพิ่มสินค้าได้ไม่เกิน 100 รายการ"),
}).superRefine((value, context) => { if (value.requestedDeliveryDate && value.requestedDeliveryDate < value.orderDate) context.addIssue({ code: "custom", path: ["requestedDeliveryDate"], message: "วันที่จัดส่งต้องไม่ก่อนวันที่สั่งซื้อ" }); });

const single = (value: unknown) => Array.isArray(value) ? value[0] : value;
export const salesOrderListQuerySchema = z.object({
  q: z.preprocess(single, z.string().trim().max(120).default("")),
  status: z.preprocess(single, z.enum(["ALL", "DRAFT", "CONFIRMED", "PREPARING", "READY", "DELIVERING", "DELIVERED", "COMPLETED", "CANCELLED"]).default("ALL")),
  saleType: z.preprocess(single, z.enum(["ALL", "CASH", "CREDIT"]).default("ALL")), customerType: z.preprocess(single, z.enum(["ALL", "RETAIL", "WHOLESALE"]).default("ALL")),
  dateFrom: z.preprocess(single, optionalDate.default("")), dateTo: z.preprocess(single, optionalDate.default("")),
  sort: z.preprocess(single, z.enum(salesOrderSortFields).default("updatedAt")), order: z.preprocess(single, z.enum(["asc", "desc"]).default("desc")),
  page: z.preprocess(single, z.coerce.number().int().min(1).default(1)), pageSize: z.preprocess(single, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
}).superRefine((value, context) => { if (value.dateFrom && value.dateTo && value.dateTo < value.dateFrom) context.addIssue({ code: "custom", path: ["dateTo"], message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น" }); });

export const salesOrderTransitionSchema = z.object({ id: z.uuid(), toStatus: z.enum(["CONFIRMED", "CANCELLED"]), note: z.string().trim().max(500).default("") });
export const salesOrderPriceResolutionSchema = z.object({ customerId: z.uuid(), productUnitId: z.uuid(), quantity: quantityDecimalString });
export type SalesOrderFormValues = z.infer<typeof salesOrderFormSchema>;
export type SalesOrderListQuery = z.infer<typeof salesOrderListQuerySchema>;
