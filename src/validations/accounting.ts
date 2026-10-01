import { z } from "zod";

const businessDate = z.iso.date("วันที่ไม่ถูกต้อง");
const money = z.string().trim().regex(/^\d{1,12}(?:\.\d{1,2})?$/, "กรุณากรอกจำนวนเงินไม่เกิน 2 ตำแหน่ง");
const positiveMoney = money.refine((value) => !/^0(?:\.0+)?$/.test(value), "จำนวนเงินต้องมากกว่า 0");
export const invoiceCreateSchema = z.object({ salesOrderId: z.uuid("กรุณาเลือกคำสั่งซื้อ"), invoiceDate: businessDate, notes: z.string().trim().max(2000).default("") });
export const documentActionSchema = z.object({ id: z.uuid("ไม่พบเอกสาร") });
export const cancellationSchema = z.object({ id: z.uuid("ไม่พบเอกสาร"), reason: z.string().trim().min(3, "กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร").max(500) });
export const billingCreateSchema = z.object({ customerId: z.uuid("กรุณาเลือกลูกค้า"), billingDate: businessDate, dueDate: businessDate, invoiceIds: z.array(z.uuid()).min(1, "กรุณาเลือกใบแจ้งหนี้อย่างน้อย 1 รายการ"), notes: z.string().trim().max(2000).default("") }).refine((value) => value.dueDate >= value.billingDate, { path: ["dueDate"], message: "วันครบกำหนดต้องไม่ก่อนวันที่วางบิล" });
export const paymentCreateSchema = z.object({ idempotencyKey: z.uuid(), customerId: z.uuid("กรุณาเลือกลูกค้า"), paymentDate: businessDate, amount: positiveMoney, method: z.enum(["CASH", "BANK_TRANSFER", "QR_CODE", "CHEQUE", "OTHER"]), externalReference: z.string().trim().max(100).default(""), receivedAccount: z.string().trim().max(120).default(""), notes: z.string().trim().max(2000).default(""), billingNoteId: z.uuid().optional(), allocations: z.array(z.object({ invoiceId: z.uuid(), amount: positiveMoney })).max(200) });
export const arQuerySchema = z.object({ asOfDate: businessDate.optional(), q: z.string().trim().max(120).default("") });
export type InvoiceCreateValues = z.infer<typeof invoiceCreateSchema>;
export type BillingCreateValues = z.infer<typeof billingCreateSchema>;
export type PaymentCreateValues = z.infer<typeof paymentCreateSchema>;
