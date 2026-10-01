"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { formatCurrencyDecimal, formatDate, formatDateTime, formatNumber, formatQuantityDecimal } from "@/lib/formatters";
import type { ReportColumn } from "@/features/reports/types";
import type { ReportQuery } from "@/validations/reporting";

type Row = Record<string, string | number | null>;
function valueFor(value: Row[string], format?: ReportColumn["format"]) { if (value == null || value === "") return "—"; const raw = String(value); if (format === "money") return formatCurrencyDecimal(raw); if (format === "quantity") return formatQuantityDecimal(raw); if (format === "date") return formatDate(raw); if (format === "datetime") return formatDateTime(raw); if (typeof value === "number") return formatNumber(value, 0); return raw; }

export function ReportDataTable({ rows, total, pageCount, query, columnSpecs }: { rows: Row[]; total: number; pageCount: number; query: ReportQuery; columnSpecs: ReportColumn[] }) {
  const router = useRouter(); const pathname = usePathname();
  function navigate(values: Record<string, string | number>) { const params = new URLSearchParams(window.location.search); for (const [key, value] of Object.entries(values)) params.set(key, String(value)); router.replace(`${pathname}?${params}`); }
  const columns: ColumnDef<Row>[] = columnSpecs.map((spec) => ({ id: spec.key, accessorKey: spec.key, enableSorting: Boolean(spec.sortKey), header: spec.sortKey ? ({ column }) => <DataTableColumnHeader column={column} title={spec.label} /> : spec.label, cell: ({ row }) => { const content = valueFor(row.original[spec.key], spec.format); const href = spec.hrefKey ? row.original[spec.hrefKey] : spec.linkPrefix ? `${spec.linkPrefix}${row.original.id}` : null; return href ? <Link className="font-medium text-primary hover:underline" href={String(href)}>{content}</Link> : <span className={spec.format === "money" || spec.format === "quantity" ? "tabular-nums" : undefined}>{content}</span>; }, meta: { align: spec.align } }));
  const sorting: SortingState = columnSpecs.some((item) => item.sortKey === query.sort) ? [{ id: columnSpecs.find((item) => item.sortKey === query.sort)!.key, desc: query.order === "desc" }] : [];
  return <DataTable columns={columns} data={rows} searchable={false} manualFiltering manualPagination manualSorting pageCount={pageCount} totalRows={total} pagination={{ pageIndex: query.page - 1, pageSize: query.pageSize }} onPaginationChange={(next: PaginationState) => navigate({ page: next.pageIndex + 1, pageSize: next.pageSize })} sorting={sorting} onSortingChange={(next: SortingState) => { const selected = next[0]; const spec = selected ? columnSpecs.find((item) => item.key === selected.id) : undefined; if (spec?.sortKey) navigate({ sort: spec.sortKey, order: selected!.desc ? "desc" : "asc", page: 1 }); }} pageSizeOptions={[20, 50, 100]} getRowId={(row) => String(row.id)} emptyTitle="ไม่พบข้อมูลตามเงื่อนไข" emptyDescription="ลองเปลี่ยนช่วงเวลาหรือตัวกรอง แล้วแสดงข้อมูลอีกครั้ง" />;
}
