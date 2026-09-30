import { PageHeader } from "@/components/shared/page-header";
import { AdjustmentForm } from "@/features/inventory/components/adjustment-form";
import { requirePermission } from "@/services/auth.service";
import { getInventoryOptions } from "@/services/inventory.service";

export const metadata = { title: "ปรับปรุงสต็อก" };
export default async function NewAdjustmentPage() { await requirePermission("inventory.adjust"); const options = await getInventoryOptions(); return <div className="page-stack"><PageHeader title="ปรับปรุงสต็อก" description="เพิ่มหรือลดยอดคงเหลือด้วยรายการปรับปรุงที่ตรวจสอบย้อนหลังได้" breadcrumbs={[{ label: "สต็อก", href: "/inventory/stock" }]} /><AdjustmentForm {...options} /></div>; }
