export const productSortFields = ["sku", "name", "createdAt", "updatedAt"] as const;
export const priceListSortFields = ["code", "name", "status", "createdAt", "updatedAt"] as const;

export const priceListStatusConfig = {
  DRAFT: { th: "ฉบับร่าง", status: "draft" as const },
  ACTIVE: { th: "ใช้งาน", status: "active" as const },
  INACTIVE: { th: "ไม่ใช้งาน", status: "inactive" as const },
};

export const priceSourceConfig = {
  CUSTOMER_OVERRIDE: "ราคาพิเศษลูกค้า",
  PRICE_LIST: "รายการราคาลูกค้า",
  PRODUCT_DEFAULT: "ราคามาตรฐานสินค้า",
} as const;
