ALTER TABLE "invoices"
  ADD COLUMN "customerCodeSnapshot" VARCHAR(32),
  ADD COLUMN "customerNameSnapshot" VARCHAR(200),
  ADD COLUMN "taxIdSnapshot" VARCHAR(13),
  ADD COLUMN "taxBranchCodeSnapshot" VARCHAR(5),
  ADD COLUMN "creditTermDaysSnapshot" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "voidReason" VARCHAR(500);

UPDATE "invoices" invoice
SET "customerCodeSnapshot" = customer."code",
    "customerNameSnapshot" = customer."displayName",
    "taxIdSnapshot" = customer."taxId",
    "taxBranchCodeSnapshot" = customer."taxBranchCode"
FROM "customers" customer
WHERE customer."id" = invoice."customerId";

ALTER TABLE "invoices"
  ALTER COLUMN "customerCodeSnapshot" SET NOT NULL,
  ALTER COLUMN "customerNameSnapshot" SET NOT NULL;

ALTER TABLE "invoice_items"
  ADD COLUMN "productNameSnapshot" VARCHAR(200),
  ADD COLUMN "skuSnapshot" VARCHAR(64),
  ADD COLUMN "unitNameSnapshot" VARCHAR(100),
  ADD COLUMN "lineSubtotal" DECIMAL(14,2);

UPDATE "invoice_items" invoice_item
SET "productNameSnapshot" = COALESCE(
      (SELECT order_item."productNameSnapshot" FROM "sales_order_items" order_item WHERE order_item."id" = invoice_item."salesOrderItemId"),
      invoice_item."description"
    ),
    "skuSnapshot" = COALESCE(
      (SELECT order_item."skuSnapshot" FROM "sales_order_items" order_item WHERE order_item."id" = invoice_item."salesOrderItemId"),
      (SELECT product."sku" FROM "products" product WHERE product."id" = invoice_item."productId"),
      '-'
    ),
    "unitNameSnapshot" = COALESCE(
      (SELECT order_item."unitNameSnapshot" FROM "sales_order_items" order_item WHERE order_item."id" = invoice_item."salesOrderItemId"),
      (SELECT unit."nameTh" FROM "product_units" product_unit JOIN "units_of_measure" unit ON unit."id" = product_unit."unitId" WHERE product_unit."id" = invoice_item."productUnitId"),
      '-'
    ),
    "lineSubtotal" = ROUND(invoice_item."quantity" * invoice_item."unitPrice", 2);

ALTER TABLE "invoice_items"
  ALTER COLUMN "productNameSnapshot" SET NOT NULL,
  ALTER COLUMN "skuSnapshot" SET NOT NULL,
  ALTER COLUMN "unitNameSnapshot" SET NOT NULL,
  ALTER COLUMN "lineSubtotal" SET NOT NULL;

ALTER TABLE "billing_notes" ADD COLUMN "cancelReason" VARCHAR(500);
ALTER TABLE "payments" ADD COLUMN "voidReason" VARCHAR(500);
ALTER TABLE "payments" ADD COLUMN "idempotencyKey" VARCHAR(64);
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_credit_term_snapshot_check" CHECK ("creditTermDaysSnapshot" >= 0);
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_line_subtotal_check" CHECK ("lineSubtotal" >= 0);

-- Phase 10 creates one full-order invoice. VOID documents do not block a replacement.
CREATE UNIQUE INDEX "invoices_one_active_full_order_key"
ON "invoices" ("salesOrderId")
WHERE "salesOrderId" IS NOT NULL AND "status" <> 'VOID';

CREATE FUNCTION protect_issued_invoice() RETURNS trigger AS $$
BEGIN
  IF OLD."status" <> 'DRAFT' AND (
    NEW."customerId" IS DISTINCT FROM OLD."customerId" OR NEW."salesOrderId" IS DISTINCT FROM OLD."salesOrderId" OR
    NEW."customerCodeSnapshot" IS DISTINCT FROM OLD."customerCodeSnapshot" OR NEW."customerNameSnapshot" IS DISTINCT FROM OLD."customerNameSnapshot" OR
    NEW."taxIdSnapshot" IS DISTINCT FROM OLD."taxIdSnapshot" OR NEW."taxBranchCodeSnapshot" IS DISTINCT FROM OLD."taxBranchCodeSnapshot" OR
    NEW."creditTermDaysSnapshot" IS DISTINCT FROM OLD."creditTermDaysSnapshot" OR NEW."invoiceDate" IS DISTINCT FROM OLD."invoiceDate" OR
    NEW."dueDate" IS DISTINCT FROM OLD."dueDate" OR NEW."currency" IS DISTINCT FROM OLD."currency" OR
    NEW."billingAddress" IS DISTINCT FROM OLD."billingAddress" OR NEW."subtotal" IS DISTINCT FROM OLD."subtotal" OR
    NEW."discountAmount" IS DISTINCT FROM OLD."discountAmount" OR NEW."taxAmount" IS DISTINCT FROM OLD."taxAmount" OR
    NEW."totalAmount" IS DISTINCT FROM OLD."totalAmount"
  ) THEN RAISE EXCEPTION 'Issued invoice financial fields are immutable'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "invoices_protect_issued" BEFORE UPDATE ON "invoices" FOR EACH ROW EXECUTE FUNCTION protect_issued_invoice();

CREATE FUNCTION protect_invoice_item() RETURNS trigger AS $$
DECLARE invoice_status "InvoiceStatus";
BEGIN
  SELECT "status" INTO invoice_status FROM "invoices" WHERE "id" = COALESCE(NEW."invoiceId", OLD."invoiceId");
  IF invoice_status <> 'DRAFT' THEN RAISE EXCEPTION 'Issued invoice items are immutable'; END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "invoice_items_protect_issued" BEFORE INSERT OR UPDATE OR DELETE ON "invoice_items" FOR EACH ROW EXECUTE FUNCTION protect_invoice_item();
CREATE TRIGGER "payment_allocations_immutable" BEFORE UPDATE OR DELETE ON "payment_allocations" FOR EACH ROW EXECUTE FUNCTION reject_immutable_row_change();

-- Qualify the allocation amount in the Phase 1 cross-table guard. Both joined
-- tables own an "amount" column, so the original unqualified aggregate is ambiguous.
CREATE OR REPLACE FUNCTION validate_payment_allocation() RETURNS trigger AS $$
DECLARE
  payment_customer UUID;
  payment_currency CHAR(3);
  payment_total DECIMAL(14,2);
  payment_status "PaymentStatus";
  invoice_customer UUID;
  invoice_currency CHAR(3);
  invoice_total DECIMAL(14,2);
  existing_payment_total DECIMAL(14,2);
  existing_invoice_total DECIMAL(14,2);
  billing_customer UUID;
  billing_currency CHAR(3);
BEGIN
  SELECT "customerId", "currency", "amount", "status" INTO payment_customer, payment_currency, payment_total, payment_status
  FROM "payments" WHERE "id" = NEW."paymentId" FOR UPDATE;
  SELECT "customerId", "currency", "totalAmount" INTO invoice_customer, invoice_currency, invoice_total
  FROM "invoices" WHERE "id" = NEW."invoiceId" FOR UPDATE;

  IF payment_customer <> invoice_customer OR payment_currency <> invoice_currency THEN
    RAISE EXCEPTION 'Payment and invoice customer/currency must match';
  END IF;
  IF payment_status <> 'PENDING' THEN RAISE EXCEPTION 'Allocations can only be added while a payment is pending'; END IF;

  SELECT COALESCE(SUM(allocation."amount"), 0) INTO existing_payment_total
  FROM "payment_allocations" allocation WHERE allocation."paymentId" = NEW."paymentId" AND allocation."id" <> NEW."id";
  SELECT COALESCE(SUM(allocation."amount"), 0) INTO existing_invoice_total
  FROM "payment_allocations" allocation
  JOIN "payments" allocated_payment ON allocated_payment."id" = allocation."paymentId"
  WHERE allocation."invoiceId" = NEW."invoiceId" AND allocated_payment."status" <> 'VOID' AND allocation."id" <> NEW."id";

  IF existing_payment_total + NEW."amount" > payment_total THEN RAISE EXCEPTION 'Payment allocation exceeds payment amount'; END IF;
  IF existing_invoice_total + NEW."amount" > invoice_total THEN RAISE EXCEPTION 'Payment allocation exceeds invoice amount'; END IF;

  IF NEW."billingNoteId" IS NOT NULL THEN
    SELECT "customerId", "currency" INTO billing_customer, billing_currency FROM "billing_notes" WHERE "id" = NEW."billingNoteId";
    IF billing_customer <> payment_customer OR billing_currency <> payment_currency OR NOT EXISTS (
      SELECT 1 FROM "billing_note_invoices" WHERE "billingNoteId" = NEW."billingNoteId" AND "invoiceId" = NEW."invoiceId"
    ) THEN RAISE EXCEPTION 'Billing note must contain the allocated invoice for the same customer/currency'; END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION protect_issued_billing_note() RETURNS trigger AS $$
BEGIN
  IF OLD."status" <> 'DRAFT' AND (
    NEW."customerId" IS DISTINCT FROM OLD."customerId" OR NEW."billingDate" IS DISTINCT FROM OLD."billingDate" OR
    NEW."dueDate" IS DISTINCT FROM OLD."dueDate" OR NEW."currency" IS DISTINCT FROM OLD."currency" OR
    NEW."totalAmount" IS DISTINCT FROM OLD."totalAmount"
  ) THEN RAISE EXCEPTION 'Issued billing note financial fields are immutable'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "billing_notes_protect_issued" BEFORE UPDATE ON "billing_notes" FOR EACH ROW EXECUTE FUNCTION protect_issued_billing_note();

CREATE FUNCTION protect_billing_note_invoice() RETURNS trigger AS $$
DECLARE billing_status "BillingNoteStatus";
BEGIN
  SELECT "status" INTO billing_status FROM "billing_notes" WHERE "id" = COALESCE(NEW."billingNoteId", OLD."billingNoteId");
  IF billing_status <> 'DRAFT' THEN RAISE EXCEPTION 'Issued billing note invoices are immutable'; END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "billing_note_invoices_protect_issued" BEFORE INSERT OR UPDATE OR DELETE ON "billing_note_invoices" FOR EACH ROW EXECUTE FUNCTION protect_billing_note_invoice();

CREATE FUNCTION protect_posted_payment() RETURNS trigger AS $$
BEGIN
  IF OLD."status" <> 'PENDING' AND (
    NEW."customerId" IS DISTINCT FROM OLD."customerId" OR NEW."method" IS DISTINCT FROM OLD."method" OR
    NEW."paymentDate" IS DISTINCT FROM OLD."paymentDate" OR NEW."amount" IS DISTINCT FROM OLD."amount" OR
    NEW."currency" IS DISTINCT FROM OLD."currency" OR NEW."externalReference" IS DISTINCT FROM OLD."externalReference" OR
    NEW."receivedAccount" IS DISTINCT FROM OLD."receivedAccount" OR NEW."idempotencyKey" IS DISTINCT FROM OLD."idempotencyKey"
  ) THEN RAISE EXCEPTION 'Posted payment financial fields are immutable'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "payments_protect_posted" BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE FUNCTION protect_posted_payment();
