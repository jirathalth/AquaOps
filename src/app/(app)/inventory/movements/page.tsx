import { PageHeader } from "@/components/shared/page-header";
import { MovementTable } from "@/features/inventory/components/movement-table";
import { requireRouteAccess } from "@/services/auth.service";
import { getMovements, getStockOptions } from "@/services/inventory.service";
import { movementListQuerySchema } from "@/validations/inventory";

export const metadata = { title: "การเคลื่อนไหวสต็อก" };
export default async function MovementsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [params] = await Promise.all([searchParams, requireRouteAccess("/inventory/movements")]); const parsed = movementListQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : movementListQuerySchema.parse({}); const [result, options] = await Promise.all([getMovements(query), getStockOptions()]); return <div className="page-stack"><PageHeader title="การเคลื่อนไหวสต็อก" description="ประวัติรายการรับเข้า เบิกออก ปรับปรุง และโอนย้ายที่แก้ไขย้อนหลังไม่ได้" /><MovementTable {...result} query={query} warehouses={options.warehouses} products={options.products} /></div>; }
