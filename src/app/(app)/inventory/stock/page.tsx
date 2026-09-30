import { PageHeader } from "@/components/shared/page-header";
import { StockTable } from "@/features/inventory/components/stock-table";
import { requireRouteAccess } from "@/services/auth.service";
import { getStock, getStockOptions } from "@/services/inventory.service";
import { stockListQuerySchema } from "@/validations/inventory";

export const metadata = { title: "สต็อก" };
export default async function StockPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [access, params] = await Promise.all([requireRouteAccess("/inventory/stock"), searchParams]); const parsed = stockListQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : stockListQuerySchema.parse({}); const [result, options] = await Promise.all([getStock(query), getStockOptions()]); return <div className="page-stack"><PageHeader title="สต็อก" description="ยอดคงเหลือปัจจุบันจากบัญชีการเคลื่อนไหวสต็อก" /><StockTable {...result} query={query} warehouses={options.warehouses} categories={options.categories} canAdjust={access.permissions.includes("inventory.adjust")} canTransfer={access.permissions.includes("inventory.transfer")} /></div>; }
