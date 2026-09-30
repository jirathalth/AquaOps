import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const service = readFileSync(resolve(process.cwd(), "src/services/delivery.service.ts"), "utf8");
const repository = readFileSync(resolve(process.cwd(), "src/repositories/delivery.repository.ts"), "utf8");
const actions = readFileSync(resolve(process.cwd(), "src/features/delivery/actions.ts"), "utf8");

describe("delivery workflow boundaries", () => {
  it("keeps trip workflows in the service and persistence in the repository", () => { expect(service).toContain("createDeliveryTrip"); expect(service).toContain("dispatchDeliveryTrip"); expect(service).toContain("recordDeliveryResult"); expect(repository).toContain('isolationLevel: "Serializable"'); });
  it("reuses the centralized inventory batch movement boundary", () => { expect(service).toContain("recordInventoryBatchMovement"); expect(service).not.toContain("stockBalance.update"); expect(service).not.toContain("inventoryLedgerEntry.create"); });
  it("uses DocumentSequence and not MAX for trip numbering", () => { expect(repository).toContain("documentSequence.upsert"); expect(repository).toContain("DL-${yearMonth}"); expect(repository).not.toContain("MAX("); });
  it("enforces delivery.manage inside the server mutation boundary", () => { expect(actions).toContain('requirePermission("delivery.manage")'); });
  it("does not implement future invoice creation", () => { expect(service).not.toContain("createInvoice"); expect(service).not.toContain("invoice.create"); });
});
