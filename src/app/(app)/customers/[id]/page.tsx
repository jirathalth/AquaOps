import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/shared/detail-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { customerTypeConfig } from "@/config/customers";
import { CustomerDetail } from "@/features/customers/components/customer-detail";
import { CustomerStatusAction } from "@/features/customers/components/customer-status-action";
import { requireRouteAccess } from "@/services/auth.service";
import { getCustomer, getCustomerActivity } from "@/services/customer.service";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [access, customer, activity] = await Promise.all([requireRouteAccess(`/customers/${id}`), getCustomer(id), getCustomerActivity(id)]);
  if (!customer) notFound();
  const canEdit = access.permissions.includes("customer.update");
  const canArchive = access.permissions.includes("customer.archive");
  return <div className="page-stack"><DetailHeader title={customer.displayName} identifier={customer.code} description={customerTypeConfig[customer.type].th} section={{ label: "ลูกค้า", href: "/customers" }} status={<StatusBadge status={customer.status === "ACTIVE" ? "active" : "inactive"} />} actions={<>{canEdit && <Button asChild size="sm" variant="outline"><Link href={`/customers/${customer.id}/edit`}><Pencil className="size-4" />แก้ไข</Link></Button>}{canArchive && <CustomerStatusAction id={customer.id} name={customer.displayName} status={customer.status} />}</>} /><CustomerDetail customer={customer} activity={activity} /></div>;
}
