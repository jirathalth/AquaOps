-- Staged document-level VAT. Legacy line fields are intentionally retained.
ALTER TABLE "customers" ADD COLUMN "defaultVatRate" DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE "sales_orders" ADD COLUMN "taxRate" DECIMAL(5,2);
ALTER TABLE "invoices" ADD COLUMN "taxRate" DECIMAL(5,2);

-- Only snapshot historical documents whose legacy lines have one unambiguous rate.
UPDATE "sales_orders" so
SET "taxRate" = source."taxRate"
FROM (
  SELECT "salesOrderId", MIN("taxRate") AS "taxRate"
  FROM "sales_order_items"
  GROUP BY "salesOrderId"
  HAVING COUNT(DISTINCT "taxRate") = 1
) source
WHERE so.id = source."salesOrderId";

-- Prefer the authoritative order snapshot; otherwise use unambiguous invoice lines.
UPDATE "invoices" i
SET "taxRate" = so."taxRate"
FROM "sales_orders" so
WHERE i."salesOrderId" = so.id AND so."taxRate" IS NOT NULL;

UPDATE "invoices" i
SET "taxRate" = source."taxRate"
FROM (
  SELECT "invoiceId", MIN("taxRate") AS "taxRate"
  FROM "invoice_items"
  GROUP BY "invoiceId"
  HAVING COUNT(DISTINCT "taxRate") = 1
) source
WHERE i.id = source."invoiceId" AND i."taxRate" IS NULL;
