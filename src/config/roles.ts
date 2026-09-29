import { permissionCodes, type PermissionCode } from "@/config/permissions";

export const systemRoles = {
  OWNER: { name: "เจ้าของกิจการ", description: "สิทธิ์ทั้งหมดและดูแลความปลอดภัยของระบบ" },
  ADMIN: { name: "ผู้ดูแลระบบ", description: "จัดการระบบ ผู้ใช้ และงานปฏิบัติการ" },
  SALES: { name: "ฝ่ายขาย", description: "ลูกค้า ราคา คำสั่งขาย และข้อมูลจัดส่ง" },
  ACCOUNTING: { name: "ฝ่ายบัญชี", description: "ใบแจ้งหนี้ วางบิล ชำระเงิน และลูกหนี้" },
  WAREHOUSE: { name: "ฝ่ายคลังสินค้า", description: "สินค้า สต็อก การเตรียมและโหลดสินค้า" },
  DELIVERY: { name: "ฝ่ายจัดส่ง", description: "ข้อมูลและสถานะการจัดส่ง" },
  PRODUCTION: { name: "ฝ่ายผลิต", description: "ข้อมูลสต็อกและการผลิตในอนาคต" },
  VIEWER: { name: "ผู้ดูข้อมูล", description: "ดูข้อมูลสำคัญแบบอ่านอย่างเดียว" },
} as const;

export type SystemRoleCode = keyof typeof systemRoles;

export const defaultRolePermissions: Record<SystemRoleCode, readonly PermissionCode[]> = {
  OWNER: permissionCodes,
  ADMIN: permissionCodes,
  SALES: ["dashboard.view", "customer.view", "customer.create", "customer.update", "product.view", "price_list.view", "price_list.manage", "sales_order.view", "sales_order.create", "sales_order.update", "sales_order.confirm", "sales_order.cancel", "delivery.view", "invoice.view", "ar.view", "report.view"],
  ACCOUNTING: ["dashboard.view", "customer.view", "sales_order.view", "invoice.view", "invoice.create", "invoice.issue", "invoice.cancel", "billing.view", "billing.manage", "payment.view", "payment.create", "payment.allocate", "ar.view", "report.view"],
  WAREHOUSE: ["dashboard.view", "product.view", "product.create", "product.update", "inventory.view", "inventory.adjust", "inventory.transfer", "sales_order.view", "delivery.view"],
  DELIVERY: ["dashboard.view", "sales_order.view", "delivery.view", "delivery.manage"],
  PRODUCTION: ["dashboard.view", "product.view", "inventory.view", "production.view", "production.manage"],
  VIEWER: ["dashboard.view", "customer.view", "product.view", "price_list.view", "sales_order.view", "delivery.view", "inventory.view", "invoice.view", "billing.view", "payment.view", "ar.view", "report.view"],
};
