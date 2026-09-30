import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DeliveryTripForm } from "@/features/delivery/components/delivery-trip-form";
import { requirePermission } from "@/services/auth.service";
import { getDeliveryOptions, getDeliveryTrip } from "@/services/delivery.service";

export const metadata = { title: "แก้ไขรอบจัดส่ง" };
export default async function EditDeliveryTripPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; await requirePermission("delivery.manage"); const [trip, options] = await Promise.all([getDeliveryTrip(id), getDeliveryOptions()]); if (!trip || trip.status !== "PLANNED" || !trip.vehicleId || !trip.driverId) notFound(); return <div className="page-stack"><PageHeader title="แก้ไขรอบจัดส่ง" description={trip.tripNo} breadcrumbs={[{ label: "รอบจัดส่ง", href: "/delivery/trips" }, { label: trip.tripNo, href: `/delivery/trips/${id}` }, { label: "แก้ไข" }]} /><DeliveryTripForm options={options} initial={{ id: trip.id, plannedDate: trip.plannedDate, warehouseId: trip.warehouseId, vehicleId: trip.vehicleId, driverId: trip.driverId, notes: trip.notes, orderIds: [] }} /></div>; }
