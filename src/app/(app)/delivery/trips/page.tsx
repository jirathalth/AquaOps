import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DeliveryTripTable } from "@/features/delivery/components/delivery-trip-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireRouteAccess } from "@/services/auth.service";
import { getDeliveryOptions, getDeliveryTrips } from "@/services/delivery.service";
import { deliveryTripListQuerySchema } from "@/validations/delivery";

export const metadata = { title: "รอบจัดส่ง" };
export default async function DeliveryTripsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const [access, params, options] = await Promise.all([requireRouteAccess("/delivery/trips"), searchParams, getDeliveryOptions()]); const parsed = deliveryTripListQuerySchema.safeParse(params); const query = parsed.success ? parsed.data : deliveryTripListQuerySchema.parse({}); const result = await getDeliveryTrips(query); const canManage = access.permissions.includes("delivery.manage"); return <div className="page-stack"><PageHeader title="รอบจัดส่ง" description="วางแผน ขึ้นสินค้า ออกรถ และติดตามผลจัดส่ง" breadcrumbs={[{ label: "การจัดส่ง", href: "/delivery" }, { label: "รอบจัดส่ง" }]} primaryAction={canManage ? <Button asChild><Link href="/delivery/trips/new"><Plus className="size-4" aria-hidden="true" />สร้างรอบจัดส่ง</Link></Button> : undefined} /><DeliveryTripTable {...result} query={query} options={options} /></div>; }
