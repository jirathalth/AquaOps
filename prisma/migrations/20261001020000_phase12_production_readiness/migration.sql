ALTER TABLE "sales_orders" ADD COLUMN "customerTypeSnapshot" "CustomerType";

UPDATE "sales_orders" AS sales_order
SET "customerTypeSnapshot" = customer."type"
FROM "customers" AS customer
WHERE customer."id" = sales_order."customerId";

ALTER TABLE "sales_orders" ALTER COLUMN "customerTypeSnapshot" SET NOT NULL;

CREATE INDEX "sales_orders_customerTypeSnapshot_orderDate_idx" ON "sales_orders"("customerTypeSnapshot", "orderDate");
