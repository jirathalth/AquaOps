import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const service = readFileSync(resolve(process.cwd(), "src/services/sales-order.service.ts"), "utf8");
const actions = readFileSync(resolve(process.cwd(), "src/features/sales-orders/actions.ts"), "utf8");

describe("sales order workflow boundaries", () => {
  it("uses the centralized pricing resolver and preserves persisted line snapshots during edits", () => { expect(service).toContain("resolveProductPrice"); expect(service).toContain("existing.resolvedUnitPrice"); expect(service).toContain("existing.productNameSnapshot"); expect(service).toContain("existing.unitNameSnapshot"); });
  it("wraps create, update, confirm, history and audit orchestration in transactions", () => { expect(service.match(/withSalesOrderTransaction/g)?.length).toBeGreaterThanOrEqual(3); expect(service).toContain("createSalesOrderHistory"); expect(service).toContain("createSalesOrderAuditLog"); });
  it.each(["sales_order.create", "sales_order.update", "sales_order.confirm", "sales_order.cancel"])("enforces %s in server actions", (permission) => { expect(actions).toContain(permission); });
  it("keeps inventory outside the Phase 7 order service", () => { expect(service).not.toContain("inventoryReservation"); expect(service).not.toContain("inventoryLedger"); });
});
