import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { requirePermission } from "@/services/auth.service";
import { getCustomer, getCustomerPriceLists } from "@/services/customer.service";

export const metadata = { title: "แก้ไขลูกค้า" };
export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; await requirePermission("customer.update"); const [customer, priceLists] = await Promise.all([getCustomer(id), getCustomerPriceLists()]); if (!customer) notFound(); return <div className="page-stack"><PageHeader title="แก้ไขลูกค้า" description={`${customer.code} · ${customer.displayName}`} breadcrumbs={[{ label: "ลูกค้า", href: "/customers" }, { label: customer.displayName, href: `/customers/${customer.id}` }]} /><CustomerForm customer={customer} priceLists={priceLists} /></div>; }
