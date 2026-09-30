export const salesOrderStatusConfig = {
  DRAFT: { th: "ฉบับร่าง", badge: "draft" },
  CONFIRMED: { th: "ยืนยันแล้ว", badge: "confirmed" },
  PREPARING: { th: "กำลังเตรียม", badge: "preparing" },
  READY: { th: "พร้อมจัดส่ง", badge: "ready" },
  DELIVERING: { th: "กำลังจัดส่ง", badge: "delivering" },
  DELIVERED: { th: "จัดส่งแล้ว", badge: "delivered" },
  COMPLETED: { th: "เสร็จสิ้น", badge: "completed" },
  CANCELLED: { th: "ยกเลิก", badge: "cancelled" },
} as const;

export const paymentTypeConfig = { CASH: "เงินสด", CREDIT: "เครดิต" } as const;
export const priceSourceConfig = { CUSTOMER_OVERRIDE: "ราคาพิเศษลูกค้า", PRICE_LIST: "รายการราคา", PRODUCT_DEFAULT: "ราคามาตรฐานสินค้า" } as const;
export const salesOrderSortFields = ["orderNo", "orderDate", "requestedDeliveryDate", "customer", "totalAmount", "status", "updatedAt"] as const;
export type SalesOrderStatusValue = keyof typeof salesOrderStatusConfig;
export type SalesOrderSortField = (typeof salesOrderSortFields)[number];
