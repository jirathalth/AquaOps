"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { LockKeyhole, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/shared/toast-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const { toast } = useToast();
  const [editing, setEditing] = useState<RoleRow | null | undefined>();
  const columns: ColumnDef<RoleRow>[] = [
    { id: "identity", accessorFn: (row) => `${row.name} ${row.code}`, header: "บทบาท", cell: ({ row }) => <div className="min-w-44"><div className="flex items-center gap-1.5"><span className="font-medium">{row.original.name}</span>{row.original.isSystem && <LockKeyhole className="size-3.5 text-muted-foreground" aria-label="บทบาทระบบ" />}</div><p className="text-xs text-muted-foreground">{row.original.code}</p></div> },
    { accessorKey: "description", header: "คำอธิบาย", cell: ({ row }) => <span className="line-clamp-2 max-w-lg text-muted-foreground">{row.original.description || "—"}</span> },
    { id: "permissions", header: "สิทธิ์", accessorFn: (row) => row._count.permissions, meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums">{row.original._count.permissions}</span> },
    { id: "users", header: "ผู้ใช้", accessorFn: (row) => row._count.users, meta: { align: "right" }, cell: ({ row }) => <span className="tabular-nums">{row.original._count.users}</span> },
    { accessorKey: "isActive", header: "สถานะ", cell: ({ row }) => <StatusBadge status={row.original.isActive ? "active" : "inactive"} /> },
    { id: "actions", header: () => <span className="sr-only">การทำงาน</span>, meta: { align: "right" }, cell: ({ row }) => canManage && !row.original.isSystem ? <Button variant="ghost" size="icon" aria-label={`แก้ไข ${row.original.name}`} onClick={(event) => { event.stopPropagation(); setEditing(row.original); }}><Pencil className="size-4" /></Button> : <Badge variant="outline">{row.original.isSystem ? "ระบบ" : "ดูอย่างเดียว"}</Badge> },
  ];
  return <><DataTable columns={columns} data={roles} searchPlaceholder="ค้นหาบทบาท..." emptyTitle="ยังไม่มีบทบาท" emptyDescription="สร้างบทบาทเพื่อกำหนดชุดสิทธิ์" toolbarActions={canManage ? <Button size="sm" onClick={() => setEditing(null)}><Plus className="size-4" />เพิ่มบทบาท</Button> : undefined} /><RoleDialog key={editing === undefined ? "closed" : editing?.id ?? "new"} open={editing !== undefined} role={editing ?? null} onOpenChange={(open) => { if (!open) setEditing(undefined); }} onSaved={() => { setEditing(undefined); toast({ variant: "success", title: "บันทึกบทบาทแล้ว" }); router.refresh(); }} /></>;
}

function RoleDialog({ open, role, onOpenChange, onSaved }: { open: boolean; role: RoleRow | null; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const editing = Boolean(role);
  const [actionError, setActionError] = useState<string>();
  const form = useForm<RoleFormValues>({ resolver: zodResolver(roleFormSchema), defaultValues: editing && role ? { id: role.id, name: role.name, description: role.description ?? "", isActive: role.isActive, permissionCodes: role.permissions } : { code: "", name: "", description: "", permissionCodes: [] } });
  const selected = useWatch({ control: form.control, name: "permissionCodes" }) ?? [];
  const isActive = useWatch({ control: form.control, name: "isActive" });
  const createErrors = form.formState.errors as FieldErrors<RoleCreateValues>;
  async function submit(values: RoleFormValues) { setActionError(undefined); const result = editing ? await updateRoleAction(values) : await createRoleAction(values); if (!result.ok) { setActionError(result.message); return; } onSaved(); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{editing ? "แก้ไขบทบาท" : "เพิ่มบทบาท"}</DialogTitle><DialogDescription>สิทธิ์ของผู้ใช้จะเป็นผลรวมจากทุกบทบาทที่ได้รับ</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>{actionError && <Alert variant="danger"><AlertDescription>{actionError}</AlertDescription></Alert>}<div className="grid gap-4 sm:grid-cols-2">{!editing && <div className="space-y-1.5"><Label htmlFor="role-code">รหัสบทบาท</Label><Input id="role-code" placeholder="SALES_MANAGER" aria-invalid={Boolean(createErrors.code)} {...form.register("code" as const)} />{createErrors.code && <p className="text-xs text-danger">{createErrors.code.message}</p>}</div>}<div className="space-y-1.5"><Label htmlFor="role-name">ชื่อบทบาท</Label><Input id="role-name" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />{form.formState.errors.name && <p className="text-xs text-danger">{form.formState.errors.name.message}</p>}</div></div><div className="space-y-1.5"><Label htmlFor="role-description">คำอธิบาย</Label><Textarea id="role-description" rows={2} {...form.register("description")} /></div>{editing && <label className="flex items-center justify-between rounded-md border p-3"><span><span className="block text-sm font-medium">เปิดใช้งานบทบาท</span><span className="block text-xs text-muted-foreground">บทบาทที่ปิดใช้งานจะไม่ให้สิทธิ์แก่ผู้ใช้</span></span><Switch checked={isActive ?? true} onCheckedChange={(checked) => form.setValue("isActive", checked, { shouldDirty: true })} /></label>}<fieldset className="space-y-3"><legend className="text-sm font-semibold">สิทธิ์การใช้งาน</legend>{permissionGroups.map(([group, permissions]) => <div key={group} className="rounded-md border"><div className="border-b bg-muted/50 px-3 py-2 text-xs font-semibold">{group}</div><div className="grid gap-1 p-2 sm:grid-cols-2">{permissions?.map((permission) => <label key={permission.code} className="flex items-start gap-2 rounded-sm p-2 hover:bg-muted/60"><Checkbox checked={selected.includes(permission.code)} onCheckedChange={(checked) => form.setValue("permissionCodes", checked ? [...selected, permission.code] : selected.filter((code) => code !== permission.code), { shouldDirty: true })} /><span><span className="block text-sm">{permission.label}</span><span className="block font-mono text-[11px] text-muted-foreground">{permission.code}</span></span></label>)}</div></div>)}</fieldset><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>ยกเลิก</Button><Button type="submit" loading={form.formState.isSubmitting}>{editing ? "บันทึกการเปลี่ยนแปลง" : "สร้างบทบาท"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
