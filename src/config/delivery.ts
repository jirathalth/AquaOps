export const deliveryTripStatusConfig = {
  PLANNED: { th: "วางแผนแล้ว", badge: "pending" },
  LOADING: { th: "เตรียม/ขึ้นสินค้า", badge: "preparing" },
  IN_TRANSIT: { th: "ออกรถจัดส่ง", badge: "delivering" },
  COMPLETED: { th: "เสร็จสิ้น", badge: "completed" },
  CANCELLED: { th: "ยกเลิก", badge: "cancelled" },
} as const;

export const deliveryStatusConfig = {
  PENDING: { th: "รอเตรียมสินค้า", badge: "pending" },
  LOADED: { th: "ขึ้นสินค้าแล้ว", badge: "ready" },
  IN_TRANSIT: { th: "กำลังจัดส่ง", badge: "delivering" },
  PARTIALLY_DELIVERED: { th: "จัดส่งบางส่วน", badge: "pending" },
  DELIVERED: { th: "จัดส่งสำเร็จ", badge: "delivered" },
  FAILED: { th: "จัดส่งไม่สำเร็จ", badge: "failed" },
  CANCELLED: { th: "ยกเลิก", badge: "cancelled" },
} as const;

export const failedDeliveryReasons = {
  CUSTOMER_UNAVAILABLE: "ลูกค้าไม่อยู่รับสินค้า",
  ADDRESS_ISSUE: "ปัญหาที่อยู่จัดส่ง",
  CUSTOMER_REFUSED: "ลูกค้าปฏิเสธรับสินค้า",
  UNABLE_TO_CONTACT: "ไม่สามารถติดต่อลูกค้าได้",
  VEHICLE_PROBLEM: "ปัญหารถจัดส่ง",
  OTHER: "อื่น ๆ",
} as const;

export const deliveryTripSortFields = ["tripNo", "plannedDate", "status", "vehicle", "driver", "updatedAt"] as const;
export type DeliveryTripStatusValue = keyof typeof deliveryTripStatusConfig;
export type DeliveryStatusValue = keyof typeof deliveryStatusConfig;
