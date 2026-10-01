"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { billingStatusConfig, invoiceStatusConfig, paymentMethodConfig, paymentStatusConfig } from "@/config/accounting";
import type { BillingListRow, InvoiceListRow, PaymentListRow } from "@/features/accounting/types";
import { formatCurrencyDecimal, formatDate } from "@/lib/formatters";

const money = (value: string, strong = false) => <span className={`whitespace-nowrap tabular-nums ${strong ? "font-semibold" : ""}`}>{formatCurrencyDecimal(value)}</span>;
const invoiceColumns: ColumnDef<InvoiceListRow>[] = [
  { accessorKey: "invoiceNo", header: "เลขที่ใบแจ้งหนี้", cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.invoiceNo}</span> },
  { accessorKey: "invoiceDate", header: "วันที่", cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.original.invoiceDate)}</span> },
  { accessorKey: "customerName", header: "ลูกค้า", cell: ({ row }) => <div><p className="font-medium">{row.original.customerName}</p><p className="type-caption tabular-nums">{row.original.customerCode}</p></div> },
  { accessorKey: "dueDate", header: "วันครบกำหนด", cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.original.dueDate)}</span> },
  { accessorKey: "totalAmount", header: "ยอดรวม", meta: { align: "right" }, cell: ({ row }) => money(row.original.totalAmount) },
  { accessorKey: "paidAmount", header: "ชำระแล้ว", meta: { align: "right" }, cell: ({ row }) => money(row.original.paidAmount) },
  { accessorKey: "outstandingAmount", header: "ยอดค้างชำระ", meta: { align: "right" }, cell: ({ row }) => money(row.original.outstandingAmount, true) },
  { accessorKey: "status", header: "สถานะ", cell: ({ row }) => <StatusBadge status={invoiceStatusConfig[row.original.status].badge} /> },
];
const billingColumns: ColumnDef<BillingListRow>[] = [
  { accessorKey: "billingNo", header: "เลขที่ใบวางบิล", cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.billingNo}</span> },
  { accessorKey: "billingDate", header: "วันที่", cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.original.billingDate)}</span> },
  { accessorKey: "customerName", header: "ลูกค้า", cell: ({ row }) => <div><p className="font-medium">{row.original.customerName}</p><p className="type-caption tabular-nums">{row.original.customerCode}</p></div> },
  { accessorKey: "invoiceCount", header: "ใบแจ้งหนี้", meta: { align: "right" } },
  { accessorKey: "totalAmount", header: "ยอดวางบิล", meta: { align: "right" }, cell: ({ row }) => money(row.original.totalAmount) },
  { accessorKey: "outstandingAmount", header: "ยอดค้างชำระ", meta: { align: "right" }, cell: ({ row }) => money(row.original.outstandingAmount, true) },
  { accessorKey: "status", header: "สถานะ", cell: ({ row }) => <StatusBadge status={billingStatusConfig[row.original.status].badge} /> },
];
const paymentColumns: ColumnDef<PaymentListRow>[] = [
  { accessorKey: "paymentNo", header: "เลขที่รับชำระ", cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.paymentNo}</span> },
  { accessorKey: "paymentDate", header: "วันที่", cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.original.paymentDate)}</span> },
  { accessorKey: "customerName", header: "ลูกค้า", cell: ({ row }) => <div><p className="font-medium">{row.original.customerName}</p><p className="type-caption tabular-nums">{row.original.customerCode}</p></div> },
  { accessorKey: "method", header: "วิธีชำระ", cell: ({ row }) => paymentMethodConfig[row.original.method] },
  { accessorKey: "amount", header: "ยอดรับชำระ", meta: { align: "right" }, cell: ({ row }) => money(row.original.amount, true) },
  { accessorKey: "allocatedAmount", header: "จัดสรรแล้ว", meta: { align: "right" }, cell: ({ row }) => money(row.original.allocatedAmount) },
  { accessorKey: "unappliedAmount", header: "ยังไม่จัดสรร", meta: { align: "right" }, cell: ({ row }) => money(row.original.unappliedAmount) },
  { accessorKey: "status", header: "สถานะ", cell: ({ row }) => <StatusBadge status={paymentStatusConfig[row.original.status].badge} /> },
];

export function InvoiceTable({ rows, total, page, pageSize, q, status }: { rows: InvoiceListRow[]; total: number; page: number; pageSize: number; q: string; status: string }) { const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams(); const [search, setSearch] = useState(q); function navigate(changes: Record<string, string | number | undefined>) { const params = new URLSearchParams(searchParams.toString()); for (const [key, value] of Object.entries(changes)) if (value === undefined || value === "" || value === "ALL") params.delete(key); else params.set(key, String(value)); router.replace(`${pathname}${params.size ? `?${params}` : ""}`); } useEffect(() => { if (search === q) return; const timeout = window.setTimeout(() => navigate({ q: search, page: 1 }), 350); return () => window.clearTimeout(timeout); }, [search, q]); // eslint-disable-line react-hooks/exhaustive-deps
  const filters = <Select value={status} onValueChange={(value) => navigate({ status: value, page: 1 })}><SelectTrigger className="w-full md:w-44" aria-label="สถานะใบแจ้งหนี้"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">ทุกสถานะ</SelectItem>{Object.entries(invoiceStatusConfig).map(([value, item]) => <SelectItem key={value} value={value}>{item.label}</SelectItem>)}</SelectContent></Select>; return <DataTable columns={invoiceColumns} data={rows} searchValue={search} onSearchChange={setSearch} searchPlaceholder="ค้นหาเลขที่ใบแจ้งหนี้ คำสั่งซื้อ หรือลูกค้า" filters={filters} activeFilterCount={status === "ALL" ? 0 : 1} onResetFilters={() => { setSearch(""); router.replace(pathname); }} manualPagination manualFiltering pageCount={Math.ceil(total / pageSize)} totalRows={total} pagination={{ pageIndex: page - 1, pageSize }} onPaginationChange={(next) => navigate({ page: next.pageIndex + 1, pageSize: next.pageSize })} getRowId={(row) => row.id} onRowClick={(row) => router.push(`/accounting/invoices/${row.original.id}`)} emptyTitle={q || status !== "ALL" ? "ไม่พบใบแจ้งหนี้ที่ตรงกับตัวกรอง" : "ยังไม่มีใบแจ้งหนี้"} emptyDescription={q || status !== "ALL" ? "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง" : "สร้างใบแจ้งหนี้จากคำสั่งซื้อที่จัดส่งสำเร็จแล้ว"} />; }
export function BillingTable({ rows }: { rows: BillingListRow[] }) { const router = useRouter(); return <DataTable columns={billingColumns} data={rows} searchPlaceholder="ค้นหาเลขที่ใบวางบิลหรือลูกค้า" getRowId={(row) => row.id} onRowClick={(row) => router.push(`/accounting/billing/${row.original.id}`)} emptyTitle="ยังไม่มีใบวางบิล" emptyDescription="เลือกใบแจ้งหนี้ค้างชำระของลูกค้ารายเดียวกันเพื่อเริ่มวางบิล" />; }
export function PaymentTable({ rows }: { rows: PaymentListRow[] }) { const router = useRouter(); return <DataTable columns={paymentColumns} data={rows} searchPlaceholder="ค้นหาเลขที่รับชำระหรือลูกค้า" getRowId={(row) => row.id} onRowClick={(row) => router.push(`/accounting/payments/${row.original.id}`)} emptyTitle="ยังไม่มีรายการรับชำระ" emptyDescription="บันทึกเงินที่ได้รับและจัดสรรให้ใบแจ้งหนี้" />; }
