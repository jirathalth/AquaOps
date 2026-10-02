import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { requirePermission } from "@/services/auth.service";
import { getCustomerPriceLists } from "@/services/customer.service";
import { getSalesSettings } from "@/services/settings.service";

export const metadata = { title: "เพิ่มลูกค้า" };
export default async function NewCustomerPage() { await requirePermission("customer.create"); const [priceLists, settings] = await Promise.all([getCustomerPriceLists(), getSalesSettings()]); return <div className="page-stack"><PageHeader title="เพิ่มลูกค้า" description="บันทึกข้อมูลลูกค้าและเงื่อนไขการขายเริ่มต้น" breadcrumbs={[{ label: "ลูกค้า", href: "/customers" }]} /><CustomerForm priceLists={priceLists} salesDefaults={{ defaultCreditTermDays: settings.defaultCreditTermDays, defaultPriceListId: settings.defaultPriceListId }} /></div>; }
