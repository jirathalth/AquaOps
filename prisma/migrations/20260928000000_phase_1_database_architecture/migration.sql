-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('RETAIL', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('BILLING', 'SHIPPING');

-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('CASH', 'CREDIT');

-- CreateEnum
CREATE TYPE "PriceListStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SalesOrderStatus" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('OPENING', 'RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT', 'SALE', 'DELIVERY', 'RETURN');

-- CreateEnum
CREATE TYPE "InventoryReservationStatus" AS ENUM ('ACTIVE', 'RELEASED', 'FULFILLED');

-- CreateEnum
CREATE TYPE "DeliveryTripStatus" AS ENUM ('PLANNED', 'LOADING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStopStatus" AS ENUM ('PENDING', 'ARRIVED', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'LOADED', 'IN_TRANSIT', 'PARTIALLY_DELIVERED', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID');

-- CreateEnum
CREATE TYPE "BillingNoteStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'QR_CODE', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'VOID');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actorId" TEXT,
    "actorName" VARCHAR(120),
    "action" VARCHAR(64) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(100) NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "metadata" JSONB,
    "requestId" VARCHAR(100),
    "ipAddress" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "type" "CustomerType" NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "legalName" VARCHAR(200) NOT NULL,
    "displayName" VARCHAR(200) NOT NULL,
    "taxId" VARCHAR(13),
    "taxBranchCode" VARCHAR(5),
    "contactName" VARCHAR(120),
    "phone" VARCHAR(32),
    "email" VARCHAR(254),
    "defaultSaleType" "SaleType" NOT NULL DEFAULT 'CASH',
    "creditLimit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "creditTermDays" INTEGER NOT NULL DEFAULT 0,
    "defaultPriceListId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "type" "AddressType" NOT NULL,
    "label" VARCHAR(100),
    "contactName" VARCHAR(120),
    "phone" VARCHAR(32),
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255),
    "subdistrict" VARCHAR(100),
    "district" VARCHAR(100),
    "province" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(10),
    "countryCode" CHAR(2) NOT NULL DEFAULT 'TH',
    "deliveryNotes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "parentId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units_of_measure" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "nameTh" VARCHAR(100) NOT NULL,
    "nameEn" VARCHAR(100),
    "symbol" VARCHAR(32) NOT NULL,
    "decimalScale" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(64) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "categoryId" UUID,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "trackInventory" BOOLEAN NOT NULL DEFAULT true,
    "reorderLevel" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_units" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "conversionFactor" DECIMAL(14,6) NOT NULL,
    "barcode" VARCHAR(64),
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "status" "PriceListStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" CHAR(3) NOT NULL DEFAULT 'THB',
    "validFrom" TIMESTAMPTZ(3),
    "validTo" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_list_items" (
    "id" UUID NOT NULL,
    "priceListId" UUID NOT NULL,
    "productUnitId" UUID NOT NULL,
    "minimumQuantity" DECIMAL(14,3) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_product_prices" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "productUnitId" UUID NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "validFrom" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customer_product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "address" JSONB,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_balances" (
    "id" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "onHandQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "reservedQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "stock_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL,
    "movementNo" VARCHAR(32) NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "sourceWarehouseId" UUID,
    "destinationWarehouseId" UUID,
    "referenceType" VARCHAR(64),
    "referenceId" VARCHAR(100),
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_ledger_entries" (
    "id" UUID NOT NULL,
    "movementId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitCost" DECIMAL(14,4),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_reservations" (
    "id" UUID NOT NULL,
    "salesOrderItemId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "status" "InventoryReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" UUID NOT NULL,
    "orderNo" VARCHAR(32) NOT NULL,
    "customerId" UUID NOT NULL,
    "warehouseId" UUID NOT NULL,
    "priceListId" UUID,
    "status" "SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "saleType" "SaleType" NOT NULL,
    "orderDate" DATE NOT NULL,
    "requestedDeliveryDate" DATE,
    "currency" CHAR(3) NOT NULL DEFAULT 'THB',
    "billingAddress" JSONB,
    "shippingAddress" JSONB,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "confirmedAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_items" (
    "id" UUID NOT NULL,
    "salesOrderId" UUID NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "productId" UUID NOT NULL,
    "productUnitId" UUID NOT NULL,
    "sku" VARCHAR(64) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "conversionFactor" DECIMAL(14,6) NOT NULL,
    "baseQuantity" DECIMAL(14,3) NOT NULL,
    "fulfilledQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sales_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_trips" (
    "id" UUID NOT NULL,
    "tripNo" VARCHAR(32) NOT NULL,
    "warehouseId" UUID NOT NULL,
    "status" "DeliveryTripStatus" NOT NULL DEFAULT 'PLANNED',
    "plannedDate" DATE NOT NULL,
    "driverName" VARCHAR(120),
    "vehiclePlate" VARCHAR(32),
    "departedAt" TIMESTAMPTZ(3),
    "returnedAt" TIMESTAMPTZ(3),
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "delivery_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_stops" (
    "id" UUID NOT NULL,
    "deliveryTripId" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "customerId" UUID NOT NULL,
    "addressSnapshot" JSONB NOT NULL,
    "status" "DeliveryStopStatus" NOT NULL DEFAULT 'PENDING',
    "arrivedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "delivery_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" UUID NOT NULL,
    "deliveryNo" VARCHAR(32) NOT NULL,
    "deliveryStopId" UUID NOT NULL,
    "salesOrderId" UUID NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "deliveredAt" TIMESTAMPTZ(3),
    "receivedBy" VARCHAR(120),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_items" (
    "id" UUID NOT NULL,
    "deliveryId" UUID NOT NULL,
    "salesOrderItemId" UUID NOT NULL,
    "plannedQuantity" DECIMAL(14,3) NOT NULL,
    "deliveredQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "plannedBaseQuantity" DECIMAL(14,3) NOT NULL,
    "deliveredBaseQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "delivery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "invoiceNo" VARCHAR(32) NOT NULL,
    "customerId" UUID NOT NULL,
    "salesOrderId" UUID,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoiceDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'THB',
    "billingAddress" JSONB,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "issuedAt" TIMESTAMPTZ(3),
    "voidedAt" TIMESTAMPTZ(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "salesOrderItemId" UUID,
    "productId" UUID,
    "productUnitId" UUID,
    "description" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_notes" (
    "id" UUID NOT NULL,
    "billingNo" VARCHAR(32) NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "BillingNoteStatus" NOT NULL DEFAULT 'DRAFT',
    "billingDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'THB',
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "issuedAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "billing_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_note_invoices" (
    "id" UUID NOT NULL,
    "billingNoteId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_note_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "paymentNo" VARCHAR(32) NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "paymentDate" DATE NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'THB',
    "externalReference" VARCHAR(100),
    "receivedAccount" VARCHAR(120),
    "notes" TEXT,
    "completedAt" TIMESTAMPTZ(3),
    "voidedAt" TIMESTAMPTZ(3),
    "recordedById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "billingNoteId" UUID,
    "amount" DECIMAL(14,2) NOT NULL,
    "allocatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE INDEX "user_roles_assignedById_idx" ON "user_roles"("assignedById");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_createdAt_idx" ON "audit_logs"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "customers_code_key" ON "customers"("code");

-- CreateIndex
CREATE INDEX "customers_type_status_idx" ON "customers"("type", "status");

-- CreateIndex
CREATE INDEX "customers_displayName_idx" ON "customers"("displayName");

-- CreateIndex
CREATE INDEX "customers_defaultPriceListId_idx" ON "customers"("defaultPriceListId");

-- CreateIndex
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "customers_taxId_taxBranchCode_key" ON "customers"("taxId", "taxBranchCode");

-- CreateIndex
CREATE INDEX "customer_addresses_customerId_type_idx" ON "customer_addresses"("customerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_code_key" ON "product_categories"("code");

-- CreateIndex
CREATE INDEX "product_categories_parentId_idx" ON "product_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_code_key" ON "units_of_measure"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_categoryId_status_idx" ON "products"("categoryId", "status");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_units_barcode_key" ON "product_units"("barcode");

-- CreateIndex
CREATE INDEX "product_units_unitId_idx" ON "product_units"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "product_units_productId_unitId_key" ON "product_units"("productId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "price_lists_code_key" ON "price_lists"("code");

-- CreateIndex
CREATE INDEX "price_lists_status_validFrom_validTo_idx" ON "price_lists"("status", "validFrom", "validTo");

-- CreateIndex
CREATE INDEX "price_list_items_productUnitId_idx" ON "price_list_items"("productUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_items_priceListId_productUnitId_minimumQuantity_key" ON "price_list_items"("priceListId", "productUnitId", "minimumQuantity");

-- CreateIndex
CREATE INDEX "customer_product_prices_productUnitId_idx" ON "customer_product_prices"("productUnitId");

-- CreateIndex
CREATE INDEX "customer_product_prices_customerId_validFrom_validTo_idx" ON "customer_product_prices"("customerId", "validFrom", "validTo");

-- CreateIndex
CREATE UNIQUE INDEX "customer_product_prices_customerId_productUnitId_validFrom_key" ON "customer_product_prices"("customerId", "productUnitId", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_status_idx" ON "warehouses"("status");

-- CreateIndex
CREATE INDEX "stock_balances_productId_idx" ON "stock_balances"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_balances_warehouseId_productId_key" ON "stock_balances"("warehouseId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_movements_movementNo_key" ON "inventory_movements"("movementNo");

-- CreateIndex
CREATE INDEX "inventory_movements_type_occurredAt_idx" ON "inventory_movements"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "inventory_movements_referenceType_referenceId_idx" ON "inventory_movements"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "inventory_movements_sourceWarehouseId_idx" ON "inventory_movements"("sourceWarehouseId");

-- CreateIndex
CREATE INDEX "inventory_movements_destinationWarehouseId_idx" ON "inventory_movements"("destinationWarehouseId");

-- CreateIndex
CREATE INDEX "inventory_movements_createdById_idx" ON "inventory_movements"("createdById");

-- CreateIndex
CREATE INDEX "inventory_ledger_entries_movementId_idx" ON "inventory_ledger_entries"("movementId");

-- CreateIndex
CREATE INDEX "inventory_ledger_entries_warehouseId_productId_createdAt_idx" ON "inventory_ledger_entries"("warehouseId", "productId", "createdAt");

-- CreateIndex
CREATE INDEX "inventory_ledger_entries_productId_createdAt_idx" ON "inventory_ledger_entries"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "inventory_reservations_warehouseId_productId_status_idx" ON "inventory_reservations"("warehouseId", "productId", "status");

-- CreateIndex
CREATE INDEX "inventory_reservations_salesOrderItemId_status_idx" ON "inventory_reservations"("salesOrderItemId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_orderNo_key" ON "sales_orders"("orderNo");

-- CreateIndex
CREATE INDEX "sales_orders_customerId_orderDate_idx" ON "sales_orders"("customerId", "orderDate");

-- CreateIndex
CREATE INDEX "sales_orders_warehouseId_status_idx" ON "sales_orders"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "sales_orders_status_orderDate_idx" ON "sales_orders"("status", "orderDate");

-- CreateIndex
CREATE INDEX "sales_orders_requestedDeliveryDate_status_idx" ON "sales_orders"("requestedDeliveryDate", "status");

-- CreateIndex
CREATE INDEX "sales_orders_priceListId_idx" ON "sales_orders"("priceListId");

-- CreateIndex
CREATE INDEX "sales_orders_createdById_idx" ON "sales_orders"("createdById");

-- CreateIndex
CREATE INDEX "sales_order_items_productId_idx" ON "sales_order_items"("productId");

-- CreateIndex
CREATE INDEX "sales_order_items_productUnitId_idx" ON "sales_order_items"("productUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_order_items_salesOrderId_lineNo_key" ON "sales_order_items"("salesOrderId", "lineNo");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_trips_tripNo_key" ON "delivery_trips"("tripNo");

-- CreateIndex
CREATE INDEX "delivery_trips_warehouseId_plannedDate_idx" ON "delivery_trips"("warehouseId", "plannedDate");

-- CreateIndex
CREATE INDEX "delivery_trips_status_plannedDate_idx" ON "delivery_trips"("status", "plannedDate");

-- CreateIndex
CREATE INDEX "delivery_trips_createdById_idx" ON "delivery_trips"("createdById");

-- CreateIndex
CREATE INDEX "delivery_stops_customerId_idx" ON "delivery_stops"("customerId");

-- CreateIndex
CREATE INDEX "delivery_stops_status_idx" ON "delivery_stops"("status");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_stops_deliveryTripId_sequence_key" ON "delivery_stops"("deliveryTripId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_deliveryNo_key" ON "deliveries"("deliveryNo");

-- CreateIndex
CREATE INDEX "deliveries_salesOrderId_status_idx" ON "deliveries"("salesOrderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_deliveryStopId_salesOrderId_key" ON "deliveries"("deliveryStopId", "salesOrderId");

-- CreateIndex
CREATE INDEX "delivery_items_salesOrderItemId_idx" ON "delivery_items"("salesOrderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_items_deliveryId_salesOrderItemId_key" ON "delivery_items"("deliveryId", "salesOrderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNo_key" ON "invoices"("invoiceNo");

-- CreateIndex
CREATE INDEX "invoices_customerId_invoiceDate_idx" ON "invoices"("customerId", "invoiceDate");

-- CreateIndex
CREATE INDEX "invoices_customerId_status_dueDate_idx" ON "invoices"("customerId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "invoices_salesOrderId_idx" ON "invoices"("salesOrderId");

-- CreateIndex
CREATE INDEX "invoices_status_dueDate_idx" ON "invoices"("status", "dueDate");

-- CreateIndex
CREATE INDEX "invoices_createdById_idx" ON "invoices"("createdById");

-- CreateIndex
CREATE INDEX "invoice_items_salesOrderItemId_idx" ON "invoice_items"("salesOrderItemId");

-- CreateIndex
CREATE INDEX "invoice_items_productId_idx" ON "invoice_items"("productId");

-- CreateIndex
CREATE INDEX "invoice_items_productUnitId_idx" ON "invoice_items"("productUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_items_invoiceId_lineNo_key" ON "invoice_items"("invoiceId", "lineNo");

-- CreateIndex
CREATE UNIQUE INDEX "billing_notes_billingNo_key" ON "billing_notes"("billingNo");

-- CreateIndex
CREATE INDEX "billing_notes_customerId_billingDate_idx" ON "billing_notes"("customerId", "billingDate");

-- CreateIndex
CREATE INDEX "billing_notes_customerId_status_dueDate_idx" ON "billing_notes"("customerId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "billing_notes_status_dueDate_idx" ON "billing_notes"("status", "dueDate");

-- CreateIndex
CREATE INDEX "billing_notes_createdById_idx" ON "billing_notes"("createdById");

-- CreateIndex
CREATE INDEX "billing_note_invoices_invoiceId_idx" ON "billing_note_invoices"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_note_invoices_billingNoteId_invoiceId_key" ON "billing_note_invoices"("billingNoteId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentNo_key" ON "payments"("paymentNo");

-- CreateIndex
CREATE INDEX "payments_customerId_paymentDate_idx" ON "payments"("customerId", "paymentDate");

-- CreateIndex
CREATE INDEX "payments_customerId_status_idx" ON "payments"("customerId", "status");

-- CreateIndex
CREATE INDEX "payments_externalReference_idx" ON "payments"("externalReference");

-- CreateIndex
CREATE INDEX "payments_recordedById_idx" ON "payments"("recordedById");

-- CreateIndex
CREATE INDEX "payment_allocations_invoiceId_allocatedAt_idx" ON "payment_allocations"("invoiceId", "allocatedAt");

-- CreateIndex
CREATE INDEX "payment_allocations_billingNoteId_idx" ON "payment_allocations"("billingNoteId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocations_paymentId_invoiceId_key" ON "payment_allocations"("paymentId", "invoiceId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_defaultPriceListId_fkey" FOREIGN KEY ("defaultPriceListId") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "product_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_product_prices" ADD CONSTRAINT "customer_product_prices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_product_prices" ADD CONSTRAINT "customer_product_prices_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "product_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_sourceWarehouseId_fkey" FOREIGN KEY ("sourceWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_destinationWarehouseId_fkey" FOREIGN KEY ("destinationWarehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_ledger_entries" ADD CONSTRAINT "inventory_ledger_entries_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "inventory_movements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_ledger_entries" ADD CONSTRAINT "inventory_ledger_entries_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_ledger_entries" ADD CONSTRAINT "inventory_ledger_entries_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "sales_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "product_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_trips" ADD CONSTRAINT "delivery_trips_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_trips" ADD CONSTRAINT "delivery_trips_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_deliveryTripId_fkey" FOREIGN KEY ("deliveryTripId") REFERENCES "delivery_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_deliveryStopId_fkey" FOREIGN KEY ("deliveryStopId") REFERENCES "delivery_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_items" ADD CONSTRAINT "delivery_items_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_items" ADD CONSTRAINT "delivery_items_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "sales_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "sales_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "product_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_note_invoices" ADD CONSTRAINT "billing_note_invoices_billingNoteId_fkey" FOREIGN KEY ("billingNoteId") REFERENCES "billing_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_note_invoices" ADD CONSTRAINT "billing_note_invoices_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_billingNoteId_fkey" FOREIGN KEY ("billingNoteId") REFERENCES "billing_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Business invariants not expressible in Prisma schema
ALTER TABLE "customers" ADD CONSTRAINT "customers_credit_terms_check" CHECK ("creditLimit" >= 0 AND "creditTermDays" >= 0);
ALTER TABLE "units_of_measure" ADD CONSTRAINT "units_of_measure_decimal_scale_check" CHECK ("decimalScale" BETWEEN 0 AND 6);
ALTER TABLE "products" ADD CONSTRAINT "products_reorder_level_check" CHECK ("reorderLevel" >= 0);
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_conversion_factor_check" CHECK ("conversionFactor" > 0 AND (NOT "isBase" OR "conversionFactor" = 1));
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_validity_check" CHECK ("validTo" IS NULL OR "validFrom" IS NULL OR "validTo" >= "validFrom");
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_values_check" CHECK ("minimumQuantity" > 0 AND "unitPrice" >= 0);
ALTER TABLE "customer_product_prices" ADD CONSTRAINT "customer_product_prices_values_check" CHECK ("unitPrice" >= 0 AND ("validTo" IS NULL OR "validTo" >= "validFrom"));
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_quantities_check" CHECK ("onHandQuantity" >= 0 AND "reservedQuantity" >= 0 AND "reservedQuantity" <= "onHandQuantity");
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_warehouses_check" CHECK ("sourceWarehouseId" IS NULL OR "destinationWarehouseId" IS NULL OR "sourceWarehouseId" <> "destinationWarehouseId");
ALTER TABLE "inventory_ledger_entries" ADD CONSTRAINT "inventory_ledger_entries_values_check" CHECK ("quantity" <> 0 AND ("unitCost" IS NULL OR "unitCost" >= 0));
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_quantity_check" CHECK ("quantity" > 0);
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_dates_check" CHECK ("requestedDeliveryDate" IS NULL OR "requestedDeliveryDate" >= "orderDate");
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_amounts_check" CHECK ("subtotal" >= 0 AND "discountAmount" >= 0 AND "taxAmount" >= 0 AND "totalAmount" >= 0);
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_values_check" CHECK ("lineNo" > 0 AND "quantity" > 0 AND "conversionFactor" > 0 AND "baseQuantity" > 0 AND "fulfilledQuantity" >= 0 AND "fulfilledQuantity" <= "quantity" AND "unitPrice" >= 0 AND "discountAmount" >= 0 AND "taxRate" BETWEEN 0 AND 100 AND "taxAmount" >= 0 AND "lineTotal" >= 0);
ALTER TABLE "delivery_trips" ADD CONSTRAINT "delivery_trips_times_check" CHECK ("returnedAt" IS NULL OR "departedAt" IS NULL OR "returnedAt" >= "departedAt");
ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_values_check" CHECK ("sequence" > 0 AND ("completedAt" IS NULL OR "arrivedAt" IS NULL OR "completedAt" >= "arrivedAt"));
ALTER TABLE "delivery_items" ADD CONSTRAINT "delivery_items_quantities_check" CHECK ("plannedQuantity" > 0 AND "deliveredQuantity" >= 0 AND "deliveredQuantity" <= "plannedQuantity" AND "plannedBaseQuantity" > 0 AND "deliveredBaseQuantity" >= 0 AND "deliveredBaseQuantity" <= "plannedBaseQuantity");
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_dates_check" CHECK ("dueDate" >= "invoiceDate");
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_amounts_check" CHECK ("subtotal" >= 0 AND "discountAmount" >= 0 AND "taxAmount" >= 0 AND "totalAmount" >= 0);
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_values_check" CHECK ("lineNo" > 0 AND "quantity" > 0 AND "unitPrice" >= 0 AND "discountAmount" >= 0 AND "taxRate" BETWEEN 0 AND 100 AND "taxAmount" >= 0 AND "lineTotal" >= 0);
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_reference_check" CHECK (("productId" IS NULL) = ("productUnitId" IS NULL));
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_dates_check" CHECK ("dueDate" >= "billingDate");
ALTER TABLE "billing_notes" ADD CONSTRAINT "billing_notes_amount_check" CHECK ("totalAmount" >= 0);
ALTER TABLE "billing_note_invoices" ADD CONSTRAINT "billing_note_invoices_amount_check" CHECK ("amount" > 0);
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_check" CHECK ("amount" > 0);
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_amount_check" CHECK ("amount" > 0);

-- Only one operational default is allowed for each scope.
CREATE UNIQUE INDEX "customer_addresses_one_default_per_type_key" ON "customer_addresses" ("customerId", "type") WHERE "isDefault" = true;
CREATE UNIQUE INDEX "product_units_one_base_per_product_key" ON "product_units" ("productId") WHERE "isBase" = true;
CREATE UNIQUE INDEX "warehouses_one_default_key" ON "warehouses" ("isDefault") WHERE "isDefault" = true;
CREATE UNIQUE INDEX "inventory_reservations_one_active_per_item_key" ON "inventory_reservations" ("salesOrderItemId", "warehouseId") WHERE "status" = 'ACTIVE';

-- Inventory ledger rows are immutable. Corrections use a reversing movement.
CREATE FUNCTION reject_immutable_row_change() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% rows are immutable; append a compensating record instead', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "inventory_ledger_entries_immutable"
BEFORE UPDATE OR DELETE ON "inventory_ledger_entries"
FOR EACH ROW EXECUTE FUNCTION reject_immutable_row_change();

CREATE TRIGGER "audit_logs_immutable"
BEFORE UPDATE OR DELETE ON "audit_logs"
FOR EACH ROW EXECUTE FUNCTION reject_immutable_row_change();

-- Every ledger insert updates the warehouse/product balance in the same transaction.
CREATE FUNCTION apply_inventory_ledger_entry() RETURNS trigger AS $$
BEGIN
  INSERT INTO "stock_balances" ("id", "warehouseId", "productId", "onHandQuantity", "reservedQuantity", "updatedAt")
  VALUES (gen_random_uuid(), NEW."warehouseId", NEW."productId", NEW."quantity", 0, CURRENT_TIMESTAMP)
  ON CONFLICT ("warehouseId", "productId") DO UPDATE
  SET "onHandQuantity" = "stock_balances"."onHandQuantity" + EXCLUDED."onHandQuantity",
      "updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "inventory_ledger_entries_apply_balance"
AFTER INSERT ON "inventory_ledger_entries"
FOR EACH ROW EXECUTE FUNCTION apply_inventory_ledger_entry();

-- Active reservations update reserved stock and cannot exceed on-hand stock.
CREATE FUNCTION apply_inventory_reservation() RETURNS trigger AS $$
DECLARE
  reservation_delta DECIMAL(14,3);
  target_warehouse UUID;
  target_product UUID;
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD."warehouseId" <> NEW."warehouseId" OR OLD."productId" <> NEW."productId" OR OLD."salesOrderItemId" <> NEW."salesOrderItemId") THEN
    RAISE EXCEPTION 'Reservation identity cannot be changed';
  END IF;

  IF TG_OP = 'INSERT' THEN
    reservation_delta := CASE WHEN NEW."status" = 'ACTIVE' THEN NEW."quantity" ELSE 0 END;
    target_warehouse := NEW."warehouseId";
    target_product := NEW."productId";
  ELSIF TG_OP = 'UPDATE' THEN
    reservation_delta := (CASE WHEN NEW."status" = 'ACTIVE' THEN NEW."quantity" ELSE 0 END)
      - (CASE WHEN OLD."status" = 'ACTIVE' THEN OLD."quantity" ELSE 0 END);
    target_warehouse := NEW."warehouseId";
    target_product := NEW."productId";
  ELSE
    reservation_delta := CASE WHEN OLD."status" = 'ACTIVE' THEN -OLD."quantity" ELSE 0 END;
    target_warehouse := OLD."warehouseId";
    target_product := OLD."productId";
  END IF;

  IF reservation_delta <> 0 THEN
    UPDATE "stock_balances"
    SET "reservedQuantity" = "reservedQuantity" + reservation_delta,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "warehouseId" = target_warehouse
      AND "productId" = target_product
      AND "reservedQuantity" + reservation_delta >= 0
      AND "reservedQuantity" + reservation_delta <= "onHandQuantity";

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock or missing stock balance for reservation';
    END IF;
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "inventory_reservations_apply_balance"
AFTER INSERT OR UPDATE OR DELETE ON "inventory_reservations"
FOR EACH ROW EXECUTE FUNCTION apply_inventory_reservation();

-- Cross-table guards keep product, customer, order, and warehouse scopes aligned.
CREATE FUNCTION validate_sales_order_item_scope() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "product_units"
    WHERE "id" = NEW."productUnitId" AND "productId" = NEW."productId"
  ) THEN
    RAISE EXCEPTION 'Sales order product unit does not belong to the product';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "sales_order_items_validate_scope"
BEFORE INSERT OR UPDATE ON "sales_order_items"
FOR EACH ROW EXECUTE FUNCTION validate_sales_order_item_scope();

CREATE FUNCTION validate_inventory_reservation_scope() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "sales_order_items" item
    JOIN "sales_orders" sales_order ON sales_order."id" = item."salesOrderId"
    WHERE item."id" = NEW."salesOrderItemId"
      AND item."productId" = NEW."productId"
      AND sales_order."warehouseId" = NEW."warehouseId"
  ) THEN
    RAISE EXCEPTION 'Reservation product/warehouse does not match the sales order item';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "inventory_reservations_validate_scope"
BEFORE INSERT OR UPDATE ON "inventory_reservations"
FOR EACH ROW EXECUTE FUNCTION validate_inventory_reservation_scope();

CREATE FUNCTION validate_delivery_scope() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "delivery_stops" stop
    JOIN "sales_orders" sales_order ON sales_order."id" = NEW."salesOrderId"
    WHERE stop."id" = NEW."deliveryStopId"
      AND stop."customerId" = sales_order."customerId"
  ) THEN
    RAISE EXCEPTION 'Delivery stop customer does not match the sales order customer';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "deliveries_validate_scope"
BEFORE INSERT OR UPDATE ON "deliveries"
FOR EACH ROW EXECUTE FUNCTION validate_delivery_scope();

CREATE FUNCTION validate_delivery_item_scope() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "deliveries" delivery
    JOIN "sales_order_items" item ON item."id" = NEW."salesOrderItemId"
    WHERE delivery."id" = NEW."deliveryId"
      AND delivery."salesOrderId" = item."salesOrderId"
  ) THEN
    RAISE EXCEPTION 'Delivery item does not belong to the delivery sales order';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "delivery_items_validate_scope"
BEFORE INSERT OR UPDATE ON "delivery_items"
FOR EACH ROW EXECUTE FUNCTION validate_delivery_item_scope();

CREATE FUNCTION validate_invoice_scope() RETURNS trigger AS $$
BEGIN
  IF NEW."salesOrderId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "sales_orders"
    WHERE "id" = NEW."salesOrderId"
      AND "customerId" = NEW."customerId"
      AND "currency" = NEW."currency"
  ) THEN
    RAISE EXCEPTION 'Invoice customer/currency does not match the sales order';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "invoices_validate_scope"
BEFORE INSERT OR UPDATE ON "invoices"
FOR EACH ROW EXECUTE FUNCTION validate_invoice_scope();

CREATE FUNCTION validate_invoice_item_scope() RETURNS trigger AS $$
DECLARE
  invoice_sales_order UUID;
BEGIN
  IF NEW."productId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "product_units"
    WHERE "id" = NEW."productUnitId" AND "productId" = NEW."productId"
  ) THEN
    RAISE EXCEPTION 'Invoice product unit does not belong to the product';
  END IF;

  IF NEW."salesOrderItemId" IS NOT NULL THEN
    SELECT "salesOrderId" INTO invoice_sales_order FROM "invoices" WHERE "id" = NEW."invoiceId";
    IF invoice_sales_order IS NULL OR NOT EXISTS (
      SELECT 1 FROM "sales_order_items"
      WHERE "id" = NEW."salesOrderItemId" AND "salesOrderId" = invoice_sales_order
    ) THEN
      RAISE EXCEPTION 'Invoice item does not belong to the invoice sales order';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "invoice_items_validate_scope"
BEFORE INSERT OR UPDATE ON "invoice_items"
FOR EACH ROW EXECUTE FUNCTION validate_invoice_item_scope();

CREATE FUNCTION validate_billing_note_invoice() RETURNS trigger AS $$
DECLARE
  billing_customer UUID;
  billing_currency CHAR(3);
  billing_total DECIMAL(14,2);
  invoice_customer UUID;
  invoice_currency CHAR(3);
  invoice_total DECIMAL(14,2);
  existing_total DECIMAL(14,2);
BEGIN
  SELECT "customerId", "currency", "totalAmount" INTO billing_customer, billing_currency, billing_total
  FROM "billing_notes" WHERE "id" = NEW."billingNoteId" FOR UPDATE;
  SELECT "customerId", "currency", "totalAmount" INTO invoice_customer, invoice_currency, invoice_total
  FROM "invoices" WHERE "id" = NEW."invoiceId";

  IF billing_customer <> invoice_customer OR billing_currency <> invoice_currency THEN
    RAISE EXCEPTION 'Billing note and invoice customer/currency must match';
  END IF;
  IF NEW."amount" > invoice_total THEN
    RAISE EXCEPTION 'Billing amount exceeds invoice amount';
  END IF;

  SELECT COALESCE(SUM("amount"), 0) INTO existing_total
  FROM "billing_note_invoices" WHERE "billingNoteId" = NEW."billingNoteId" AND "id" <> NEW."id";
  IF existing_total + NEW."amount" > billing_total THEN
    RAISE EXCEPTION 'Invoice allocation exceeds billing note amount';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "billing_note_invoices_validate"
BEFORE INSERT OR UPDATE ON "billing_note_invoices"
FOR EACH ROW EXECUTE FUNCTION validate_billing_note_invoice();

-- Financial allocations must stay within one customer/currency and cannot over-allocate.
CREATE FUNCTION validate_payment_allocation() RETURNS trigger AS $$
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
  IF payment_status = 'VOID' THEN
    RAISE EXCEPTION 'A void payment cannot be allocated';
  END IF;

  SELECT COALESCE(SUM("amount"), 0) INTO existing_payment_total
  FROM "payment_allocations" WHERE "paymentId" = NEW."paymentId" AND "id" <> NEW."id";
  SELECT COALESCE(SUM("amount"), 0) INTO existing_invoice_total
  FROM "payment_allocations" allocation
  JOIN "payments" allocated_payment ON allocated_payment."id" = allocation."paymentId"
  WHERE allocation."invoiceId" = NEW."invoiceId"
    AND allocated_payment."status" <> 'VOID'
    AND allocation."id" <> NEW."id";

  IF existing_payment_total + NEW."amount" > payment_total THEN
    RAISE EXCEPTION 'Payment allocation exceeds payment amount';
  END IF;
  IF existing_invoice_total + NEW."amount" > invoice_total THEN
    RAISE EXCEPTION 'Payment allocation exceeds invoice amount';
  END IF;

  IF NEW."billingNoteId" IS NOT NULL THEN
    SELECT "customerId", "currency" INTO billing_customer, billing_currency
    FROM "billing_notes" WHERE "id" = NEW."billingNoteId";
    IF billing_customer <> payment_customer OR billing_currency <> payment_currency OR NOT EXISTS (
      SELECT 1 FROM "billing_note_invoices"
      WHERE "billingNoteId" = NEW."billingNoteId" AND "invoiceId" = NEW."invoiceId"
    ) THEN
      RAISE EXCEPTION 'Billing note must contain the allocated invoice for the same customer/currency';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "payment_allocations_validate"
BEFORE INSERT OR UPDATE ON "payment_allocations"
FOR EACH ROW EXECUTE FUNCTION validate_payment_allocation();
