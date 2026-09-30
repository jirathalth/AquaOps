import { PageHeader } from "@/components/shared/page-header";
import { VehicleManagement } from "@/features/delivery/components/vehicle-management";
import { requireRouteAccess } from "@/services/auth.service";
import { getVehicles } from "@/services/delivery.service";

export const metadata = { title: "รถจัดส่ง" };
export default async function DeliveryVehiclesPage() { const [access, vehicles] = await Promise.all([requireRouteAccess("/delivery/vehicles"), getVehicles()]); return <div className="page-stack"><PageHeader title="รถจัดส่ง" description="จัดการรถและคลังรถสำหรับติดตามสินค้าระหว่างทาง" breadcrumbs={[{ label: "การจัดส่ง", href: "/delivery" }, { label: "รถจัดส่ง" }]} /><VehicleManagement vehicles={vehicles} canManage={access.permissions.includes("delivery.manage")} /></div>; }
