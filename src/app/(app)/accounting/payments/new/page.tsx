import { PageHeader } from "@/components/shared/page-header";
import { PaymentCreateForm } from "@/features/accounting/components/payment-create-form";
import type { AccountingCustomerOption } from "@/features/accounting/types";
import { getAccountingCustomers, getOutstandingInvoices, todayInBangkok } from "@/services/accounting.service";
import { requirePermission } from "@/services/auth.service";
import { getFinanceSettings } from "@/services/settings.service";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { await requirePermission("payment.create"); await requirePermission("payment.allocate"); const query = await searchParams; const [customers, settings] = await Promise.all([getAccountingCustomers(), getFinanceSettings()]); const options: AccountingCustomerOption[] = await Promise.all(customers.map(async (customer) => ({ ...customer, invoices: await getOutstandingInvoices(customer.id) }))); return <div className="page-stack"><PageHeader title="บันทึกการรับชำระเงิน" description="เลือกยอดจัดสรรต่อใบแจ้งหนี้ ยอดที่เหลือจะคงเป็นยอดยังไม่จัดสรร" breadcrumbs={[{ label: "บัญชี" }, { label: "การรับชำระเงิน", href: "/accounting/payments" }]} /><PaymentCreateForm customers={options} today={todayInBangkok()} initialCustomerId={typeof query.customerId === "string" ? query.customerId : ""} billingNoteId={typeof query.billingNoteId === "string" ? query.billingNoteId : undefined} defaultMethod={settings.defaultPaymentMethod} /></div>; }
