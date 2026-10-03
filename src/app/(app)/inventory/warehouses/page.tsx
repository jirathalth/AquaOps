import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { WarehouseTable } from "@/features/inventory/components/warehouse-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireRouteAccess } from "@/services/auth.service";
import { getWarehouses } from "@/services/inventory.service";
import { warehouseListQuerySchema } from "@/validations/inventory";

export const metadata = { title: "คลังสินค้า" };
export default async function WarehousesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [access, params] = await Promise.all([requireRouteAccess("/inventory/warehouses"), searchParams]); const parsed = warehouseListQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : warehouseListQuerySchema.parse({}); const result = await getWarehouses(query); const canManage = access.permissions.includes("inventory.manage_warehouse"); return <div className="page-stack"><PageHeader title="คลังสินค้า" description="จัดการคลังสำหรับยอดคงเหลือและการเคลื่อนไหวสต็อก" primaryAction={canManage ? <Button asChild><Link href="/inventory/warehouses?create=1"><Plus className="size-4" aria-hidden="true" />เพิ่มคลังสินค้า</Link></Button> : undefined} /><WarehouseTable {...result} query={query} canManage={canManage} /></div>; }
