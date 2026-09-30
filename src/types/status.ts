export const businessStatuses = ["draft", "pending", "confirmed", "preparing", "ready", "delivering", "delivered", "failed", "completed", "paid", "partiallyPaid", "overdue", "cancelled", "active", "inactive"] as const;
export type BusinessStatus = (typeof businessStatuses)[number];
