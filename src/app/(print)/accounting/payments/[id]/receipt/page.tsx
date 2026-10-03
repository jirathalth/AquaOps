import { notFound } from "next/navigation";
import { paymentMethodConfig } from "@/config/accounting";
import { formatAddress } from "@/features/printable-documents/printable-document-core";
import { PrintableDocument } from "@/features/printable-documents/components/printable-document";
import { formatCurrencyDecimal, formatDate } from "@/lib/formatters";
import { thaiBahtText } from "@/lib/thai-baht-text";
import { getPayment } from "@/services/accounting.service";
import { requireRouteAccess } from "@/services/auth.service";
import { getPrintableDocumentContext } from "@/services/printable-document.service";

export default async function ReceiptPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [, payment, context] = await Promise.all([requireRouteAccess(`/accounting/payments/${id}/receipt`), getPayment(id), getPrintableDocumentContext()]);
  if (!payment || payment.status !== "COMPLETED") notFound();
  const snapshot = payment.allocations[0]?.invoice;
  const rows = payment.allocations.length ? payment.allocations.map((allocation, index) => ({ key: allocation.id, cells: { line: index + 1, invoiceNo: allocation.invoice.invoiceNo, billingNo: allocation.billingNote?.billingNo ?? "-", invoiceDate: formatDate(allocation.invoice.invoiceDate), amount: formatCurrencyDecimal(allocation.amount) } })) : [{ key: "unallocated", cells: { line: 1, invoiceNo: "ไม่ระบุใบแจ้งหนี้", billingNo: "-", invoiceDate: "-", amount: formatCurrencyDecimal(payment.amount) } }];
  return <PrintableDocument backHref={`/accounting/payments/${id}`} business={context.business} customer={{ name: snapshot?.customerNameSnapshot ?? payment.customer.displayName, code: snapshot?.customerCodeSnapshot ?? payment.customer.code, address: formatAddress(snapshot?.billingAddress), taxId: snapshot?.taxIdSnapshot, branch: snapshot?.taxBranchCodeSnapshot }} title="ใบเสร็จรับเงิน" subtitle="RECEIPT" documentNumber={payment.paymentNo} metadata={[{ label: "วันที่รับชำระ", value: formatDate(payment.paymentDate) }, { label: "วิธีการชำระ", value: paymentMethodConfig[payment.method] }, { label: "เลขที่อ้างอิง", value: payment.externalReference }]} columns={[{ key: "line", label: "ลำดับ", align: "center", width: "8%" }, { key: "invoiceNo", label: "เลขที่ใบแจ้งหนี้", width: "30%" }, { key: "billingNo", label: "เลขที่ใบวางบิล", width: "25%" }, { key: "invoiceDate", label: "วันที่ใบแจ้งหนี้", width: "19%" }, { key: "amount", label: "ยอดรับชำระ", align: "right", width: "18%" }]} rows={rows} totals={[{ label: "จำนวนเงินที่รับ", amount: formatCurrencyDecimal(payment.amount), strong: true }]} amountWords={thaiBahtText(payment.amount)} footer={context.footer} signatures={[{ label: "ผู้รับเงิน", showName: true, dateLabel: "วันที่" }, { label: "ผู้มีอำนาจลงนาม", showName: true, dateLabel: "วันที่" }]} signaturePlacement="summary" tableCaption={`รายการรับชำระในใบเสร็จรับเงิน ${payment.paymentNo}`} />;
}
