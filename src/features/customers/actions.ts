"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/auth.service";
import { changeCustomerStatus, createCustomer, CustomerRuleError, updateCustomer } from "@/services/customer.service";
import { customerFormSchema, customerStatusSchema } from "@/validations/customer";

export type CustomerActionResult = { ok: true; id: string } | { ok: false; message: string };
function actionError(error: unknown): CustomerActionResult { if (error instanceof CustomerRuleError) return { ok: false, message: error.message }; console.error("Customer action failed", error); return { ok: false, message: "ไม่สามารถบันทึกข้อมูลลูกค้าได้ กรุณาลองอีกครั้ง" }; }
function revalidateCustomer(id?: string) { revalidatePath("/customers"); if (id) revalidatePath(`/customers/${id}`); }
function auditActor(context: Awaited<ReturnType<typeof requirePermission>>) { return { id: context.user.id === "development-preview" ? null : context.user.id, name: context.user.name }; }

export async function createCustomerAction(input: unknown): Promise<CustomerActionResult> {
  const parsed = customerFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const actor = await requirePermission("customer.create");
  if (parsed.data.status === "INACTIVE") await requirePermission("customer.archive");
  try { const id = await createCustomer(parsed.data, auditActor(actor)); revalidateCustomer(id); return { ok: true, id }; } catch (error) { return actionError(error); }
}

export async function updateCustomerAction(input: unknown): Promise<CustomerActionResult> {
  const parsed = customerFormSchema.safeParse(input);
  if (!parsed.success || !parsed.data.id) return { ok: false, message: parsed.success ? "ไม่พบรหัสลูกค้า" : parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const actor = await requirePermission("customer.update");
  try { const id = await updateCustomer({ ...parsed.data, id: parsed.data.id }, auditActor(actor)); revalidateCustomer(id); return { ok: true, id }; } catch (error) { return actionError(error); }
}

export async function changeCustomerStatusAction(input: unknown): Promise<CustomerActionResult> {
  const parsed = customerStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const actor = await requirePermission("customer.archive");
  try { const id = await changeCustomerStatus(parsed.data.id, parsed.data.status, auditActor(actor)); revalidateCustomer(id); return { ok: true, id }; } catch (error) { return actionError(error); }
}
