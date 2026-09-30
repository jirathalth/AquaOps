import { z } from "zod";
import { deliveryTripSortFields, failedDeliveryReasons } from "@/config/delivery";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "กรุณาระบุวันที่ให้ถูกต้อง");
const single = (value: unknown) => Array.isArray(value) ? value[0] : value;

export const deliveryTripFormSchema = z.object({
  id: z.uuid().optional(), plannedDate: date, warehouseId: z.uuid("กรุณาเลือกคลังต้นทาง"), vehicleId: z.uuid("กรุณาเลือกรถจัดส่ง"), driverId: z.string().trim().min(1, "กรุณาเลือกพนักงานขับรถ"), notes: z.string().trim().max(2000), orderIds: z.array(z.uuid()).max(100, "เลือกรายการได้ไม่เกิน 100 คำสั่งซื้อ"),
});

export const deliveryTripListQuerySchema = z.object({
  q: z.preprocess(single, z.string().trim().max(120).default("")), status: z.preprocess(single, z.enum(["ALL", "PLANNED", "LOADING", "IN_TRANSIT", "COMPLETED", "CANCELLED"]).default("ALL")),
  driverId: z.preprocess(single, z.string().default("ALL")), vehicleId: z.preprocess(single, z.string().default("ALL")), dateFrom: z.preprocess(single, z.union([z.literal(""), date]).default("")), dateTo: z.preprocess(single, z.union([z.literal(""), date]).default("")),
  sort: z.preprocess(single, z.enum(deliveryTripSortFields).default("plannedDate")), order: z.preprocess(single, z.enum(["asc", "desc"]).default("desc")), page: z.preprocess(single, z.coerce.number().int().min(1).default(1)), pageSize: z.preprocess(single, z.coerce.number().int().refine((value) => [20, 50, 100].includes(value)).default(20)),
}).superRefine((value, context) => { if (value.dateFrom && value.dateTo && value.dateTo < value.dateFrom) context.addIssue({ code: "custom", path: ["dateTo"], message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น" }); });

export const assignDeliveryOrderSchema = z.object({ tripId: z.uuid(), orderId: z.uuid() });
export const removeDeliveryOrderSchema = z.object({ tripId: z.uuid(), deliveryId: z.uuid() });
export const reorderDeliveryStopsSchema = z.object({ tripId: z.uuid(), stopIds: z.array(z.uuid()).min(1).max(100) });
export const deliveryTripActionSchema = z.object({ id: z.uuid() });
export const deliveryResultSchema = z.object({ deliveryId: z.uuid(), result: z.enum(["DELIVERED", "FAILED"]), receivedBy: z.string().trim().max(120).default(""), failureReason: z.enum(Object.keys(failedDeliveryReasons) as [keyof typeof failedDeliveryReasons, ...(keyof typeof failedDeliveryReasons)[]]).optional(), note: z.string().trim().max(2000).default(""), proofReference: z.string().trim().max(255).default("") }).superRefine((value, context) => { if (value.result === "DELIVERED" && !value.receivedBy) context.addIssue({ code: "custom", path: ["receivedBy"], message: "กรุณาระบุผู้รับสินค้า" }); if (value.result === "FAILED" && !value.failureReason) context.addIssue({ code: "custom", path: ["failureReason"], message: "กรุณาระบุเหตุผลที่จัดส่งไม่สำเร็จ" }); });

export const vehicleFormSchema = z.object({ id: z.uuid().optional(), code: z.string().trim().min(1, "กรุณาระบุรหัสรถ").max(28).regex(/^[A-Za-z0-9_-]+$/, "รหัสรถใช้ได้เฉพาะ A-Z, 0-9, - และ _"), registrationNumber: z.string().trim().min(1, "กรุณาระบุทะเบียนรถ").max(32), description: z.string().trim().max(255) });
export const vehicleStatusSchema = z.object({ id: z.uuid(), status: z.enum(["ACTIVE", "INACTIVE"]) });

export type DeliveryTripFormValues = z.infer<typeof deliveryTripFormSchema>;
export type DeliveryTripListQuery = z.infer<typeof deliveryTripListQuerySchema>;
export type DeliveryResultValues = z.infer<typeof deliveryResultSchema>;
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
