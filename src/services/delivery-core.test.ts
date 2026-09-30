import { describe, expect, it } from "vitest";
import { canDeliveryTransitionSalesOrder, canTransitionDeliveryTrip, isTerminalDeliveryStatus } from "@/services/delivery-core";

describe("delivery workflow rules", () => {
  it("keeps trip transitions explicit", () => { expect(canTransitionDeliveryTrip("PLANNED", "LOADING")).toBe(true); expect(canTransitionDeliveryTrip("LOADING", "IN_TRANSIT")).toBe(true); expect(canTransitionDeliveryTrip("IN_TRANSIT", "COMPLETED")).toBe(true); expect(canTransitionDeliveryTrip("COMPLETED", "PLANNED")).toBe(false); });
  it("owns only delivery-related order transitions", () => { expect(canDeliveryTransitionSalesOrder("CONFIRMED", "PREPARING")).toBe(true); expect(canDeliveryTransitionSalesOrder("DELIVERING", "DELIVERED")).toBe(true); expect(canDeliveryTransitionSalesOrder("DELIVERED", "COMPLETED")).toBe(false); });
  it("requires a terminal result before trip completion", () => { expect(isTerminalDeliveryStatus("DELIVERED")).toBe(true); expect(isTerminalDeliveryStatus("FAILED")).toBe(true); expect(isTerminalDeliveryStatus("IN_TRANSIT")).toBe(false); });
});
