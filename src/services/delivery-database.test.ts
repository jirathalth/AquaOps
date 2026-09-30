import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { completeDeliveryTrip, createDeliveryTrip, DeliveryRuleError, dispatchDeliveryTrip, loadDeliveryTrip, recordDeliveryResult, returnFailedDelivery } from "@/services/delivery.service";

const actor = { id: null, name: "Delivery integration test" };
async function resources() { const [warehouse, vehicle, driver] = await Promise.all([db.warehouse.findUniqueOrThrow({ where: { code: "MAIN" } }), db.vehicle.findUniqueOrThrow({ where: { code: "TRUCK01" } }), db.user.findUniqueOrThrow({ where: { email: "delivery@aquaops.local" } })]); return { warehouse, vehicle, driver }; }
async function createTrip(orderNo: string) { const [{ warehouse, vehicle, driver }, order] = await Promise.all([resources(), db.salesOrder.findUniqueOrThrow({ where: { orderNo } })]); return createDeliveryTrip({ plannedDate: "2026-09-30", warehouseId: warehouse.id, vehicleId: vehicle.id, driverId: driver.id, notes: "integration", orderIds: [order.id] }, actor); }

describe.skipIf(process.env.AQUAOPS_DELIVERY_DB_TEST !== "true")("delivery database workflow", () => {
  beforeAll(async () => { await db.$connect(); });
  afterAll(async () => { await db.$disconnect(); });

  it("loads, dispatches, delivers, and completes without duplicate inventory postings", async () => {
    const tripId = await createTrip("SO-202609-00002");
    expect((await db.salesOrder.findUniqueOrThrow({ where: { orderNo: "SO-202609-00002" } })).status).toBe("PREPARING");
    await loadDeliveryTrip(tripId, actor); await loadDeliveryTrip(tripId, actor);
    expect(await db.inventoryMovement.count({ where: { idempotencyKey: `delivery-load:${tripId}` } })).toBe(1);
    await dispatchDeliveryTrip(tripId, actor);
    const delivery = await db.delivery.findFirstOrThrow({ where: { deliveryStop: { deliveryTripId: tripId } } });
    await recordDeliveryResult({ deliveryId: delivery.id, result: "DELIVERED", receivedBy: "ผู้รับทดสอบ", note: "ครบถ้วน", proofReference: "POD-TEST" }, actor);
    await recordDeliveryResult({ deliveryId: delivery.id, result: "DELIVERED", receivedBy: "ผู้รับทดสอบ", note: "ครบถ้วน", proofReference: "POD-TEST" }, actor);
    expect(await db.inventoryMovement.count({ where: { idempotencyKey: `delivery-sale:${delivery.id}` } })).toBe(1);
    expect((await db.salesOrder.findUniqueOrThrow({ where: { orderNo: "SO-202609-00002" } })).status).toBe("DELIVERED");
    await completeDeliveryTrip(tripId, actor);
    expect((await db.deliveryTrip.findUniqueOrThrow({ where: { id: tripId } })).status).toBe("COMPLETED");
  });

  it("keeps failed stock on the vehicle until an explicit idempotent return", async () => {
    const tripId = await createTrip("SO-202609-00004"); await loadDeliveryTrip(tripId, actor); await dispatchDeliveryTrip(tripId, actor);
    const delivery = await db.delivery.findFirstOrThrow({ where: { deliveryStop: { deliveryTripId: tripId } } });
    await recordDeliveryResult({ deliveryId: delivery.id, result: "FAILED", receivedBy: "", failureReason: "CUSTOMER_UNAVAILABLE", note: "โทรไม่ติด", proofReference: "" }, actor);
    expect(await db.inventoryMovement.count({ where: { idempotencyKey: `delivery-sale:${delivery.id}` } })).toBe(0);
    await expect(completeDeliveryTrip(tripId, actor)).rejects.toBeInstanceOf(DeliveryRuleError);
    await returnFailedDelivery(delivery.id, actor); await returnFailedDelivery(delivery.id, actor);
    expect(await db.inventoryMovement.count({ where: { idempotencyKey: `delivery-return:${delivery.id}` } })).toBe(1);
    expect((await db.salesOrder.findUniqueOrThrow({ where: { orderNo: "SO-202609-00004" } })).status).toBe("READY");
    await completeDeliveryTrip(tripId, actor);
  });
});
