import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CustomerTable } from "@/features/customers/components/customer-table";
import { requireRouteAccess } from "@/services/auth.service";
import { getCustomerPriceLists, getCustomers } from "@/services/customer.service";
import { customerListQuerySchema } from "@/validations/customer";

export const metadata = { title: "ลูกค้า" };
export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [access, params] = await Promise.all([requireRouteAccess("/customers"), searchParams]);
  const parsed = customerListQuerySchema.safeParse(params);
  const query = parsed.success ? parsed.data : customerListQuerySchema.parse({});
  const [result, priceLists] = await Promise.all([getCustomers(query), getCustomerPriceLists()]);
  const canCreate = access.permissions.includes("customer.create"); return <div className="page-stack"><PageHeader title="ลูกค้า" description="จัดการลูกค้าปลีก ลูกค้าส่ง ข้อมูลติดต่อ เครดิต และที่อยู่" primaryAction={canCreate ? <Button asChild><Link href="/customers/new"><Plus className="size-4" aria-hidden="true" />เพิ่มลูกค้า</Link></Button> : undefined} /><CustomerTable {...result} query={query} priceLists={priceLists} canCreate={canCreate} /></div>;
}
