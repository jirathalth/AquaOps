CREATE TABLE "business_settings" (
    "id" VARCHAR(32) NOT NULL DEFAULT 'default',
    "businessName" VARCHAR(200) NOT NULL DEFAULT 'AquaOps',
    "legalName" VARCHAR(200),
    "taxId" VARCHAR(13),
    "branch" VARCHAR(100),
    "addressLine" VARCHAR(255),
    "subdistrict" VARCHAR(100),
    "district" VARCHAR(100),
    "province" VARCHAR(100),
    "postalCode" VARCHAR(10),
    "phone" VARCHAR(32),
    "email" VARCHAR(254),
    "website" VARCHAR(255),
    "logoUrl" VARCHAR(500),
    "defaultPriceListId" UUID,
    "defaultCreditTermDays" INTEGER NOT NULL DEFAULT 0,
    "defaultVatRate" DECIMAL(5,2) NOT NULL DEFAULT 7,
    "allowManualPriceOverride" BOOLEAN NOT NULL DEFAULT true,
    "salesOrderPrefix" VARCHAR(8) NOT NULL DEFAULT 'SO',
    "deliveryTripPrefix" VARCHAR(8) NOT NULL DEFAULT 'DL',
    "inventoryMovementPrefix" VARCHAR(8) NOT NULL DEFAULT 'STK',
    "invoicePrefix" VARCHAR(8) NOT NULL DEFAULT 'INV',
    "billingNotePrefix" VARCHAR(8) NOT NULL DEFAULT 'BL',
    "paymentPrefix" VARCHAR(8) NOT NULL DEFAULT 'PAY',
    "showTaxIdOnDocuments" BOOLEAN NOT NULL DEFAULT true,
    "showAddressOnDocuments" BOOLEAN NOT NULL DEFAULT true,
    "documentFooter" VARCHAR(500),
    "paymentInstructions" VARCHAR(1000),
    "defaultWarehouseId" UUID,
    "defaultDeliverySourceWarehouseId" UUID,
    "defaultPaymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "billingInstructions" VARCHAR(500),
    "locale" VARCHAR(10) NOT NULL DEFAULT 'th-TH',
    "currency" CHAR(3) NOT NULL DEFAULT 'THB',
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Asia/Bangkok',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "business_settings_singleton_check" CHECK ("id" = 'default'),
    CONSTRAINT "business_settings_credit_term_check" CHECK ("defaultCreditTermDays" >= 0 AND "defaultCreditTermDays" <= 3650),
    CONSTRAINT "business_settings_vat_rate_check" CHECK ("defaultVatRate" >= 0 AND "defaultVatRate" <= 100),
    CONSTRAINT "business_settings_locale_check" CHECK ("locale" = 'th-TH'),
    CONSTRAINT "business_settings_currency_check" CHECK ("currency" = 'THB'),
    CONSTRAINT "business_settings_timezone_check" CHECK ("timezone" = 'Asia/Bangkok'),
    CONSTRAINT "business_settings_prefix_format_check" CHECK (
      "salesOrderPrefix" ~ '^[A-Z0-9]{2,8}$' AND "deliveryTripPrefix" ~ '^[A-Z0-9]{2,8}$' AND
      "inventoryMovementPrefix" ~ '^[A-Z0-9]{2,8}$' AND "invoicePrefix" ~ '^[A-Z0-9]{2,8}$' AND
      "billingNotePrefix" ~ '^[A-Z0-9]{2,8}$' AND "paymentPrefix" ~ '^[A-Z0-9]{2,8}$'
    )
);

CREATE INDEX "business_settings_defaultPriceListId_idx" ON "business_settings"("defaultPriceListId");
CREATE INDEX "business_settings_defaultWarehouseId_idx" ON "business_settings"("defaultWarehouseId");
CREATE INDEX "business_settings_defaultDeliverySourceWarehouseId_idx" ON "business_settings"("defaultDeliverySourceWarehouseId");

ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_defaultPriceListId_fkey" FOREIGN KEY ("defaultPriceListId") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_defaultWarehouseId_fkey" FOREIGN KEY ("defaultWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_defaultDeliverySourceWarehouseId_fkey" FOREIGN KEY ("defaultDeliverySourceWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "business_settings" ("id") VALUES ('default') ON CONFLICT ("id") DO NOTHING;

INSERT INTO "document_sequences" ("key", "currentValue", "updatedAt")
SELECT 'SALES_ORDER-' || substring("key" FROM 4), "currentValue", "updatedAt" FROM "document_sequences" WHERE "key" LIKE 'SO-%'
ON CONFLICT ("key") DO UPDATE SET "currentValue" = GREATEST("document_sequences"."currentValue", EXCLUDED."currentValue"), "updatedAt" = GREATEST("document_sequences"."updatedAt", EXCLUDED."updatedAt");
INSERT INTO "document_sequences" ("key", "currentValue", "updatedAt")
SELECT 'DELIVERY_TRIP-' || substring("key" FROM 4), "currentValue", "updatedAt" FROM "document_sequences" WHERE "key" LIKE 'DL-%'
ON CONFLICT ("key") DO UPDATE SET "currentValue" = GREATEST("document_sequences"."currentValue", EXCLUDED."currentValue"), "updatedAt" = GREATEST("document_sequences"."updatedAt", EXCLUDED."updatedAt");
INSERT INTO "document_sequences" ("key", "currentValue", "updatedAt")
SELECT 'INVENTORY_MOVEMENT-' || substring("key" FROM 5), "currentValue", "updatedAt" FROM "document_sequences" WHERE "key" LIKE 'STK-%'
ON CONFLICT ("key") DO UPDATE SET "currentValue" = GREATEST("document_sequences"."currentValue", EXCLUDED."currentValue"), "updatedAt" = GREATEST("document_sequences"."updatedAt", EXCLUDED."updatedAt");
INSERT INTO "document_sequences" ("key", "currentValue", "updatedAt")
SELECT 'INVOICE-' || substring("key" FROM 5), "currentValue", "updatedAt" FROM "document_sequences" WHERE "key" LIKE 'INV-%'
ON CONFLICT ("key") DO UPDATE SET "currentValue" = GREATEST("document_sequences"."currentValue", EXCLUDED."currentValue"), "updatedAt" = GREATEST("document_sequences"."updatedAt", EXCLUDED."updatedAt");
INSERT INTO "document_sequences" ("key", "currentValue", "updatedAt")
SELECT 'BILLING_NOTE-' || substring("key" FROM 4), "currentValue", "updatedAt" FROM "document_sequences" WHERE "key" LIKE 'BL-%'
ON CONFLICT ("key") DO UPDATE SET "currentValue" = GREATEST("document_sequences"."currentValue", EXCLUDED."currentValue"), "updatedAt" = GREATEST("document_sequences"."updatedAt", EXCLUDED."updatedAt");
INSERT INTO "document_sequences" ("key", "currentValue", "updatedAt")
SELECT 'PAYMENT-' || substring("key" FROM 5), "currentValue", "updatedAt" FROM "document_sequences" WHERE "key" LIKE 'PAY-%'
ON CONFLICT ("key") DO UPDATE SET "currentValue" = GREATEST("document_sequences"."currentValue", EXCLUDED."currentValue"), "updatedAt" = GREATEST("document_sequences"."updatedAt", EXCLUDED."updatedAt");

DELETE FROM "document_sequences" WHERE "key" LIKE 'SO-%' OR "key" LIKE 'DL-%' OR "key" LIKE 'STK-%' OR "key" LIKE 'INV-%' OR "key" LIKE 'BL-%' OR "key" LIKE 'PAY-%';
