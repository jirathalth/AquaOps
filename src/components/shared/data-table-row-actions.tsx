"use client";

import { MoreHorizontal } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type RowAction = { label: string; onSelect: () => void; destructive?: boolean; disabled?: boolean };
export function DataTableRowActions({ actions, label = "เปิดเมนูรายการ" }: { actions: RowAction[]; label?: string }) { return <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" className="size-8" aria-label={label} onClick={(event) => event.stopPropagation()}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{actions.map((action, index) => <Fragment key={action.label}>{index > 0 && action.destructive && <DropdownMenuSeparator />}<DropdownMenuItem disabled={action.disabled} className={action.destructive ? "text-danger focus:text-danger" : undefined} onSelect={action.onSelect}>{action.label}</DropdownMenuItem></Fragment>)}</DropdownMenuContent></DropdownMenu>; }
