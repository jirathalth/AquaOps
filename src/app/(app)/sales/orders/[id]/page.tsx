import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/shared/detail-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { salesOrderStatusConfig } from "@/config/sales-orders";
import { SalesOrderDetail } from "@/features/sales-orders/components/sales-order-detail";
import { SalesOrderStatusActions } from "@/features/sales-orders/components/sales-order-status-actions";
import { requireRouteAccess } from "@/services/auth.service";
import { getSalesOrder } from "@/services/sales-order.service";

export default async function SalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [access, order] = await Promise.all([
    requireRouteAccess(`/sales/orders/${id}`),
    getSalesOrder(id),
  ]);
  if (!order) notFound();
  const canEdit =
    order.status === "DRAFT" &&
    access.permissions.includes("sales_order.update");
  const canConfirm =
    order.status === "DRAFT" &&
    access.permissions.includes("sales_order.confirm");
  const canCancel =
    ["DRAFT", "CONFIRMED"].includes(order.status) &&
    access.permissions.includes("sales_order.cancel");
  return (
    <div className="page-stack">
      <DetailHeader
        title={order.customerNameSnapshot}
        identifier={order.orderNo}
        description={`ยอดสุทธิ ${order.totalAmount} บาท`}
        section={{ label: "คำสั่งซื้อ", href: "/sales/orders" }}
        status={
          <StatusBadge status={salesOrderStatusConfig[order.status].badge} />
        }
        actions={
          <>
            {canEdit && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/sales/orders/${id}/edit`}>
                  <Pencil className="size-4" aria-hidden="true" />
                  แก้ไข
                </Link>
              </Button>
            )}
            <SalesOrderStatusActions
              id={id}
              orderNo={order.orderNo}
              canConfirm={canConfirm}
              canCancel={canCancel}
            />
          </>
        }
      />
      <SalesOrderDetail order={order} />
    </div>
  );
}
