ALTER TABLE "product_units"
ADD COLUMN "cost" DECIMAL(14,4) NOT NULL DEFAULT 0,
ADD COLUMN "retailPrice" DECIMAL(14,4) NOT NULL DEFAULT 0,
ADD COLUMN "wholesalePrice" DECIMAL(14,4) NOT NULL DEFAULT 0;

ALTER TABLE "product_units"
ADD CONSTRAINT "product_units_prices_check"
CHECK ("cost" >= 0 AND "retailPrice" >= 0 AND "wholesalePrice" >= 0);
