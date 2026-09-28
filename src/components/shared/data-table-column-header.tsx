"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: { column: Column<TData, TValue>; title: string; className?: string }) { if (!column.getCanSort()) return <span className={className}>{title}</span>; const direction = column.getIsSorted(); return <Button type="button" variant="ghost" size="sm" className={cn("-ml-2 h-7 px-2 text-xs font-semibold text-muted-foreground", className)} onClick={() => column.toggleSorting(direction === "asc")} aria-label={`เรียงตาม ${title}`}>{title}{direction === "asc" ? <ArrowUp className="size-3.5" /> : direction === "desc" ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-60" />}</Button>; }
