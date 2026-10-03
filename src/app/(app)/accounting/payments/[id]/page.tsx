import Link from "next/link";
import { Printer } from "lucide-react";
import { notFound } from "next/navigation";
import { DetailHeader } from "@/components/shared/detail-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paymentMethodConfig, paymentStatusConfig } from "@/config/accounting";
import { AccountingActions } from "@/features/accounting/components/accounting-actions";
import { formatCurrencyDecimal, formatDate } from "@/lib/formatters";
import { getPayment } from "@/services/accounting.service";
import { requireRouteAccess } from "@/services/auth.service";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [access, payment] = await Promise.all([requireRouteAccess(`/accounting/payments/${id}`), getPayment(id)]);
  if (!payment) notFound();
  return <div className="page-stack">
    <DetailHeader title={payment.customer.displayName} identifier={payment.paymentNo} description={`ยอดรับชำระ ${formatCurrencyDecimal(payment.amount)}`} section={{ label: "การรับชำระเงิน", href: "/accounting/payments" }} status={<StatusBadge status={paymentStatusConfig[payment.status].badge} />} actions={<>
      {payment.status === "COMPLETED" && <Button size="sm" variant="outline" asChild><Link href={`/accounting/payments/${id}/receipt`}><Printer aria-hidden="true" />พิมพ์ใบเสร็จ</Link></Button>}
      <AccountingActions id={id} kind="payment" canIssue={false} canCancel={payment.status === "COMPLETED" && access.permissions.includes("payment.cancel")} cancelLabel="ยกเลิกรายการรับชำระ" />
    </>} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card><CardHeader><CardTitle>วันที่รับชำระ</CardTitle></CardHeader><CardContent className="font-medium tabular-nums">{formatDate(payment.paymentDate)}</CardContent></Card>
      <Card><CardHeader><CardTitle>วิธีการชำระเงิน</CardTitle></CardHeader><CardContent className="font-medium">{paymentMethodConfig[payment.method]}</CardContent></Card>
      <Card><CardHeader><CardTitle>จัดสรรแล้ว</CardTitle></CardHeader><CardContent className="text-lg font-semibold tabular-nums">{formatCurrencyDecimal(payment.allocatedAmount)}</CardContent></Card>
      <Card><CardHeader><CardTitle>ยังไม่จัดสรร</CardTitle></CardHeader><CardContent className="text-lg font-semibold tabular-nums">{formatCurrencyDecimal(payment.unappliedAmount)}</CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>ข้อมูลการรับชำระ</CardTitle></CardHeader><CardContent><dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-muted-foreground">รหัสลูกค้า</dt><dd className="font-medium tabular-nums">{payment.customer.code}</dd></div><div><dt className="text-muted-foreground">เลขอ้างอิง</dt><dd className="font-medium tabular-nums">{payment.externalReference ?? "—"}</dd></div><div><dt className="text-muted-foreground">บัญชีรับเงิน</dt><dd className="font-medium">{payment.receivedAccount ?? "—"}</dd></div><div><dt className="text-muted-foreground">ผู้บันทึก</dt><dd className="font-medium">{payment.recordedBy?.name ?? "—"}</dd></div>{payment.voidReason && <div className="sm:col-span-2 lg:col-span-4"><dt className="text-muted-foreground">เหตุผลการยกเลิก</dt><dd className="font-medium text-danger">{payment.voidReason}</dd></div>}</dl></CardContent></Card>
    <Card><CardHeader><CardTitle>การจัดสรรยอดชำระ</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>ใบแจ้งหนี้</TableHead><TableHead>วันครบกำหนด</TableHead><TableHead>ใบวางบิล</TableHead><TableHead className="text-right">ยอดใบแจ้งหนี้</TableHead><TableHead className="text-right">ยอดจัดสรร</TableHead></TableRow></TableHeader><TableBody>{payment.allocations.map((allocation) => <TableRow key={allocation.id}><TableCell><Link className="font-medium text-primary hover:underline tabular-nums" href={`/accounting/invoices/${allocation.invoice.id}`}>{allocation.invoice.invoiceNo}</Link></TableCell><TableCell className="tabular-nums">{formatDate(allocation.invoice.dueDate)}</TableCell><TableCell>{allocation.billingNote ? <Link className="text-primary hover:underline tabular-nums" href={`/accounting/billing/${allocation.billingNote.id}`}>{allocation.billingNote.billingNo}</Link> : "—"}</TableCell><TableCell className="text-right tabular-nums">{formatCurrencyDecimal(allocation.invoice.totalAmount)}</TableCell><TableCell className="text-right font-semibold tabular-nums">{formatCurrencyDecimal(allocation.amount)}</TableCell></TableRow>)}{!payment.allocations.length && <TableRow><TableCell colSpan={5} className="p-6 text-center text-muted-foreground">เงินรับชำระรายการนี้ยังไม่ได้จัดสรร</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card>
  </div>;
}
