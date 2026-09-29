"use client";

import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customerTypeConfig, saleTypeConfig } from "@/config/customers";
import type { CustomerRow, PriceListOption } from "@/features/customers/types";
import { formatCurrencyDecimal } from "@/lib/formatters";
import type { CustomerListQuery } from "@/validations/customer";

type Props = { rows: CustomerRow[]; total: number; pageCount: number; query: CustomerListQuery; priceLists: PriceListOption[]; canCreate: boolean };

export function CustomerTable({ rows, total, pageCount, query, priceLists, canCreate }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(query.q);
  function navigate(changes: Record<string, string | number | undefined>) { const params = new URLSearchParams(searchParams.toString()); for (const [key, value] of Object.entries(changes)) if (value === undefined || value === "" || value === "ALL") params.delete(key); else params.set(key, String(value)); router.replace(`${pathname}${params.size ? `?${params}` : ""}`); }
  useEffect(() => { if (search === query.q) return; const timeout = window.setTimeout(() => navigate({ q: search, page: 1 }), 350); return () => window.clearTimeout(timeout); }, [search, query.q]); // eslint-disable-line react-hooks/exhaustive-deps
  const columns = useMemo<ColumnDef<CustomerRow>[]>(() => [
    { accessorKey: "code", header: ({ column }) => <DataTableColumnHeader column={column} title="รหัสลูกค้า" />, cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.code}</span> },
    { accessorKey: "displayName", header: ({ column }) => <DataTableColumnHeader column={column} title="ชื่อลูกค้า" />, cell: ({ row }) => <div className="min-w-44 max-w-72"><p className="truncate font-medium">{row.original.displayName}</p>{row.original.legalName !== row.original.displayName && <p className="truncate text-xs text-muted-foreground">{row.original.legalName}</p>}</div> },
    { accessorKey: "type", header: ({ column }) => <DataTableColumnHeader column={column} title="ประเภท" />, cell: ({ row }) => <Badge variant="secondary">{customerTypeConfig[row.original.type].th}</Badge> },
    { id: "contact", header: "ผู้ติดต่อ", enableSorting: false, cell: ({ row }) => <div className="min-w-32"><p>{row.original.contactName || "—"}</p><p className="text-xs tabular-nums text-muted-foreground">{row.original.phone || "—"}</p></div> },
    { id: "priceList", header: "ราคาขาย", enableSorting: false, cell: ({ row }) => row.original.defaultPriceList?.name ?? "—" },
    { accessorKey: "creditTermDays", header: "เครดิต", enableSorting: false, meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums">{row.original.defaultSaleType === "CREDIT" ? `${row.original.creditTermDays} วัน` : saleTypeConfig.CASH.th}</span> },
    { accessorKey: "creditLimit", header: ({ column }) => <DataTableColumnHeader column={column} title="วงเงิน" />, meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums">{formatCurrencyDecimal(row.original.creditLimit)}</span> },
    { accessorKey: "status", header: "สถานะ", enableSorting: false, cell: ({ row }) => <StatusBadge status={row.original.status === "ACTIVE" ? "active" : "inactive"} /> },
  ], []);
  const activeFilterCount = [query.type, query.status, query.priceListId, query.credit].filter((value) => value !== "ALL").length;
  const sorting: SortingState = [{ id: query.sort, desc: query.order === "desc" }];
  const pagination: PaginationState = { pageIndex: query.page - 1, pageSize: query.pageSize };
  const filters = <><Select value={query.type} onValueChange={(value) => navigate({ type: value, page: 1 })}><SelectTrigger className="w-full sm:w-36" aria-label="ประเภทลูกค้า"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">ทุกประเภท</SelectItem><SelectItem value="RETAIL">ลูกค้าปลีก</SelectItem><SelectItem value="WHOLESALE">ลูกค้าส่ง</SelectItem></SelectContent></Select><Select value={query.status} onValueChange={(value) => navigate({ status: value, page: 1 })}><SelectTrigger className="w-full sm:w-32" aria-label="สถานะ"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">ทุกสถานะ</SelectItem><SelectItem value="ACTIVE">ใช้งาน</SelectItem><SelectItem value="INACTIVE">ไม่ใช้งาน</SelectItem></SelectContent></Select><Select value={query.priceListId} onValueChange={(value) => navigate({ priceListId: value, page: 1 })}><SelectTrigger className="w-full sm:w-44" aria-label="ราคาขาย"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">ราคาขายทั้งหมด</SelectItem>{priceLists.map((priceList) => <SelectItem key={priceList.id} value={priceList.id}>{priceList.name}</SelectItem>)}</SelectContent></Select><Select value={query.credit} onValueChange={(value) => navigate({ credit: value, page: 1 })}><SelectTrigger className="w-full sm:w-36" aria-label="ประเภทเครดิต"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">เงินสด / เครดิต</SelectItem><SelectItem value="CASH">เงินสด</SelectItem><SelectItem value="CREDIT">เครดิต</SelectItem></SelectContent></Select></>;
  return <DataTable columns={columns} data={rows} searchValue={search} onSearchChange={setSearch} searchPlaceholder="ค้นหารหัส ชื่อ ผู้ติดต่อ โทรศัพท์ หรือเลขภาษี..." filters={filters} activeFilterCount={activeFilterCount} onResetFilters={() => { setSearch(""); router.replace(pathname); }} toolbarActions={canCreate ? <Button size="sm" asChild><Link href="/customers/new"><Plus className="size-4" />เพิ่มลูกค้า</Link></Button> : undefined} emptyTitle={query.q || activeFilterCount ? "ไม่พบลูกค้าที่ตรงกับตัวกรอง" : "ยังไม่มีข้อมูลลูกค้า"} emptyDescription={query.q || activeFilterCount ? "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง" : "เพิ่มลูกค้ารายแรกเพื่อเริ่มจัดการข้อมูลการขาย"} emptyAction={!query.q && !activeFilterCount && canCreate ? <Button asChild><Link href="/customers/new">เพิ่มลูกค้า</Link></Button> : undefined} manualPagination manualSorting manualFiltering pageCount={pageCount} totalRows={total} pagination={pagination} onPaginationChange={(next) => navigate({ page: next.pageIndex + 1, pageSize: next.pageSize })} sorting={sorting} onSortingChange={(next) => { const selected = next[0]; if (selected) navigate({ sort: selected.id, order: selected.desc ? "desc" : "asc", page: 1 }); }} pageSizeOptions={[20, 50, 100]} getRowId={(row) => row.id} onRowClick={(row) => router.push(`/customers/${row.original.id}`)} />;
}
