import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { requirePermission } from "@/services/auth.service";
import { getCustomerPriceLists } from "@/services/customer.service";

export const metadata = { title: "เพิ่มลูกค้า" };
export default async function NewCustomerPage() { await requirePermission("customer.create"); const priceLists = await getCustomerPriceLists(); return <div className="page-stack"><PageHeader title="เพิ่มลูกค้า" description="บันทึกข้อมูลลูกค้าและเงื่อนไขการขายเริ่มต้น" breadcrumbs={[{ label: "ลูกค้า", href: "/customers" }]} /><CustomerForm priceLists={priceLists} /></div>; }
