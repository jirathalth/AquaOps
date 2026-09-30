import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SalesOrderForm } from "@/features/sales-orders/components/sales-order-form";
import { requirePermission } from "@/services/auth.service";
import { getSalesOrder, getSalesOrderOptions } from "@/services/sales-order.service";

export const metadata = { title: "แก้ไขคำสั่งซื้อ" };
export default async function EditSalesOrderPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [access, order, options] = await Promise.all([requirePermission("sales_order.update"), getSalesOrder(id), getSalesOrderOptions()]); if (!order) notFound(); if (order.status !== "DRAFT") notFound(); return <div className="page-stack"><PageHeader title="แก้ไขคำสั่งซื้อ" description={order.orderNo} breadcrumbs={[{ label: "คำสั่งซื้อ", href: "/sales/orders" }, { label: order.orderNo, href: `/sales/orders/${id}` }]} /><SalesOrderForm order={order} options={options} canOverridePrice={access.permissions.includes("sales_order.override_price")} /></div>; }
