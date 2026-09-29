"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/auth.service";
import { AdministrationRuleError, createManagedUser, isUserStatusChange, updateManagedUser } from "@/services/user-administration.service";
import { createCustomRole, updateCustomRole } from "@/services/role-administration.service";
import { roleCreateSchema, roleUpdateSchema, userCreateSchema, userUpdateSchema } from "@/validations/admin";

export type AdminActionResult = { ok: true } | { ok: false; message: string };
function actionError(error: unknown): AdminActionResult { if (error instanceof AdministrationRuleError) return { ok: false, message: error.message }; console.error("Administration action failed", error); return { ok: false, message: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง" }; }

export async function createUserAction(input: unknown): Promise<AdminActionResult> { const parsed = userCreateSchema.safeParse(input); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }; const actor = await requirePermission("user.create"); if (parsed.data.roleIds.length) await requirePermission("role.manage"); if (parsed.data.status === "INACTIVE") await requirePermission("user.disable"); try { await createManagedUser(parsed.data, actor.user.id); revalidatePath("/admin/users"); return { ok: true }; } catch (error) { return actionError(error); } }
export async function updateUserAction(input: unknown): Promise<AdminActionResult> { const parsed = userUpdateSchema.safeParse(input); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }; const actor = await requirePermission("user.update"); await requirePermission("role.manage"); if (await isUserStatusChange(parsed.data.id, parsed.data.status)) await requirePermission("user.disable"); try { await updateManagedUser(parsed.data, actor.user.id); revalidatePath("/admin/users"); return { ok: true }; } catch (error) { return actionError(error); } }
export async function createRoleAction(input: unknown): Promise<AdminActionResult> { const parsed = roleCreateSchema.safeParse(input); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }; const actor = await requirePermission("role.manage"); try { await createCustomRole(parsed.data, actor.user.id); revalidatePath("/admin/roles"); return { ok: true }; } catch (error) { return actionError(error); } }
export async function updateRoleAction(input: unknown): Promise<AdminActionResult> { const parsed = roleUpdateSchema.safeParse(input); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }; const actor = await requirePermission("role.manage"); try { await updateCustomRole(parsed.data, actor.user.id); revalidatePath("/admin/roles"); return { ok: true }; } catch (error) { return actionError(error); } }
