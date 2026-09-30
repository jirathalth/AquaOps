import { PageHeader } from "@/components/shared/page-header";
import { DeliveryTripForm } from "@/features/delivery/components/delivery-trip-form";
import { requirePermission } from "@/services/auth.service";
import { getDeliveryOptions } from "@/services/delivery.service";

export const metadata = { title: "สร้างรอบจัดส่ง" };
export default async function NewDeliveryTripPage() { await requirePermission("delivery.manage"); const options = await getDeliveryOptions(); return <div className="page-stack"><PageHeader title="สร้างรอบจัดส่ง" description="กำหนดรถ พนักงานขับรถ และคำสั่งซื้อสำหรับรอบใหม่" breadcrumbs={[{ label: "การจัดส่ง", href: "/delivery" }, { label: "รอบจัดส่ง", href: "/delivery/trips" }, { label: "สร้างรอบ" }]} /><DeliveryTripForm options={options} /></div>; }
