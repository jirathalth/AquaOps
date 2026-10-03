import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { addMoney, calculateOutstanding } from "@/services/accounting-core";
import { checkFinancialIntegrity, createBillingNote, createInvoice, getAccountsReceivable, issueBillingNote, issueInvoice, recordPayment } from "@/services/accounting.service";
import { completeDeliveryTrip, createDeliveryTrip, dispatchDeliveryTrip, loadDeliveryTrip, recordDeliveryResult } from "@/services/delivery.service";
import { checkInventoryIntegrity } from "@/services/inventory.service";
import { addInventoryQuantities } from "@/services/inventory-core";
import { resolveProductPrice } from "@/services/pricing.service";
import { getDashboard, getDeliveryReport, getInvoiceReport, getPaymentReport, getSalesReport } from "@/services/reporting.service";
import { createSalesOrder, transitionSalesOrderStatus } from "@/services/sales-order.service";
import { reportQuerySchema } from "@/validations/reporting";

const actor = { id: null, name: "Phase 12 integration test" };

describe.skipIf(process.env.AQUAOPS_PHASE12_DB_TEST !== "true")("Phase 12 golden path", () => {
  beforeAll(async () => { await db.$connect(); });
  afterAll(async () => { await db.$disconnect(); });

  it("reconciles pricing through order, delivery, inventory, billing, payments, AR, dashboard, and reports", async () => {
    const customer = await db.customer.findUniqueOrThrow({ where: { code: "CUS-000002" }, include: { addresses: true } });
    const warehouse = await db.warehouse.findUniqueOrThrow({ where: { code: "MAIN" } });
    const vehicle = await db.vehicle.findUniqueOrThrow({ where: { code: "TRUCK01" } });
    const driver = await db.user.findUniqueOrThrow({ where: { email: "delivery@aquaops.local" } });
    const productUnits = await db.productUnit.findMany({ where: { product: { sku: { in: ["WATER-600-PACK", "WATER-1500-PACK"] } } }, include: { product: true, unit: true } });
    const bySku = new Map(productUnits.map((unit) => [unit.product.sku, unit]));
    const overrideUnit = bySku.get("WATER-600-PACK")!;
    const listUnit = bySku.get("WATER-1500-PACK")!;
    const overridePrice = await resolveProductPrice({ customerId: customer.id, productId: overrideUnit.productId, unitId: overrideUnit.unitId, quantity: "4.000" });
    const listPrice = await resolveProductPrice({ customerId: customer.id, productId: listUnit.productId, unitId: listUnit.unitId, quantity: "3.000" });
    expect(overridePrice).toMatchObject({ source: "CUSTOMER_OVERRIDE", unitPrice: "42.5000" });
    expect(listPrice).toMatchObject({ source: "PRICE_LIST", unitPrice: "46.8000" });

    const orderId = await createSalesOrder({ customerId: customer.id, warehouseId: warehouse.id, orderDate: "2026-10-01", requestedDeliveryDate: "2026-10-01", saleType: "CREDIT", documentDiscountAmount: "10.00", taxRate: "7.00", notes: "Phase 12 golden path", items: [
      { productUnitId: overrideUnit.id, quantity: "4.000", unitPrice: overridePrice.unitPrice, resolvedUnitPrice: overridePrice.unitPrice, priceSource: overridePrice.source, discountAmount: "5.00", taxRate: "7.00" },
      { productUnitId: listUnit.id, quantity: "3.000", unitPrice: listPrice.unitPrice, resolvedUnitPrice: listPrice.unitPrice, priceSource: listPrice.source, discountAmount: "0.00", taxRate: "7.00" },
    ] }, actor, false);
    const createdOrder = await db.salesOrder.findUniqueOrThrow({ where: { id: orderId }, include: { items: { orderBy: { lineNo: "asc" } } } });
    const originalCustomerName = createdOrder.customerNameSnapshot;
    const originalBillingAddress = createdOrder.billingAddress;
    const originalOverrideProductName = createdOrder.items[0]!.productNameSnapshot;
    const override = await db.customerProductPrice.findFirstOrThrow({ where: { customerId: customer.id, productUnitId: overrideUnit.id, validTo: null } });
    await db.customerProductPrice.update({ where: { id: override.id }, data: { unitPrice: "40.0000" } });
    await db.product.update({ where: { id: overrideUnit.productId }, data: { name: "ชื่อสินค้าใหม่หลังสร้างคำสั่งซื้อ" } });
    await db.customer.update({ where: { id: customer.id }, data: { displayName: "ชื่อลูกค้าใหม่หลังสร้างคำสั่งซื้อ", type: "RETAIL" } });
    const billingAddress = customer.addresses.find((address) => address.type === "BILLING" && address.isDefault)!;
    await db.customerAddress.update({ where: { id: billingAddress.id }, data: { addressLine1: "ที่อยู่ใหม่หลังสร้างคำสั่งซื้อ" } });
    const snapshottedOrder = await db.salesOrder.findUniqueOrThrow({ where: { id: orderId }, include: { items: { orderBy: { lineNo: "asc" } } } });
    expect(snapshottedOrder.customerNameSnapshot).toBe(originalCustomerName);
    expect(snapshottedOrder.customerTypeSnapshot).toBe("WHOLESALE");
    expect(snapshottedOrder.billingAddress).toEqual(originalBillingAddress);
    expect(snapshottedOrder.items[0]).toMatchObject({ productNameSnapshot: originalOverrideProductName, priceSource: "CUSTOMER_OVERRIDE" });
    expect(snapshottedOrder.items[0]!.resolvedUnitPrice.toFixed(4)).toBe(overridePrice.unitPrice);
    expect(snapshottedOrder.items[0]!.unitPrice.toFixed(4)).toBe(overridePrice.unitPrice);
    expect(snapshottedOrder.items[1]).toMatchObject({ priceSource: "PRICE_LIST" });
    expect(snapshottedOrder.items[1]!.resolvedUnitPrice.toFixed(4)).toBe(listPrice.unitPrice);
    expect(snapshottedOrder.items[1]!.unitPrice.toFixed(4)).toBe(listPrice.unitPrice);
    await transitionSalesOrderStatus(orderId, "CONFIRMED", "Phase 12 confirmation", actor);

    const trackedProducts = [overrideUnit.productId, listUnit.productId];
    const beforeLoad = await db.stockBalance.findMany({ where: { warehouseId: warehouse.id, productId: { in: trackedProducts } } });
    const beforeByProduct = new Map(beforeLoad.map((balance) => [balance.productId, balance.onHandQuantity.toFixed(3)]));
    const tripId = await createDeliveryTrip({ plannedDate: "2026-10-01", warehouseId: warehouse.id, vehicleId: vehicle.id, driverId: driver.id, notes: "Phase 12 golden path", orderIds: [orderId] }, actor);
    await loadDeliveryTrip(tripId, actor);
    await loadDeliveryTrip(tripId, actor);
    const afterLoad = await db.stockBalance.findMany({ where: { warehouseId: warehouse.id, productId: { in: trackedProducts } } });
    expect(afterLoad.find((balance) => balance.productId === overrideUnit.productId)?.onHandQuantity.toFixed(3)).toBe(addInventoryQuantities(beforeByProduct.get(overrideUnit.productId)!, "-4.000"));
    expect(afterLoad.find((balance) => balance.productId === listUnit.productId)?.onHandQuantity.toFixed(3)).toBe(addInventoryQuantities(beforeByProduct.get(listUnit.productId)!, "-3.000"));
    await dispatchDeliveryTrip(tripId, actor);
    const delivery = await db.delivery.findFirstOrThrow({ where: { deliveryStop: { deliveryTripId: tripId } } });
    await recordDeliveryResult({ deliveryId: delivery.id, result: "DELIVERED", receivedBy: "ผู้รับ Phase 12", note: "ครบถ้วน", proofReference: "P12-POD" }, actor);
    await recordDeliveryResult({ deliveryId: delivery.id, result: "DELIVERED", receivedBy: "ผู้รับ Phase 12", note: "ครบถ้วน", proofReference: "P12-POD" }, actor);
    await completeDeliveryTrip(tripId, actor);
    expect(await db.inventoryMovement.count({ where: { idempotencyKey: `delivery-load:${tripId}` } })).toBe(1);
    expect(await db.inventoryMovement.count({ where: { idempotencyKey: `delivery-sale:${delivery.id}` } })).toBe(1);
    const afterDelivery = await db.stockBalance.findMany({ where: { warehouseId: warehouse.id, productId: { in: trackedProducts } } });
    expect(afterDelivery.map((balance) => [balance.productId, balance.onHandQuantity.toFixed(3)]).sort()).toEqual(afterLoad.map((balance) => [balance.productId, balance.onHandQuantity.toFixed(3)]).sort());
    expect(await checkInventoryIntegrity()).toEqual([]);

    const invoiceId = await createInvoice({ salesOrderId: orderId, invoiceDate: "2026-10-01", notes: "Phase 12 invoice" }, actor);
    await expect(createInvoice({ salesOrderId: orderId, invoiceDate: "2026-10-01", notes: "duplicate" }, actor)).rejects.toThrow();
    await issueInvoice(invoiceId, actor);
    await issueInvoice(invoiceId, actor);
    const invoice = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { items: { orderBy: { lineNo: "asc" } } } });
    expect(invoice).toMatchObject({ status: "ISSUED", customerNameSnapshot: originalCustomerName, billingAddress: originalBillingAddress });
    expect(invoice.items[0]!.productNameSnapshot).toBe(originalOverrideProductName);
    expect(invoice.totalAmount.toFixed(2)).toBe(createdOrder.totalAmount.toFixed(2));

    const billingId = await createBillingNote({ customerId: customer.id, billingDate: "2026-10-01", dueDate: "2026-10-15", invoiceIds: [invoiceId], notes: "Phase 12 billing" }, actor);
    await issueBillingNote(billingId, actor);
    await issueBillingNote(billingId, actor);
    const partialAmount = "100.00";
    const firstPaymentId = await recordPayment({ idempotencyKey: "00000000-0000-4000-8000-000000000012", customerId: customer.id, paymentDate: "2026-10-01", amount: partialAmount, method: "BANK_TRANSFER", externalReference: "PHASE12-PARTIAL", receivedAccount: "TEST", notes: "partial", billingNoteId: billingId, allocations: [{ invoiceId, amount: partialAmount }] }, actor);
    expect(await recordPayment({ idempotencyKey: "00000000-0000-4000-8000-000000000012", customerId: customer.id, paymentDate: "2026-10-01", amount: partialAmount, method: "BANK_TRANSFER", externalReference: "PHASE12-PARTIAL", receivedAccount: "TEST", notes: "partial", billingNoteId: billingId, allocations: [{ invoiceId, amount: partialAmount }] }, actor)).toBe(firstPaymentId);
    const remainder = calculateOutstanding(invoice.totalAmount.toFixed(2), [partialAmount]);
    const partialAr = await getAccountsReceivable("2026-10-01");
    expect(partialAr.invoices.find((item) => item.id === invoiceId)?.outstandingAmount).toBe(remainder);
    expect((await db.invoice.findUniqueOrThrow({ where: { id: invoiceId } })).status).toBe("PARTIALLY_PAID");
    await recordPayment({ idempotencyKey: "00000000-0000-4000-8000-000000000013", customerId: customer.id, paymentDate: "2026-10-01", amount: remainder, method: "BANK_TRANSFER", externalReference: "PHASE12-FINAL", receivedAccount: "TEST", notes: "final", billingNoteId: billingId, allocations: [{ invoiceId, amount: remainder }] }, actor);
    expect((await db.invoice.findUniqueOrThrow({ where: { id: invoiceId } })).status).toBe("PAID");
    expect((await db.billingNote.findUniqueOrThrow({ where: { id: billingId } })).status).toBe("PAID");
    expect((await getAccountsReceivable("2026-10-01")).invoices.find((item) => item.id === invoiceId)).toBeUndefined();
    expect((await checkFinancialIntegrity()).invalidPayments).toEqual([]);

    const query = reportQuerySchema.parse({ period: "custom", dateFrom: "2026-10-01", dateTo: "2026-10-01", pageSize: 100 });
    const [sales, deliveryReport, invoiceReport, paymentReport, dashboard] = await Promise.all([getSalesReport(query), getDeliveryReport(query), getInvoiceReport(query), getPaymentReport(query), getDashboard(query, ["sales_order.view", "delivery.view", "inventory.view", "ar.view"])]);
    expect(sales.rows.find((row) => row.id === orderId)).toMatchObject({ customerType: "ค้าส่ง" });
    expect(deliveryReport.rows.some((row) => row.id === delivery.id)).toBe(true);
    expect(invoiceReport.rows.find((row) => row.id === invoiceId)).toMatchObject({ outstanding: "0.00" });
    expect(paymentReport.rows.filter((row) => row.id === firstPaymentId)).toHaveLength(1);
    expect(dashboard.sales?.orderCount).toBe(sales.total);
    expect(dashboard.sales?.value).toBe(sales.summary.find((item) => item.label === "ยอดขายตามคำสั่งซื้อ")?.value);
    expect(addMoney(Object.values(dashboard.sales?.byPayment ?? {}))).toBe(dashboard.sales?.value);
    expect(dashboard.sales?.retailWholesale.WHOLESALE).toBe(createdOrder.totalAmount.toFixed(2));
  });
});
