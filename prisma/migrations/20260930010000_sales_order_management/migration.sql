-- Phase 7 sales order snapshots, workflow history, and concurrency-safe numbering.
CREATE TABLE "document_sequences" (
    "key" VARCHAR(32) NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "sales_orders"
  ADD COLUMN "customerCodeSnapshot" VARCHAR(32),
  ADD COLUMN "customerNameSnapshot" VARCHAR(200),
  ADD COLUMN "creditTermDaysSnapshot" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "creditLimitSnapshot" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN "documentDiscountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0;

UPDATE "sales_orders" sales_order
SET "customerCodeSnapshot" = customer."code",
    "customerNameSnapshot" = customer."displayName"
FROM "customers" customer
WHERE customer."id" = sales_order."customerId";

ALTER TABLE "sales_orders"
  ALTER COLUMN "customerCodeSnapshot" SET NOT NULL,
  ALTER COLUMN "customerNameSnapshot" SET NOT NULL;

ALTER TABLE "sales_order_items"
  ADD COLUMN "productNameSnapshot" VARCHAR(200),
  ADD COLUMN "skuSnapshot" VARCHAR(64),
  ADD COLUMN "unitNameSnapshot" VARCHAR(100),
  ADD COLUMN "resolvedUnitPrice" DECIMAL(14,4),
  ADD COLUMN "priceSource" VARCHAR(32) NOT NULL DEFAULT 'PRODUCT_DEFAULT',
  ADD COLUMN "isPriceOverridden" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "lineSubtotal" DECIMAL(14,2);

UPDATE "sales_order_items" item
SET "productNameSnapshot" = item."description",
    "skuSnapshot" = item."sku",
    "unitNameSnapshot" = unit."nameTh",
    "resolvedUnitPrice" = item."unitPrice",
    "lineSubtotal" = ROUND(item."quantity" * item."unitPrice", 2)
FROM "product_units" product_unit
JOIN "units_of_measure" unit ON unit."id" = product_unit."unitId"
WHERE product_unit."id" = item."productUnitId";

ALTER TABLE "sales_order_items"
  ALTER COLUMN "productNameSnapshot" SET NOT NULL,
  ALTER COLUMN "skuSnapshot" SET NOT NULL,
  ALTER COLUMN "unitNameSnapshot" SET NOT NULL,
  ALTER COLUMN "resolvedUnitPrice" SET NOT NULL,
  ALTER COLUMN "lineSubtotal" SET NOT NULL;

CREATE TABLE "sales_order_status_history" (
    "id" UUID NOT NULL,
    "salesOrderId" UUID NOT NULL,
    "fromStatus" "SalesOrderStatus",
    "toStatus" "SalesOrderStatus" NOT NULL,
    "changedById" TEXT,
    "changedByName" VARCHAR(120),
    "note" VARCHAR(500),
    "changedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_order_status_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sales_order_status_history_salesOrderId_changedAt_idx" ON "sales_order_status_history"("salesOrderId", "changedAt");
CREATE INDEX "sales_order_status_history_changedById_idx" ON "sales_order_status_history"("changedById");

ALTER TABLE "sales_order_status_history" ADD CONSTRAINT "sales_order_status_history_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sales_order_status_history" ADD CONSTRAINT "sales_order_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_credit_snapshot_check" CHECK ("creditTermDaysSnapshot" >= 0 AND "creditLimitSnapshot" >= 0 AND "documentDiscountAmount" >= 0);
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_phase7_values_check" CHECK ("resolvedUnitPrice" >= 0 AND "lineSubtotal" >= 0 AND "priceSource" IN ('CUSTOMER_OVERRIDE', 'PRICE_LIST', 'PRODUCT_DEFAULT'));
