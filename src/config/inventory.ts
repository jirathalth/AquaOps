import type { BusinessStatus } from "@/types/status";

export const stockSortFields = ["sku", "name", "warehouse", "quantity", "updatedAt"] as const;
export const movementSortFields = ["occurredAt", "movementNo", "product", "warehouse", "quantity"] as const;
export const warehouseSortFields = ["code", "name", "status", "updatedAt"] as const;

export const stockStatusConfig = {
  IN_STOCK: { th: "มีสินค้า", badge: "completed" as BusinessStatus },
  LOW_STOCK: { th: "สต็อกต่ำ", badge: "pending" as BusinessStatus },
  OUT_OF_STOCK: { th: "สินค้าหมด", badge: "cancelled" as BusinessStatus },
} as const;

export const inventoryMovementTypeConfig = {
  OPENING: "ยอดยกมา",
  RECEIPT: "รับเข้า",
  ISSUE: "เบิกออก",
  TRANSFER: "โอนย้าย",
  ADJUSTMENT: "ปรับปรุง",
  SALE: "ขาย",
  DELIVERY: "จัดส่ง",
  RETURN: "รับคืน",
} as const;

export const adjustmentReasonConfig = {
  PHYSICAL_COUNT: "ปรับตามยอดตรวจนับจริง",
  DATA_CORRECTION: "แก้ไขข้อมูล",
  FOUND_STOCK: "พบสินค้าเพิ่ม",
  MISSING_STOCK: "สินค้าสูญหาย",
  OTHER: "อื่น ๆ",
} as const;
