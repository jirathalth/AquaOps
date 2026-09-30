"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CurrencyInput, NumberInput } from "@/components/shared/form-controls";
import { DataTable } from "@/components/shared/data-table";
import { DataTableRowActions } from "@/components/shared/data-table-row-actions";
import { FormField } from "@/components/shared/form-layout";
import { useToast } from "@/components/shared/toast-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { removePriceListItemAction, savePriceListItemAction } from "@/features/pricing/actions";
import type { PriceListItemData, ProductUnitOption } from "@/features/pricing/types";
import { formatCurrencyDecimal } from "@/lib/formatters";
import { priceListItemSchema, type PriceListItemValues } from "@/validations/pricing";

function ItemDialog({ priceListId, item, productUnits, onClose }: { priceListId: string; item?: PriceListItemData; productUnits: ProductUnitOption[]; onClose: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<PriceListItemValues>({ resolver: zodResolver(priceListItemSchema), defaultValues: item ? { id: item.id, priceListId, productUnitId: item.productUnitId, minimumQuantity: item.minimumQuantity, unitPrice: item.unitPrice } : { priceListId, productUnitId: "", minimumQuantity: "1.000", unitPrice: "0.0000" } });
  async function submit(values: PriceListItemValues) { const result = await savePriceListItemAction(values); if (!result.ok) { form.setError("root", { message: result.message }); return; } toast({ variant: "success", title: item ? "แก้ไขราคาสินค้าแล้ว" : "เพิ่มราคาสินค้าแล้ว" }); onClose(); router.refresh(); }
  return <Dialog open onOpenChange={(open) => { if (!open && !form.formState.isSubmitting) onClose(); }}><DialogContent><DialogHeader><DialogTitle>{item ? "แก้ไขราคาสินค้า" : "เพิ่มราคาสินค้า"}</DialogTitle><DialogDescription>กำหนดราคาตามสินค้า หน่วย และจำนวนขั้นต่ำ</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>{form.formState.errors.root?.message && <Alert variant="danger"><AlertDescription>{form.formState.errors.root.message}</AlertDescription></Alert>}<FormField label="สินค้าและหน่วย" htmlFor="productUnitId" required error={form.formState.errors.productUnitId?.message}><Controller name="productUnitId" control={form.control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="productUnitId"><SelectValue placeholder="เลือกสินค้า" /></SelectTrigger><SelectContent>{productUnits.filter((unit) => unit.isActive || unit.id === item?.productUnitId).map((unit) => <SelectItem key={unit.id} value={unit.id} disabled={!unit.isActive}>{unit.sku} · {unit.productName} ({unit.unitSymbol})</SelectItem>)}</SelectContent></Select>} /></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label="จำนวนขั้นต่ำ" htmlFor="minimumQuantity" required error={form.formState.errors.minimumQuantity?.message}><NumberInput id="minimumQuantity" min="0.001" step="0.001" {...form.register("minimumQuantity")} /></FormField><FormField label="ราคา" htmlFor="unitPrice" required error={form.formState.errors.unitPrice?.message}><CurrencyInput id="unitPrice" min="0" step="0.0001" {...form.register("unitPrice")} /></FormField></div><DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={form.formState.isSubmitting}>ยกเลิก</Button><Button type="submit" loading={form.formState.isSubmitting}>บันทึก</Button></DialogFooter></form></DialogContent></Dialog>;
}

export function PriceListItems({ priceListId, items, productUnits, canManage }: { priceListId: string; items: PriceListItemData[]; productUnits: ProductUnitOption[]; canManage: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<PriceListItemData | null>();
  const [removing, setRemoving] = useState<PriceListItemData | null>(null);
  const columns = useMemo<ColumnDef<PriceListItemData>[]>(() => [
    { id: "sku", accessorFn: (row) => row.productUnit.sku, header: "SKU", cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.productUnit.sku}</span> },
    { id: "product", accessorFn: (row) => row.productUnit.productName, header: "สินค้า", cell: ({ row }) => <span className="font-medium">{row.original.productUnit.productName}</span> },
    { id: "unit", header: "หน่วย", cell: ({ row }) => `${row.original.productUnit.unitName} (${row.original.productUnit.unitSymbol})` },
    { accessorKey: "minimumQuantity", header: "จำนวนขั้นต่ำ", meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums">{row.original.minimumQuantity}</span> },
    { id: "defaultPrice", header: "ราคามาตรฐาน", meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{formatCurrencyDecimal(row.original.productUnit.wholesalePrice)}</span> },
    { accessorKey: "unitPrice", header: "ราคาในรายการ", meta: { align: "right" }, cell: ({ row }) => <span className="font-medium tabular-nums">{formatCurrencyDecimal(row.original.unitPrice)}</span> },
    ...(canManage ? [{ id: "actions", header: "", enableSorting: false, enableHiding: false, meta: { align: "right" as const }, cell: ({ row }: { row: { original: PriceListItemData } }) => <DataTableRowActions actions={[{ label: "แก้ไข", onSelect: () => setEditing(row.original) }, { label: "นำออก", destructive: true, onSelect: () => setRemoving(row.original) }]} /> }] : []),
  ], [canManage]);
  async function remove() { if (!removing) return; const result = await removePriceListItemAction({ id: removing.id, priceListId }); if (!result.ok) { toast({ variant: "danger", title: result.message }); return; } toast({ variant: "success", title: "นำราคาสินค้าออกแล้ว" }); setRemoving(null); router.refresh(); }
  return <><DataTable columns={columns} data={items} searchPlaceholder="ค้นหา SKU หรือชื่อสินค้า..." toolbarActions={canManage ? <Button size="sm" onClick={() => setEditing(null)}><Plus className="size-4" aria-hidden="true" />เพิ่มราคาสินค้า</Button> : undefined} emptyTitle="ยังไม่มีราคาสินค้า" emptyDescription="เพิ่มสินค้าและราคาในรายการราคานี้" emptyAction={canManage ? <Button onClick={() => setEditing(null)}>เพิ่มราคาสินค้า</Button> : undefined} getRowId={(row) => row.id} />{editing !== undefined && <ItemDialog key={editing?.id ?? "new"} priceListId={priceListId} item={editing ?? undefined} productUnits={productUnits} onClose={() => setEditing(undefined)} />}{removing && <Dialog open onOpenChange={(open) => { if (!open) setRemoving(null); }}><DialogContent><DialogHeader><DialogTitle>นำราคาสินค้าออก?</DialogTitle><DialogDescription>{removing.productUnit.productName} จะใช้ราคาจากลำดับถัดไปเมื่อสร้างรายการใหม่</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => setRemoving(null)}>ยกเลิก</Button><Button type="button" variant="destructive" onClick={remove}>นำออก</Button></DialogFooter></DialogContent></Dialog>}</>;
}
