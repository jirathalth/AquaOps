"use client";

import { flexRender, functionalUpdate, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type PaginationState, type Row, type RowSelectionState, type SortingState, type Updater, type VisibilityState } from "@tanstack/react-table";
import { Columns3 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { SearchInput } from "@/components/shared/search-input";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  activeFilterCount?: number;
  onResetFilters?: () => void;
  toolbarActions?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  enableRowSelection?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  getRowId?: (row: TData, index: number) => string;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  pageCount?: number;
  totalRows?: number;
  pagination?: PaginationState;
  onPaginationChange?: (state: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;
  pageSizeOptions?: number[];
};

export function createSelectionColumn<TData>(): ColumnDef<TData> { return { id: "select", enableSorting: false, enableHiding: false, size: 40, header: ({ table }) => <Checkbox aria-label="เลือกทุกรายการในหน้านี้" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))} />, cell: ({ row }) => <Checkbox aria-label="เลือกรายการ" checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} onClick={(event) => event.stopPropagation()} />, meta: { align: "center" } }; }

export function DataTable<TData, TValue>({ columns, data, loading = false, searchable = true, searchPlaceholder = "ค้นหา...", searchValue, onSearchChange, filters, activeFilterCount, onResetFilters, toolbarActions, emptyTitle = "ไม่พบข้อมูล", emptyDescription = "ลองปรับคำค้นหาหรือตัวกรอง แล้วลองอีกครั้ง", emptyAction, enableRowSelection = false, onRowClick, getRowId, manualPagination = false, manualSorting = false, manualFiltering = false, pageCount, totalRows, pagination, onPaginationChange, sorting, onSortingChange, pageSizeOptions }: DataTableProps<TData, TValue>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalPagination, setInternalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const currentSearch = searchValue ?? internalSearch;
  const currentPagination = pagination ?? internalPagination;
  const currentSorting = sorting ?? internalSorting;
  function updatePagination(updater: Updater<PaginationState>) { const next = functionalUpdate(updater, currentPagination); onPaginationChange?.(next); if (!pagination) setInternalPagination(next); }
  function updateSorting(updater: Updater<SortingState>) { const next = functionalUpdate(updater, currentSorting); onSortingChange?.(next); if (!sorting) setInternalSorting(next); }
  function updateSearch(value: string) { onSearchChange?.(value); if (searchValue === undefined) setInternalSearch(value); if (!manualPagination) updatePagination((current) => ({ ...current, pageIndex: 0 })); }
  // TanStack Table intentionally exposes a stateful API that React Compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, state: { sorting: currentSorting, pagination: currentPagination, columnVisibility, rowSelection, globalFilter: currentSearch }, pageCount, getRowId, enableRowSelection, manualPagination, manualSorting, manualFiltering, onSortingChange: updateSorting, onPaginationChange: updatePagination, onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection, onGlobalFilterChange: updateSearch, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(), getSortedRowModel: manualSorting ? undefined : getSortedRowModel(), getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel() });
  const columnToggle = <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm"><Columns3 className="size-4" /><span className="hidden sm:inline">คอลัมน์</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>แสดงคอลัมน์</DropdownMenuLabel>{table.getAllColumns().filter((column) => column.getCanHide()).map((column) => <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}>{typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>;
  return <div className="space-y-3"><FilterBar search={searchable ? <SearchInput value={currentSearch} onValueChange={updateSearch} placeholder={searchPlaceholder} aria-label={searchPlaceholder} /> : undefined} filters={filters} activeFilterCount={activeFilterCount} onReset={onResetFilters} actions={<div className="flex items-center gap-2">{toolbarActions}{columnToggle}</div>} /><div className="overflow-hidden rounded-md border border-border/80 bg-card shadow-xs"><Table><TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur-sm">{table.getHeaderGroups().map((headerGroup) => <TableRow key={headerGroup.id} className="hover:bg-transparent">{headerGroup.headers.map((header) => { const sort = header.column.getIsSorted(); return <TableHead key={header.id} aria-sort={header.column.getCanSort() ? sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none" : undefined} className={cn(header.column.columnDef.meta?.headerClassName, header.column.columnDef.meta?.align === "right" && "text-right", header.column.columnDef.meta?.align === "center" && "text-center")} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>; })}</TableRow>)}</TableHeader><TableBody>{loading ? <TableRow className="hover:bg-transparent"><TableCell colSpan={table.getVisibleLeafColumns().length} className="p-0"><TableSkeleton columns={Math.min(table.getVisibleLeafColumns().length, 6)} /></TableCell></TableRow> : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} className={onRowClick ? "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring" : undefined} tabIndex={onRowClick ? 0 : undefined} onClick={() => onRowClick?.(row)} onKeyDown={(event) => { if (onRowClick && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onRowClick(row); } }}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.cellClassName, cell.column.columnDef.meta?.align === "right" && "text-right", cell.column.columnDef.meta?.align === "center" && "text-center")}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow className="hover:bg-transparent"><TableCell colSpan={table.getVisibleLeafColumns().length} className="p-4"><EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} /></TableCell></TableRow>}</TableBody></Table><DataTablePagination table={table} totalRows={totalRows} pageSizeOptions={pageSizeOptions} /></div></div>;
}
