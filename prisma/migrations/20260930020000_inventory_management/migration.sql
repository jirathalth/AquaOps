-- Phase 8 keeps movement headers and signed ledger entries immutable.
CREATE TRIGGER "inventory_movements_immutable"
BEFORE UPDATE OR DELETE ON "inventory_movements"
FOR EACH ROW EXECUTE FUNCTION reject_immutable_row_change();

-- Serialize reductions on the balance row and reject insufficient available stock
-- before the ledger insert can commit. The ledger insert and projection update share
-- the caller's database transaction, so either both persist or neither does.
CREATE OR REPLACE FUNCTION apply_inventory_ledger_entry() RETURNS trigger AS $$
BEGIN
  IF NEW."quantity" > 0 THEN
    INSERT INTO "stock_balances" ("id", "warehouseId", "productId", "onHandQuantity", "reservedQuantity", "updatedAt")
    VALUES (gen_random_uuid(), NEW."warehouseId", NEW."productId", NEW."quantity", 0, CURRENT_TIMESTAMP)
    ON CONFLICT ("warehouseId", "productId") DO UPDATE
    SET "onHandQuantity" = "stock_balances"."onHandQuantity" + EXCLUDED."onHandQuantity",
        "updatedAt" = CURRENT_TIMESTAMP;
  ELSE
    UPDATE "stock_balances"
    SET "onHandQuantity" = "onHandQuantity" + NEW."quantity",
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "warehouseId" = NEW."warehouseId"
      AND "productId" = NEW."productId"
      AND "onHandQuantity" + NEW."quantity" >= "reservedQuantity";

    IF NOT FOUND THEN
      RAISE EXCEPTION 'AQUAOPS_INSUFFICIENT_STOCK' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX "inventory_movements_occurredAt_idx" ON "inventory_movements"("occurredAt");
