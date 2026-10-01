import { z } from "zod";

const single = (value: unknown) => Array.isArray(value) ? value[0] : value;
const date = z.union([z.literal(""), z.iso.date()]);
const identifier = z.union([z.literal("ALL"), z.uuid()]).default("ALL");
const customerType = z.enum(["ALL", "RETAIL", "WHOLESALE"]).default("ALL");
const paymentType = z.enum(["ALL", "CASH", "CREDIT"]).default("ALL");
const status = z.enum(["ALL", "CONFIRMED", "PREPARING", "READY", "DELIVERING", "DELIVERED", "COMPLETED", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "OPENING", "RECEIPT", "ISSUE", "TRANSFER", "ADJUSTMENT", "SALE", "DELIVERY", "RETURN", "DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID", "PENDING"]).default("ALL");
const tripStatus = z.enum(["ALL", "PLANNED", "LOADING", "IN_TRANSIT", "COMPLETED", "CANCELLED"]).default("ALL");
const deliveryResult = z.enum(["ALL", "DELIVERED", "FAILED"]).default("ALL");
const paymentMethod = z.enum(["ALL", "CASH", "BANK_TRANSFER", "QR_CODE", "CHEQUE", "OTHER"]).default("ALL");

export const reportQuerySchema = z.object({
  q: z.preprocess(single, z.string().trim().max(120).default("")), period: z.preprocess(single, z.enum(["today", "this-month", "previous-month", "custom"]).default("this-month")),
  dateFrom: z.preprocess(single, date.default("")), dateTo: z.preprocess(single, date.default("")), dueFrom: z.preprocess(single, date.default("")), dueTo: z.preprocess(single, date.default("")), asOfDate: z.preprocess(single, date.default("")),
  customerId: z.preprocess(single, identifier), customerType: z.preprocess(single, customerType), paymentType: z.preprocess(single, paymentType), status: z.preprocess(single, status), salespersonId: z.preprocess(single, identifier),
  productId: z.preprocess(single, identifier), categoryId: z.preprocess(single, identifier), warehouseId: z.preprocess(single, identifier), tripStatus: z.preprocess(single, tripStatus), driverId: z.preprocess(single, identifier), vehicleId: z.preprocess(single, identifier), result: z.preprocess(single, deliveryResult), method: z.preprocess(single, paymentMethod),
  sort: z.preprocess(single, z.string().trim().max(50).default("date")), order: z.preprocess(single, z.enum(["asc", "desc"]).default("desc")), page: z.preprocess(single, z.coerce.number().int().min(1).default(1)), pageSize: z.preprocess(single, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
}).superRefine((value, context) => { for (const [from, to] of [[value.dateFrom, value.dateTo], [value.dueFrom, value.dueTo]]) if (from && to && to < from) context.addIssue({ code: "custom", message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น" }); });

export type ReportQuery = z.infer<typeof reportQuerySchema>;
