"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/services/auth.service";
import { SettingsRuleError, updateDocumentSettings, updateFinanceSettings, updateGeneralSettings, updateInventoryDeliverySettings, updateLocalizationSettings, updateSalesSettings } from "@/services/settings.service";
import { documentSettingsSchema, financeSettingsSchema, generalSettingsSchema, inventoryDeliverySettingsSchema, localizationSettingsSchema, salesSettingsSchema } from "@/validations/settings";

export type SettingsActionResult = { ok: true; version: number } | { ok: false; message: string };
function actor(context: Awaited<ReturnType<typeof requirePermission>>) { return { id: context.user.id === "development-preview" ? null : context.user.id, name: context.user.name }; }
function errorResult(error: unknown): SettingsActionResult { if (error instanceof SettingsRuleError) return { ok: false, message: error.message }; if (typeof error === "object" && error && "code" in error && (error.code === "P2034" || error.code === "P2002" || error.code === "P2003")) return { ok: false, message: "ข้อมูลมีการเปลี่ยนแปลงหรืออ้างอิงไม่ถูกต้อง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง" }; console.error("Settings action failed", error); return { ok: false, message: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองอีกครั้ง" }; }
function refresh() { revalidatePath("/settings"); revalidatePath("/admin/settings"); revalidatePath("/sales/orders"); revalidatePath("/inventory"); revalidatePath("/delivery"); revalidatePath("/accounting"); }
async function run<T>(input: unknown, schema: { safeParse(value: unknown): { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } } }, update: (value: T, actor: { id: string | null; name: string }) => Promise<number>): Promise<SettingsActionResult> { const parsed = schema.safeParse(input); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }; const access = await requirePermission("settings.manage"); try { const version = await update(parsed.data, actor(access)); refresh(); return { ok: true, version }; } catch (error) { return errorResult(error); } }

export async function saveGeneralSettingsAction(input: unknown) { return run(input, generalSettingsSchema, updateGeneralSettings); }
export async function saveSalesSettingsAction(input: unknown) { return run(input, salesSettingsSchema, updateSalesSettings); }
export async function saveDocumentSettingsAction(input: unknown) { return run(input, documentSettingsSchema, updateDocumentSettings); }
export async function saveInventoryDeliverySettingsAction(input: unknown) { return run(input, inventoryDeliverySettingsSchema, updateInventoryDeliverySettings); }
export async function saveFinanceSettingsAction(input: unknown) { return run(input, financeSettingsSchema, updateFinanceSettings); }
export async function saveLocalizationSettingsAction(input: unknown) { return run(input, localizationSettingsSchema, updateLocalizationSettings); }
