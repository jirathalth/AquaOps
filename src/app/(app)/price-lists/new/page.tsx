import { PageHeader } from "@/components/shared/page-header";
import { PriceListForm } from "@/features/pricing/components/price-list-form";
import { requirePermission } from "@/services/auth.service";

export const metadata = { title: "สร้างรายการราคา" };
export default async function NewPriceListPage() { await requirePermission("price_list.manage"); return <div className="page-stack"><PageHeader title="สร้างรายการราคา" description="สร้างกลุ่มราคาสำหรับกำหนดให้ลูกค้า" breadcrumbs={[{ label: "รายการราคา", href: "/price-lists" }]} /><PriceListForm /></div>; }
