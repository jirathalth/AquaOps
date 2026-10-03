import Link from "next/link";
import { Printer } from "lucide-react";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/shared/detail-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { billingStatusConfig } from "@/config/accounting";
import { AccountingActions } from "@/features/accounting/components/accounting-actions";
import { formatCurrencyDecimal, formatDate } from "@/lib/formatters";
import { getBillingNote } from "@/services/accounting.service";
import { requireRouteAccess } from "@/services/auth.service";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [access, billing] = await Promise.all([requireRouteAccess(`/accounting/billing/${id}`), getBillingNote(id)]);
  if (!billing) notFound();
  const canManage = access.permissions.includes("billing.manage");
  return <div className="page-stack">
    <DetailHeader title={billing.customer.displayName} identifier={billing.billingNo} description={`ยอดค้างชำระ ${formatCurrencyDecimal(billing.outstandingAmount)}`} section={{ label: "ใบวางบิล", href: "/accounting/billing" }} status={<StatusBadge status={billingStatusConfig[billing.status].badge} />} actions={<>
      <Button size="sm" variant="outline" asChild><Link href={`/accounting/billing/${id}/print`}><Printer aria-hidden="true" />พิมพ์เอกสาร</Link></Button>
      <AccountingActions id={id} kind="billing" canIssue={canManage && billing.status === "DRAFT"} canCancel={canManage && !["PAID", "CANCELLED"].includes(billing.status)} issueLabel="ออกใบวางบิล" cancelLabel="ยกเลิกใบวางบิล" />
      {canManage && ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(billing.status) && <Button size="sm" asChild><Link href={`/accounting/payments/new?billingNoteId=${billing.id}&customerId=${billing.customerId}`}>รับชำระเงิน</Link></Button>}
    </>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card><CardHeader><CardTitle>วันที่วางบิล</CardTitle></CardHeader><CardContent className="font-medium tabular-nums">{formatDate(billing.billingDate)}</CardContent></Card>
      <Card><CardHeader><CardTitle>วันครบกำหนด</CardTitle></CardHeader><CardContent className="font-medium tabular-nums">{formatDate(billing.dueDate)}</CardContent></Card>
      <Card><CardHeader><CardTitle>ยอดวางบิล</CardTitle></CardHeader><CardContent className="text-lg font-semibold tabular-nums">{formatCurrencyDecimal(billing.totalAmount)}</CardContent></Card>
      <Card><CardHeader><CardTitle>ยอดค้างชำระปัจจุบัน</CardTitle></CardHeader><CardContent className="text-lg font-semibold tabular-nums">{formatCurrencyDecimal(billing.outstandingAmount)}</CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>ใบแจ้งหนี้ในใบวางบิล</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ใบแจ้งหนี้</TableHead><TableHead>วันที่</TableHead><TableHead>ครบกำหนด</TableHead><TableHead className="text-right">ยอดเดิม</TableHead><TableHead className="text-right">ยอดที่วางบิล</TableHead><TableHead className="text-right">ยอดค้างปัจจุบัน</TableHead></TableRow></TableHeader><TableBody>{billing.invoices.map((link) => <TableRow key={link.id}><TableCell><Link className="font-medium text-primary hover:underline tabular-nums" href={`/accounting/invoices/${link.invoice.id}`}>{link.invoice.invoiceNo}</Link></TableCell><TableCell className="tabular-nums">{formatDate(link.invoice.invoiceDate)}</TableCell><TableCell className="tabular-nums">{formatDate(link.invoice.dueDate)}</TableCell><TableCell className="text-right tabular-nums">{formatCurrencyDecimal(link.invoice.totalAmount)}</TableCell><TableCell className="text-right tabular-nums">{formatCurrencyDecimal(link.amount)}</TableCell><TableCell className="text-right font-semibold tabular-nums">{formatCurrencyDecimal(link.invoice.outstandingAmount)}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    <Card><CardHeader><CardTitle>การรับชำระที่อ้างอิงใบวางบิล</CardTitle></CardHeader><CardContent>{billing.paymentAllocations.length ? <div className="space-y-3">{billing.paymentAllocations.map((allocation) => <div key={allocation.id} className="flex justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"><div><Link className="font-medium text-primary hover:underline tabular-nums" href={`/accounting/payments/${allocation.payment.id}`}>{allocation.payment.paymentNo}</Link><p className="type-caption">{formatDate(allocation.payment.paymentDate)}</p></div><span className="font-semibold tabular-nums">{formatCurrencyDecimal(allocation.amount)}</span></div>)}</div> : <p className="text-sm text-muted-foreground">ยังไม่มีการรับชำระ</p>}</CardContent></Card>
  </div>;
}
