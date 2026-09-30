import type { DeliveryTripStatusValue } from "@/config/delivery";
import type { SalesOrderStatusValue } from "@/config/sales-orders";

const tripTransitions: Record<DeliveryTripStatusValue, readonly DeliveryTripStatusValue[]> = {
  PLANNED: ["LOADING", "CANCELLED"], LOADING: ["IN_TRANSIT", "CANCELLED"], IN_TRANSIT: ["COMPLETED"], COMPLETED: [], CANCELLED: [],
};

const orderTransitions: Partial<Record<SalesOrderStatusValue, readonly SalesOrderStatusValue[]>> = {
  CONFIRMED: ["PREPARING"], PREPARING: ["CONFIRMED", "READY"], READY: ["DELIVERING", "CONFIRMED"], DELIVERING: ["DELIVERED", "READY"],
};

export function canTransitionDeliveryTrip(from: DeliveryTripStatusValue, to: DeliveryTripStatusValue) { return tripTransitions[from].includes(to); }
export function canDeliveryTransitionSalesOrder(from: SalesOrderStatusValue, to: SalesOrderStatusValue) { return orderTransitions[from]?.includes(to) ?? false; }
export function isTerminalDeliveryStatus(status: string) { return status === "DELIVERED" || status === "FAILED" || status === "CANCELLED"; }
