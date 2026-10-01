CREATE INDEX "delivery_stops_status_completedAt_idx" ON "delivery_stops"("status", "completedAt");
CREATE INDEX "deliveries_status_deliveredAt_idx" ON "deliveries"("status", "deliveredAt");
CREATE INDEX "invoices_status_invoiceDate_idx" ON "invoices"("status", "invoiceDate");
CREATE INDEX "payments_status_paymentDate_idx" ON "payments"("status", "paymentDate");
