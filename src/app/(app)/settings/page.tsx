import { PageHeader } from "@/components/shared/page-header";
import { SettingsPage } from "@/features/settings/components/settings-page";
import type { SettingsPageData, SettingsSection } from "@/features/settings/types";
import { requirePermission } from "@/services/auth.service";
import { getSettingsPageData } from "@/services/settings.service";

export const metadata = { title: "ตั้งค่าระบบและกิจการ" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const access = await requirePermission("settings.view"); const query = await searchParams; const requested = typeof query.section === "string" ? query.section : "general"; const supported = new Set<SettingsSection>(["general", "sales", "documents", "inventory-delivery", "finance", "localization", "system"]); const section = supported.has(requested as SettingsSection) ? requested as SettingsSection : "general"; const data = await getSettingsPageData() as SettingsPageData; return <div className="page-stack"><PageHeader title="ตั้งค่าระบบและกิจการ" description="จัดการข้อมูลกิจการและค่าเริ่มต้นสำหรับรายการใหม่ การเปลี่ยนแปลงไม่แก้ไขเอกสารหรือประวัติย้อนหลัง" breadcrumbs={[{ label: "ผู้ดูแลระบบ" }]} /><SettingsPage data={data} section={section} canManage={access.permissions.includes("settings.manage")} /></div>; }
