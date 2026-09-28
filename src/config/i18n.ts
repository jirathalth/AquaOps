import { DEFAULT_LOCALE, FALLBACK_LOCALE } from "@/constants/app";

export const messages = {
  th: { dashboard: "แดชบอร์ด", sales: "ฝ่ายขาย", orders: "คำสั่งขาย", customers: "ลูกค้า", delivery: "การจัดส่ง", deliveryTrips: "เที่ยวจัดส่ง", accounting: "บัญชี", invoices: "ใบแจ้งหนี้", billing: "วางบิล", payments: "รับชำระเงิน", receivables: "ลูกหนี้การค้า", inventory: "สินค้าคงคลัง", products: "สินค้า", stock: "สต็อก", stockMovements: "ความเคลื่อนไหวสต็อก", reports: "รายงาน", administration: "ผู้ดูแลระบบ", users: "ผู้ใช้งาน", roles: "บทบาท", auditLogs: "บันทึกการใช้งาน", settings: "ตั้งค่า", futureModules: "โมดูลในอนาคต", production: "การผลิต", purchasing: "จัดซื้อ", suppliers: "ผู้จำหน่าย", search: "ค้นหา", comingSoon: "เร็ว ๆ นี้" },
  en: { dashboard: "Dashboard", sales: "Sales", orders: "Orders", customers: "Customers", delivery: "Delivery", deliveryTrips: "Delivery Trips", accounting: "Accounting", invoices: "Invoices", billing: "Billing", payments: "Payments", receivables: "Accounts Receivable", inventory: "Inventory", products: "Products", stock: "Stock", stockMovements: "Stock Movement", reports: "Reports", administration: "Administration", users: "Users", roles: "Roles", auditLogs: "Audit Logs", settings: "Settings", futureModules: "Future Modules", production: "Production", purchasing: "Purchasing", suppliers: "Suppliers", search: "Search", comingSoon: "Coming soon" },
} as const;

export type Locale = keyof typeof messages;
export type MessageKey = keyof (typeof messages)[typeof DEFAULT_LOCALE];
export function t(key: MessageKey, locale: Locale = DEFAULT_LOCALE) { return messages[locale]?.[key] ?? messages[FALLBACK_LOCALE][key]; }
