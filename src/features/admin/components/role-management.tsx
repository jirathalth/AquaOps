"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { LockKeyhole, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { DataTable } from "@/components/shared/data-table";
import { FormField } from "@/components/shared/form-layout";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/shared/toast-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { permissionRegistry } from "@/config/permissions";
import { createRoleAction, updateRoleAction } from "@/features/admin/actions";
import { roleCreateSchema, roleUpdateSchema, type RoleCreateValues, type RoleUpdateValues } from "@/validations/admin";

type RoleRow = { id: string; code: string; name: string; description: string | null; isSystem: boolean; isActive: boolean; permissions: string[]; _count: { users: number; permissions: number } };
type RoleFormValues = RoleCreateValues | RoleUpdateValues;
const roleFormSchema = roleCreateSchema.or(roleUpdateSchema);
const permissionGroups = Object.entries(Object.groupBy(permissionRegistry, ({ group }) => group));

export function RoleManagement({ roles, canManage }: { roles: RoleRow[]; canManage: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [editing, setEditing] = useState<RoleRow | null | undefined>();
  const activeEditing = canManage && searchParams.get("create") === "1" ? null : editing;
  function closeDialog() { setEditing(undefined); if (searchParams.get("create") === "1") router.replace("/admin/roles"); }
  const columns: ColumnDef<RoleRow>[] = [
    { id: "identity", accessorFn: (row) => `${row.name} ${row.code}`, header: "บทบาท", cell: ({ row }) => <div className="min-w-44"><div className="flex items-center gap-1.5"><span className="font-medium">{row.original.name}</span>{row.original.isSystem && <LockKeyhole className="size-3.5 text-muted-foreground" aria-label="บทบาทระบบ" />}</div><p className="text-xs text-muted-foreground">{row.original.code}</p></div> },
    { accessorKey: "description", header: "คำอธิบาย", cell: ({ row }) => <span className="line-clamp-2 max-w-lg text-muted-foreground">{row.original.description || "—"}</span> },
    { id: "permissions", header: "สิทธิ์", accessorFn: (row) => row._count.permissions, meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums">{row.original._count.permissions}</span> },
    { id: "users", header: "ผู้ใช้", accessorFn: (row) => row._count.users, meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums">{row.original._count.users}</span> },
    { accessorKey: "isActive", header: "สถานะ", cell: ({ row }) => <StatusBadge status={row.original.isActive ? "active" : "inactive"} /> },
    { id: "actions", header: () => <span className="sr-only">การทำงาน</span>, meta: { align: "right" }, cell: ({ row }) => canManage && !row.original.isSystem ? <Button variant="ghost" size="icon" aria-label={`แก้ไข ${row.original.name}`} onClick={(event) => { event.stopPropagation(); setEditing(row.original); }}><Pencil className="size-4" /></Button> : <Badge variant="outline">{row.original.isSystem ? "ระบบ" : "ดูอย่างเดียว"}</Badge> },
  ];
  return <><DataTable columns={columns} data={roles} searchPlaceholder="ค้นหาบทบาท..." emptyTitle="ยังไม่มีบทบาท" emptyDescription="สร้างบทบาทเพื่อกำหนดชุดสิทธิ์" emptyAction={canManage ? <Button onClick={() => setEditing(null)}>เพิ่มบทบาท</Button> : undefined} /><RoleDialog key={activeEditing === undefined ? "closed" : activeEditing?.id ?? "new"} open={activeEditing !== undefined} role={activeEditing ?? null} onOpenChange={(open) => { if (!open) closeDialog(); }} onSaved={() => { closeDialog(); toast({ variant: "success", title: "บันทึกบทบาทแล้ว" }); router.refresh(); }} /></>;
}

function RoleDialog({ open, role, onOpenChange, onSaved }: { open: boolean; role: RoleRow | null; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const editing = Boolean(role);
  const [actionError, setActionError] = useState<string>();
  const form = useForm<RoleFormValues>({ resolver: zodResolver(roleFormSchema), defaultValues: editing && role ? { id: role.id, name: role.name, description: role.description ?? "", isActive: role.isActive, permissionCodes: role.permissions } : { code: "", name: "", description: "", permissionCodes: [] } });
  const selected = useWatch({ control: form.control, name: "permissionCodes" }) ?? [];
  const isActive = useWatch({ control: form.control, name: "isActive" });
  const createErrors = form.formState.errors as FieldErrors<RoleCreateValues>;
  async function submit(values: RoleFormValues) { setActionError(undefined); const result = editing ? await updateRoleAction(values) : await createRoleAction(values); if (!result.ok) { setActionError(result.message); return; } onSaved(); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{editing ? "แก้ไขบทบาท" : "เพิ่มบทบาท"}</DialogTitle><DialogDescription>สิทธิ์ของผู้ใช้จะเป็นผลรวมจากทุกบทบาทที่ได้รับ</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>{actionError && <Alert variant="danger"><AlertDescription>{actionError}</AlertDescription></Alert>}<div className="grid gap-4 sm:grid-cols-2">{!editing && <FormField label="รหัสบทบาท" htmlFor="role-code" required error={createErrors.code?.message}><Input id="role-code" placeholder="SALES_MANAGER" {...form.register("code" as const)} /></FormField>}<FormField label="ชื่อบทบาท" htmlFor="role-name" required error={form.formState.errors.name?.message}><Input id="role-name" {...form.register("name")} /></FormField></div><FormField label="คำอธิบาย" htmlFor="role-description" error={form.formState.errors.description?.message}><Textarea id="role-description" rows={2} {...form.register("description")} /></FormField>{editing && <label className="flex min-h-10 items-center justify-between gap-3 rounded-md border p-3"><span><span className="block text-sm font-medium">เปิดใช้งานบทบาท</span><span className="block text-xs leading-5 text-muted-foreground">บทบาทที่ปิดใช้งานจะไม่ให้สิทธิ์แก่ผู้ใช้</span></span><Switch checked={isActive ?? true} onCheckedChange={(checked) => form.setValue("isActive", checked, { shouldDirty: true })} /></label>}<fieldset className="space-y-3"><legend className="text-sm font-semibold">สิทธิ์การใช้งาน</legend>{permissionGroups.map(([group, permissions]) => <div key={group} className="rounded-md border"><div className="border-b bg-muted/50 px-3 py-2 text-xs font-semibold">{group}</div><div className="grid gap-1 p-2 sm:grid-cols-2">{permissions?.map((permission) => <label key={permission.code} className="flex min-h-10 items-start gap-2 rounded-sm p-2 hover:bg-muted/60"><Checkbox checked={selected.includes(permission.code)} onCheckedChange={(checked) => form.setValue("permissionCodes", checked ? [...selected, permission.code] : selected.filter((code) => code !== permission.code), { shouldDirty: true })} /><span><span className="block text-sm">{permission.label}</span><span className="block text-[11px] text-muted-foreground">{permission.code}</span></span></label>)}</div></div>)}</fieldset><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>ยกเลิก</Button><Button type="submit" loading={form.formState.isSubmitting}>{editing ? "บันทึกการเปลี่ยนแปลง" : "สร้างบทบาท"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
