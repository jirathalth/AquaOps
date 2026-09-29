import { z } from "zod";

export const userCreateSchema = z.object({ name: z.string().trim().min(2, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร").max(120), email: z.email("กรุณากรอกอีเมลให้ถูกต้อง").transform((value) => value.toLowerCase()), password: z.string().min(12, "รหัสผ่านชั่วคราวต้องมีอย่างน้อย 12 ตัวอักษร").max(128), status: z.enum(["ACTIVE", "INACTIVE"]), roleIds: z.array(z.uuid()) });
export const userUpdateSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(2).max(120), status: z.enum(["ACTIVE", "INACTIVE"]), roleIds: z.array(z.uuid()) });
export const roleCreateSchema = z.object({ code: z.string().trim().min(2).max(64).regex(/^[A-Z][A-Z0-9_]*$/, "ใช้ตัวพิมพ์ใหญ่ ตัวเลข และ _ เท่านั้น"), name: z.string().trim().min(2).max(120), description: z.string().trim().max(500).optional(), permissionCodes: z.array(z.string()) });
export const roleUpdateSchema = roleCreateSchema.omit({ code: true }).extend({ id: z.uuid(), isActive: z.boolean() });
export type UserCreateValues = z.infer<typeof userCreateSchema>;
export type UserUpdateValues = z.infer<typeof userUpdateSchema>;
export type RoleCreateValues = z.infer<typeof roleCreateSchema>;
export type RoleUpdateValues = z.infer<typeof roleUpdateSchema>;
