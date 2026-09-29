import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "prisma/schema.prisma"), "utf8");
const migration = readFileSync(
  resolve(process.cwd(), "prisma/migrations/20260928000000_phase_1_database_architecture/migration.sql"),
  "utf8",
);
const authMigration = readFileSync(resolve(process.cwd(), "prisma/migrations/20260928010000_authentication_rbac/migration.sql"), "utf8");

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
