"use client";

import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateRange } from "@/components/shared/date-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deliveryTripStatusConfig } from "@/config/delivery";
import type { DeliveryOptions, DeliveryTripRow } from "@/features/delivery/types";
import { formatDate } from "@/lib/formatters";
import type { DeliveryTripListQuery } from "@/validations/delivery";

export function DeliveryTripTable({ rows, total, pageCount, query, options }: { rows: DeliveryTripRow[]; total: number; pageCount: number; query: DeliveryTripListQuery; options: Pick<DeliveryOptions, "drivers" | "vehicles"> }) {
  const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams(); const [search, setSearch] = useState(query.q);
  function navigate(changes: Record<string, string | number | undefined>) { const params = new URLSearchParams(searchParams.toString()); for (const [key, value] of Object.entries(changes)) if (value === undefined || value === "" || value === "ALL") params.delete(key); else params.set(key, String(value)); router.replace(`${pathname}${params.size ? `?${params}` : ""}`); }
  useEffect(() => { if (search === query.q) return; const timeout = window.setTimeout(() => navigate({ q: search, page: 1 }), 350); return () => window.clearTimeout(timeout); }, [search, query.q]); // eslint-disable-line react-hooks/exhaustive-deps
  const columns = useMemo<ColumnDef<DeliveryTripRow>[]>(() => [
    { accessorKey: "tripNo", header: ({ column }) => <DataTableColumnHeader column={column} title="เลขที่รอบจัดส่ง" />, cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.tripNo}</span> },
    { accessorKey: "plannedDate", header: ({ column }) => <DataTableColumnHeader column={column} title="วันที่จัดส่ง" />, cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.original.plannedDate)}</span> },
    { id: "orders", header: "คำสั่งซื้อ / ลูกค้า", enableSorting: false, cell: ({ row }) => <div className="min-w-48"><p className="font-medium tabular-nums">{row.original.orderNumbers.slice(0, 2).join(", ") || "ยังไม่มีคำสั่งซื้อ"}</p><p className="type-caption">{row.original.customerNames.slice(0, 2).join(", ") || "—"}{row.original.orderCount > 2 ? ` และอีก ${row.original.orderCount - 2}` : ""}</p></div> },
    { accessorKey: "vehicle", header: ({ column }) => <DataTableColumnHeader column={column} title="รถจัดส่ง" />, cell: ({ row }) => row.original.vehiclePlate },
    { accessorKey: "driver", header: ({ column }) => <DataTableColumnHeader column={column} title="พนักงานขับรถ" />, cell: ({ row }) => row.original.driverName },
    { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="สถานะ" />, cell: ({ row }) => <StatusBadge status={deliveryTripStatusConfig[row.original.status].badge} /> },
  ], []);
  const activeFilterCount = [query.status, query.driverId, query.vehicleId].filter((value) => value !== "ALL").length + Number(Boolean(query.dateFrom || query.dateTo));
  const filters = <><Select value={query.status} onValueChange={(value) => navigate({ status: value, page: 1 })}><SelectTrigger className="w-full md:w-44" aria-label="สถานะรอบจัดส่ง"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">ทุกสถานะ</SelectItem>{Object.entries(deliveryTripStatusConfig).map(([value, item]) => <SelectItem key={value} value={value}>{item.th}</SelectItem>)}</SelectContent></Select><Select value={query.driverId} onValueChange={(value) => navigate({ driverId: value, page: 1 })}><SelectTrigger className="w-full md:w-48" aria-label="พนักงานขับรถ"><SelectValue placeholder="พนักงานขับรถทุกคน" /></SelectTrigger><SelectContent><SelectItem value="ALL">พนักงานขับรถทุกคน</SelectItem>{options.drivers.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select><Select value={query.vehicleId} onValueChange={(value) => navigate({ vehicleId: value, page: 1 })}><SelectTrigger className="w-full md:w-44" aria-label="รถจัดส่ง"><SelectValue placeholder="รถทุกคัน" /></SelectTrigger><SelectContent><SelectItem value="ALL">รถทุกคัน</SelectItem>{options.vehicles.map((item) => <SelectItem key={item.id} value={item.id}>{item.registrationNumber}</SelectItem>)}</SelectContent></Select><DateRange hideLabel className="w-full md:w-72" label="ช่วงวันที่" from={{ value: query.dateFrom, onChange: (event) => navigate({ dateFrom: event.target.value, page: 1 }), "aria-label": "วันที่เริ่มต้น" }} to={{ value: query.dateTo, onChange: (event) => navigate({ dateTo: event.target.value, page: 1 }), "aria-label": "วันที่สิ้นสุด" }} /></>;
  const sorting: SortingState = [{ id: query.sort, desc: query.order === "desc" }]; const pagination: PaginationState = { pageIndex: query.page - 1, pageSize: query.pageSize };
  return <DataTable columns={columns} data={rows} searchValue={search} onSearchChange={setSearch} searchPlaceholder="ค้นหาเลขที่รอบ คำสั่งซื้อ ลูกค้า รถ หรือพนักงาน..." filters={filters} activeFilterCount={activeFilterCount} onResetFilters={() => { setSearch(""); router.replace(pathname); }} emptyTitle={query.q || activeFilterCount ? "ไม่พบรอบจัดส่งที่ตรงกับตัวกรอง" : "ยังไม่มีรอบจัดส่ง"} emptyDescription={query.q || activeFilterCount ? "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง" : "สร้างรอบจัดส่งเพื่อเริ่มวางแผนและขึ้นสินค้า"} manualPagination manualSorting manualFiltering pageCount={pageCount} totalRows={total} pagination={pagination} onPaginationChange={(next) => navigate({ page: next.pageIndex + 1, pageSize: next.pageSize })} sorting={sorting} onSortingChange={(next) => { const selected = next[0]; if (selected) navigate({ sort: selected.id, order: selected.desc ? "desc" : "asc", page: 1 }); }} pageSizeOptions={[20, 50, 100]} getRowId={(row) => row.id} onRowClick={(row) => router.push(`/delivery/trips/${row.original.id}`)} />;
}
