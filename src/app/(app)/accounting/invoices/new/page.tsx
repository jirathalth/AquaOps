import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { InvoiceCreateForm } from "@/features/accounting/components/invoice-create-form";
import { getEligibleInvoiceOrders, todayInBangkok } from "@/services/accounting.service";
import { requirePermission } from "@/services/auth.service";

export default async function Page() { await requirePermission("invoice.create"); const orders = await getEligibleInvoiceOrders(); return <div className="page-stack"><PageHeader title="สร้างใบแจ้งหนี้" description="ระบบใช้ข้อมูลลูกค้า รายการสินค้า ราคา ส่วนลด และภาษีจาก snapshot ของคำสั่งซื้อ" breadcrumbs={[{ label: "บัญชี" }, { label: "ใบแจ้งหนี้", href: "/accounting/invoices" }]} />{orders.length ? <InvoiceCreateForm orders={orders} today={todayInBangkok()} /> : <EmptyState title="ไม่มีคำสั่งซื้อที่พร้อมออกใบแจ้งหนี้" description="ต้องจัดส่งคำสั่งซื้อสำเร็จ และยังไม่มีใบแจ้งหนี้ที่ใช้งานอยู่" />}</div>; }
