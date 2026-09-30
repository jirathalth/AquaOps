import { PageHeader } from "@/components/shared/page-header";
import { PriceListTable } from "@/features/pricing/components/price-list-table";
import { requireRouteAccess } from "@/services/auth.service";
import { getPriceLists } from "@/services/pricing.service";
import { priceListQuerySchema } from "@/validations/pricing";

export const metadata = { title: "รายการราคา" };
export default async function PriceListsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [access, params] = await Promise.all([requireRouteAccess("/price-lists"), searchParams]); const parsed = priceListQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : priceListQuerySchema.parse({}); const result = await getPriceLists(query); return <div className="page-stack"><PageHeader title="รายการราคา" description="กำหนดราคาสินค้าตามกลุ่มลูกค้าและช่วงเวลาที่ใช้งาน" /><PriceListTable {...result} query={query} canManage={access.permissions.includes("price_list.manage")} /></div>; }
