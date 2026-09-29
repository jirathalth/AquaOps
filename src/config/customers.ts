export const customerTypeConfig = {
  RETAIL: { th: "ลูกค้าปลีก", en: "Retail" },
  WHOLESALE: { th: "ลูกค้าส่ง", en: "Wholesale" },
} as const;

export const customerStatusConfig = {
  ACTIVE: { th: "ใช้งาน", en: "Active" },
  INACTIVE: { th: "ไม่ใช้งาน", en: "Inactive" },
} as const;

export const addressTypeConfig = {
  BILLING: { th: "ที่อยู่วางบิล", en: "Billing address" },
  SHIPPING: { th: "ที่อยู่จัดส่ง", en: "Shipping address" },
} as const;

export const saleTypeConfig = {
  CASH: { th: "เงินสด / ไม่มีเครดิต", en: "Cash / no credit" },
  CREDIT: { th: "ลูกค้าเครดิต", en: "Credit customer" },
} as const;

export const billingCycleConfig = {
  NONE: { th: "ไม่กำหนด", en: "None" },
  DAY_15: { th: "ทุกวันที่ 15", en: "Every 15th" },
  END_OF_MONTH: { th: "สิ้นเดือน", en: "End of month" },
  DAY_15_AND_END_OF_MONTH: { th: "วันที่ 15 และสิ้นเดือน", en: "15th and end of month" },
  CUSTOM: { th: "กำหนดเอง", en: "Custom" },
} as const;

export const customerSortFields = ["code", "displayName", "type", "creditLimit", "createdAt", "updatedAt"] as const;

export type CustomerTypeValue = keyof typeof customerTypeConfig;
export type CustomerStatusValue = keyof typeof customerStatusConfig;
export type AddressTypeValue = keyof typeof addressTypeConfig;
export type SaleTypeValue = keyof typeof saleTypeConfig;
export type BillingCycleValue = keyof typeof billingCycleConfig;
export type CustomerSortField = (typeof customerSortFields)[number];
