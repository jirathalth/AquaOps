import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/shared/detail-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { deliveryTripStatusConfig } from "@/config/delivery";
import { DeliveryTripDetail } from "@/features/delivery/components/delivery-trip-detail";
import { DeliveryTripOrders, DeliveryTripPrimaryActions } from "@/features/delivery/components/delivery-trip-operations";
import { requireRouteAccess } from "@/services/auth.service";
import { getDeliveryOptions, getDeliveryTrip } from "@/services/delivery.service";

export default async function DeliveryTripPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [access, trip, options] = await Promise.all([requireRouteAccess(`/delivery/trips/${id}`), getDeliveryTrip(id), getDeliveryOptions()]); if (!trip) notFound(); const canManage = access.permissions.includes("delivery.manage"); return <div className="page-stack"><DetailHeader title={`รอบจัดส่ง ${trip.plannedDate}`} identifier={trip.tripNo} description={`${trip.vehiclePlate} · ${trip.driverName}`} section={{ label: "รอบจัดส่ง", href: "/delivery/trips" }} status={<StatusBadge status={deliveryTripStatusConfig[trip.status].badge} />} actions={<>{canManage && trip.status === "PLANNED" && <Button size="sm" variant="outline" asChild><Link href={`/delivery/trips/${trip.id}/edit`}><Pencil className="size-4" aria-hidden="true" />แก้ไข</Link></Button>}<DeliveryTripPrimaryActions trip={trip} canManage={canManage} /></>} /><DeliveryTripOrders trip={trip} options={options} canManage={canManage} /><DeliveryTripDetail trip={trip} /></div>; }
