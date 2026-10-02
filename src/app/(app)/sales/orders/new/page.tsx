import { PageHeader } from "@/components/shared/page-header";
import { SalesOrderForm } from "@/features/sales-orders/components/sales-order-form";
import { requirePermission } from "@/services/auth.service";
import { getSalesOrderOptions } from "@/services/sales-order.service";

export const metadata = { title: "สร้างคำสั่งซื้อ" };
export default async function NewSalesOrderPage() { const [access, options] = await Promise.all([requirePermission("sales_order.create"), getSalesOrderOptions()]); return <div className="page-stack"><PageHeader title="สร้างคำสั่งซื้อ" description="เลือกลูกค้าและสินค้า ระบบจะคำนวณราคาตามเงื่อนไขปัจจุบัน" breadcrumbs={[{ label: "คำสั่งซื้อ", href: "/sales/orders" }]} /><SalesOrderForm options={options} canOverridePrice={options.defaults.allowManualPriceOverride && access.permissions.includes("sales_order.override_price")} /></div>; }
