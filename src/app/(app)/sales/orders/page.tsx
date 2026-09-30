import { PageHeader } from "@/components/shared/page-header";
import { SalesOrderTable } from "@/features/sales-orders/components/sales-order-table";
import { requireRouteAccess } from "@/services/auth.service";
import { getSalesOrders } from "@/services/sales-order.service";
import { salesOrderListQuerySchema } from "@/validations/sales-order";

export const metadata = { title: "คำสั่งซื้อ" };
export default async function SalesOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [access, params] = await Promise.all([requireRouteAccess("/sales/orders"), searchParams]); const parsed = salesOrderListQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : salesOrderListQuerySchema.parse({}); const result = await getSalesOrders(query); return <div className="page-stack"><PageHeader title="คำสั่งซื้อ" description="จัดการคำสั่งซื้อ ราคา ยอดเงิน และสถานะงานขาย" /><SalesOrderTable {...result} query={query} canCreate={access.permissions.includes("sales_order.create")} /></div>; }
