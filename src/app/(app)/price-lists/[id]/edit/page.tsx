import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PriceListForm } from "@/features/pricing/components/price-list-form";
import { requirePermission } from "@/services/auth.service";
import { getPriceList } from "@/services/pricing.service";

export const metadata = { title: "แก้ไขรายการราคา" };
export default async function EditPriceListPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; await requirePermission("price_list.manage"); const priceList = await getPriceList(id); if (!priceList) notFound(); return <div className="page-stack"><PageHeader title="แก้ไขรายการราคา" description={`${priceList.code} · ${priceList.name}`} breadcrumbs={[{ label: "รายการราคา", href: "/price-lists" }, { label: priceList.name, href: `/price-lists/${id}` }]} /><PriceListForm priceList={priceList} /></div>; }
