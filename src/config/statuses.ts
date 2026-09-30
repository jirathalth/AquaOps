import type { BusinessStatus } from "@/types/status";

export const statusConfig: Record<BusinessStatus, { th: string; en: string; className: string }> = {
  draft: { th: "ฉบับร่าง", en: "Draft", className: "border-muted-foreground/25 bg-muted text-muted-foreground" },
  pending: { th: "รอดำเนินการ", en: "Pending", className: "border-warning/30 bg-warning/12 text-warning-foreground dark:text-warning" },
  confirmed: { th: "ยืนยันแล้ว", en: "Confirmed", className: "border-info/30 bg-info/12 text-info" },
  preparing: { th: "กำลังเตรียม", en: "Preparing", className: "border-info/30 bg-info/12 text-info" },
  ready: { th: "พร้อม", en: "Ready", className: "border-primary/30 bg-primary/12 text-primary" },
  delivering: { th: "กำลังจัดส่ง", en: "Delivering", className: "border-primary/30 bg-primary/12 text-primary" },
  delivered: { th: "จัดส่งแล้ว", en: "Delivered", className: "border-success/30 bg-success/12 text-success" },
  failed: { th: "จัดส่งไม่สำเร็จ", en: "Failed", className: "border-danger/30 bg-danger/12 text-danger" },
  completed: { th: "เสร็จสิ้น", en: "Completed", className: "border-success/30 bg-success/12 text-success" },
  paid: { th: "ชำระแล้ว", en: "Paid", className: "border-success/30 bg-success/12 text-success" },
  partiallyPaid: { th: "ชำระบางส่วน", en: "Partially Paid", className: "border-warning/30 bg-warning/12 text-warning-foreground dark:text-warning" },
  overdue: { th: "เกินกำหนด", en: "Overdue", className: "border-danger/30 bg-danger/12 text-danger" },
  cancelled: { th: "ยกเลิก", en: "Cancelled", className: "border-danger/30 bg-danger/12 text-danger" },
  active: { th: "ใช้งาน", en: "Active", className: "border-info/30 bg-info/12 text-info" },
  inactive: { th: "ไม่ใช้งาน", en: "Inactive", className: "border-muted-foreground/25 bg-muted text-muted-foreground" },
};
