import { z } from "zod";

export const loginSchema = z.object({ email: z.email("กรุณากรอกอีเมลให้ถูกต้อง"), password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร") });
export type LoginValues = z.infer<typeof loginSchema>;
