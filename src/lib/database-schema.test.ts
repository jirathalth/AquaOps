import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
const migration = readFileSync(
  resolve(process.cwd(), "prisma/migrations/20260928000000_phase_1_database_architecture/migration.sql"),
  "utf8",
);
const authMigration = readFileSync(resolve(process.cwd(), "prisma/migrations/20260928010000_authentication_rbac/migration.sql"), "utf8");
const pricingMigration = readFileSync(resolve(process.cwd(), "prisma/migrations/20260930000000_product_pricing_management/migration.sql"), "utf8");
const salesOrderMigration = readFileSync(resolve(process.cwd(), "prisma/migrations/20260930010000_sales_order_management/migration.sql"), "utf8");
const inventoryMigration = readFileSync(resolve(process.cwd(), "prisma/migrations/20260930020000_inventory_management/migration.sql"), "utf8");
const deliveryMigration = readFileSync(resolve(process.cwd(), "prisma/migrations/20260930030000_delivery_management/migration.sql"), "utf8");

describe("Phase 1 database architecture", () => {
  it.each([
    "Customer",
    "Product",
    "PriceList",
    "SalesOrder",
    "InventoryLedgerEntry",
    "DeliveryTrip",
    "Invoice",
    "BillingNote",
    "Payment",
    "PaymentAllocation",
    "AuditLog",
  ])("defines the %s model", (model) => {
    expect(schema).toContain(`model ${model} {`);
  });

  it("commits critical database-only integrity guards", () => {
    expect(migration).toContain('CREATE TRIGGER "inventory_ledger_entries_immutable"');
    expect(migration).toContain('CREATE TRIGGER "inventory_ledger_entries_apply_balance"');
    expect(migration).toContain('CREATE TRIGGER "payment_allocations_validate"');
    expect(migration).toContain('CREATE UNIQUE INDEX "product_units_one_base_per_product_key"');
  });
});

describe("Phase 4 authentication schema", () => {
  it.each(["Role", "Permission", "UserRole", "RolePermission"])("defines the %s model", (model) => { expect(schema).toContain(`model ${model} {`); });
  it("adds inactive-user enforcement data without resetting existing users", () => { expect(authMigration).toContain('ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT \'ACTIVE\''); expect(authMigration).not.toContain("DROP TABLE"); });
});

describe("Phase 6 product pricing schema", () => {
  it("stores unit pricing as constrained database decimals", () => { expect(schema).toContain("retailPrice      Decimal"); expect(schema).toContain("wholesalePrice   Decimal"); expect(pricingMigration).toContain('ADD COLUMN "retailPrice" DECIMAL(14,4)'); expect(pricingMigration).toContain('CONSTRAINT "product_units_prices_check"'); expect(pricingMigration).toContain('CHECK ("cost" >= 0'); });
  it("prevents duplicate list tiers and customer price effective dates", () => { expect(schema).toContain("@@unique([priceListId, productUnitId, minimumQuantity])"); expect(schema).toContain("@@unique([customerId, productUnitId, validFrom])"); });
});

describe("Phase 7 sales order schema", () => {
  it("stores transaction and credit snapshots", () => { expect(schema).toContain("creditTermDaysSnapshot"); expect(schema).toContain("productNameSnapshot"); expect(schema).toContain("unitNameSnapshot"); expect(schema).toContain("resolvedUnitPrice"); });
  it("adds status history and concurrency-safe document counters", () => { expect(schema).toContain("model SalesOrderStatusHistory"); expect(schema).toContain("model DocumentSequence"); expect(salesOrderMigration).toContain('CREATE TABLE "document_sequences"'); expect(salesOrderMigration).not.toContain("MAX("); });
  it("does not add inventory mutations to order confirmation", () => { expect(salesOrderMigration).not.toContain('INSERT INTO "inventory_ledger_entries"'); expect(salesOrderMigration).not.toContain('INSERT INTO "inventory_reservations"'); });
});

describe("Phase 8 inventory schema", () => {
  it("keeps signed ledger entries and movement headers immutable", () => { expect(schema).toContain("model InventoryLedgerEntry"); expect(inventoryMigration).toContain('CREATE TRIGGER "inventory_movements_immutable"'); expect(inventoryMigration).toContain("AQUAOPS_INSUFFICIENT_STOCK"); });
  it("updates the balance projection through the database trigger", () => { expect(inventoryMigration).toContain("CREATE OR REPLACE FUNCTION apply_inventory_ledger_entry"); expect(inventoryMigration).toContain('"onHandQuantity" + NEW."quantity" >= "reservedQuantity"'); });
});

describe("Phase 9 delivery schema", () => {
  it("uses vehicle warehouses and idempotent inventory references", () => { expect(schema).toContain("model Vehicle"); expect(schema).toContain("WarehouseType"); expect(schema).toContain("idempotencyKey"); expect(deliveryMigration).toContain('CREATE TYPE "WarehouseType"'); expect(deliveryMigration).toContain('inventory_movements_idempotencyKey_key'); });
  it("prevents conflicting active order assignments", () => { expect(deliveryMigration).toContain('deliveries_one_active_trip_per_order_key'); expect(deliveryMigration).toContain("WHERE \"status\" IN ('PENDING', 'LOADED', 'IN_TRANSIT')"); });
  it("adds lightweight proof, failure, and return metadata", () => { expect(schema).toContain("failureReason"); expect(schema).toContain("proofReference"); expect(schema).toContain("returnedAt"); });
});
