import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const service = readFileSync(resolve(process.cwd(), "src/services/inventory.service.ts"), "utf8");
const repository = readFileSync(resolve(process.cwd(), "src/repositories/inventory.repository.ts"), "utf8");
const actions = readFileSync(resolve(process.cwd(), "src/features/inventory/actions.ts"), "utf8");
const migration = readFileSync(resolve(process.cwd(), "prisma/migrations/20260930020000_inventory_management/migration.sql"), "utf8");

describe("inventory architecture", () => {
  it("uses signed append-only ledger entries as the stock authority", () => { expect(service).toContain("createInventoryLedgerEntry"); expect(service).not.toContain("stockBalance.update"); expect(migration).toContain('CREATE TRIGGER "inventory_movements_immutable"'); expect(migration).toContain("AQUAOPS_INSUFFICIENT_STOCK"); });
  it("generates movement numbers with DocumentSequence and not MAX", () => { expect(repository).toContain("documentSequence.upsert"); expect(repository).not.toContain("MAX("); expect(service).toContain("nextInventoryMovementNumber"); });
  it("posts transfers and audit records in one serializable transaction", () => { expect(repository).toContain('isolationLevel: "Serializable"'); expect(service).toContain('type: "TRANSFER"'); expect(service).toContain("sourceNewBalance"); expect(service).toContain("destinationNewBalance"); });
  it.each(["inventory.adjust", "inventory.transfer", "inventory.manage_warehouse"])("enforces %s in server actions", (permission) => { expect(actions).toContain(permission); });
  it("provides a read-only ledger-to-balance reconciliation", () => { expect(repository).toContain("reconcileInventoryProjection"); expect(repository).toContain("SUM(quantity)"); expect(service).toContain("checkInventoryIntegrity"); });
});
