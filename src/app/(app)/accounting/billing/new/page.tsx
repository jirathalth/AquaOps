import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { BillingCreateForm } from "@/features/accounting/components/billing-create-form";
import type { AccountingCustomerOption } from "@/features/accounting/types";
import { getAccountingCustomers, getOutstandingInvoices, todayInBangkok } from "@/services/accounting.service";
import { requirePermission } from "@/services/auth.service";

export default async function Page() { await requirePermission("billing.manage"); const customers = await getAccountingCustomers(); const options: AccountingCustomerOption[] = await Promise.all(customers.map(async (customer) => ({ ...customer, invoices: await getOutstandingInvoices(customer.id) }))); return <div className="page-stack"><PageHeader title="สร้างใบวางบิล" description="เลือกใบแจ้งหนี้ที่ยังมียอดค้างชำระและยังไม่อยู่ในใบวางบิลที่ใช้งานอยู่" breadcrumbs={[{ label: "บัญชี" }, { label: "ใบวางบิล", href: "/accounting/billing" }]} />{options.some((customer) => customer.invoices.some((invoice) => !invoice.activeBilling)) ? <BillingCreateForm customers={options} today={todayInBangkok()} /> : <EmptyState title="ไม่มีใบแจ้งหนี้ที่พร้อมวางบิล" description="ใบแจ้งหนี้ต้องออกแล้ว มียอดค้างชำระ และไม่อยู่ในใบวางบิลที่ใช้งานอยู่" />}</div>; }
