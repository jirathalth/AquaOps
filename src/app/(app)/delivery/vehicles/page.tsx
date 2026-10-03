import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { VehicleManagement } from "@/features/delivery/components/vehicle-management";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireRouteAccess } from "@/services/auth.service";
import { getVehicles } from "@/services/delivery.service";

export const metadata = { title: "รถจัดส่ง" };
export default async function DeliveryVehiclesPage() { const [access, vehicles] = await Promise.all([requireRouteAccess("/delivery/vehicles"), getVehicles()]); const canManage = access.permissions.includes("delivery.manage"); return <div className="page-stack"><PageHeader title="รถจัดส่ง" description="จัดการรถและคลังรถสำหรับติดตามสินค้าระหว่างทาง" breadcrumbs={[{ label: "การจัดส่ง", href: "/delivery" }, { label: "รถจัดส่ง" }]} primaryAction={canManage ? <Button asChild><Link href="/delivery/vehicles?create=1"><Plus className="size-4" aria-hidden="true" />เพิ่มรถจัดส่ง</Link></Button> : undefined} /><VehicleManagement vehicles={vehicles} canManage={canManage} /></div>; }
