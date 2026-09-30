import { PageHeader } from "@/components/shared/page-header";
import { WarehouseTable } from "@/features/inventory/components/warehouse-table";
import { requireRouteAccess } from "@/services/auth.service";
import { getWarehouses } from "@/services/inventory.service";
import { warehouseListQuerySchema } from "@/validations/inventory";

export const metadata = { title: "คลังสินค้า" };
export default async function WarehousesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [access, params] = await Promise.all([requireRouteAccess("/inventory/warehouses"), searchParams]); const parsed = warehouseListQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : warehouseListQuerySchema.parse({}); const result = await getWarehouses(query); return <div className="page-stack"><PageHeader title="คลังสินค้า" description="จัดการคลังสำหรับยอดคงเหลือและการเคลื่อนไหวสต็อก" /><WarehouseTable {...result} query={query} canManage={access.permissions.includes("inventory.manage_warehouse")} /></div>; }
