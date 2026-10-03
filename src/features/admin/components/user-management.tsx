"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { DataTable } from "@/components/shared/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { FormField } from "@/components/shared/form-layout";
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/shared/toast-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PermissionCode } from "@/config/permissions";
import { createUserAction, updateUserAction } from "@/features/admin/actions";
import { formatDate } from "@/lib/formatters";
import { userCreateSchema, userUpdateSchema, type UserCreateValues, type UserUpdateValues } from "@/validations/admin";

type RoleOption = { id: string; code: string; name: string; isSystem: boolean };
type UserRow = { id: string; name: string; email: string; status: "ACTIVE" | "INACTIVE"; createdAt: string; roles: Omit<RoleOption, "isSystem">[] };
type UserFormValues = UserCreateValues | UserUpdateValues;
const userFormSchema = userCreateSchema.or(userUpdateSchema);

export function UserManagement({ users, roles, currentUserId, permissions }: { users: UserRow[]; roles: RoleOption[]; currentUserId: string; permissions: PermissionCode[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [editing, setEditing] = useState<UserRow | null | undefined>();
  const canCreate = permissions.includes("user.create") && permissions.includes("role.manage");
  const canEdit = permissions.includes("user.update") && permissions.includes("role.manage");
  const activeEditing = canCreate && searchParams.get("create") === "1" ? null : editing;
  function closeDialog() { setEditing(undefined); if (searchParams.get("create") === "1") router.replace("/admin/users"); }
  const columns: ColumnDef<UserRow>[] = [
    { id: "identity", accessorFn: (row) => `${row.name} ${row.email}`, header: ({ column }) => <DataTableColumnHeader column={column} title="ชื่อ" />, cell: ({ row }) => <div className="min-w-40"><p className="font-medium">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.email}</p></div> },
    { id: "roles", header: "บทบาท", accessorFn: (row) => row.roles.map(({ name }) => name).join(" "), cell: ({ row }) => <div className="flex max-w-md flex-wrap gap-1">{row.original.roles.length ? row.original.roles.map((role) => <Badge key={role.id} variant="secondary">{role.name}</Badge>) : <span className="text-xs text-muted-foreground">ยังไม่มีบทบาท</span>}</div> },
    { accessorKey: "status", header: "สถานะ", cell: ({ row }) => <StatusBadge status={row.original.status === "ACTIVE" ? "active" : "inactive"} /> },
    { accessorKey: "createdAt", header: ({ column }) => <DataTableColumnHeader column={column} title="สร้างเมื่อ" />, cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{formatDate(row.original.createdAt)}</span> },
    { id: "actions", header: () => <span className="sr-only">การทำงาน</span>, meta: { align: "right" }, cell: ({ row }) => canEdit ? <Button variant="ghost" size="icon" aria-label={`แก้ไข ${row.original.name}`} onClick={(event) => { event.stopPropagation(); setEditing(row.original); }}><Pencil className="size-4" /></Button> : null },
  ];
  return <><DataTable columns={columns} data={users} searchPlaceholder="ค้นหาชื่อหรืออีเมล..." emptyTitle="ยังไม่มีผู้ใช้งาน" emptyDescription="สร้างบัญชีแรกเพื่อเริ่มกำหนดสิทธิ์การใช้งาน" emptyAction={canCreate ? <Button onClick={() => setEditing(null)}>เพิ่มผู้ใช้งาน</Button> : undefined} /><UserDialog key={activeEditing === undefined ? "closed" : activeEditing?.id ?? "new"} open={activeEditing !== undefined} user={activeEditing ?? null} roles={roles} currentUserId={currentUserId} canDisable={permissions.includes("user.disable")} onOpenChange={(open) => { if (!open) closeDialog(); }} onSaved={() => { closeDialog(); toast({ variant: "success", title: "บันทึกผู้ใช้งานแล้ว" }); router.refresh(); }} /></>;
}

function UserDialog({ open, user, roles, currentUserId, canDisable, onOpenChange, onSaved }: { open: boolean; user: UserRow | null; roles: RoleOption[]; currentUserId: string; canDisable: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const editing = Boolean(user);
  const [actionError, setActionError] = useState<string>();
  const form = useForm<UserFormValues>({ resolver: zodResolver(userFormSchema), defaultValues: editing && user ? { id: user.id, name: user.name, status: user.status, roleIds: user.roles.map(({ id }) => id) } : { name: "", email: "", password: "", status: "ACTIVE", roleIds: [] } });
  const selectedRoles = useWatch({ control: form.control, name: "roleIds" }) ?? [];
  const createErrors = form.formState.errors as FieldErrors<UserCreateValues>;
  async function submit(values: UserFormValues) { setActionError(undefined); const result = editing ? await updateUserAction(values) : await createUserAction(values); if (!result.ok) { setActionError(result.message); return; } onSaved(); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{editing ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}</DialogTitle><DialogDescription>{editing ? "แก้ไขชื่อ สถานะ และบทบาท" : "สร้างบัญชีด้วยรหัสผ่านชั่วคราวที่ส่งให้ผู้ใช้ผ่านช่องทางปลอดภัย"}</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>{actionError && <Alert variant="danger"><AlertDescription>{actionError}</AlertDescription></Alert>}<FormField label="ชื่อ" htmlFor="user-name" required error={form.formState.errors.name?.message}><Input id="user-name" {...form.register("name")} /></FormField>{!editing && <><FormField label="อีเมล" htmlFor="user-email" required error={createErrors.email?.message}><Input id="user-email" type="email" {...form.register("email" as const)} /></FormField><FormField label="รหัสผ่านชั่วคราว" htmlFor="user-password" required description="อย่างน้อย 12 ตัวอักษร และไม่บันทึกรหัสผ่านไว้ใน Audit Log" error={createErrors.password?.message}><Input id="user-password" type="password" {...form.register("password" as const)} /></FormField></>}<FormField label="สถานะ" htmlFor="user-status"><Controller name="status" control={form.control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange} disabled={!canDisable || user?.id === currentUserId}><SelectTrigger id="user-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">ใช้งาน</SelectItem><SelectItem value="INACTIVE">ไม่ใช้งาน</SelectItem></SelectContent></Select>} /></FormField><fieldset className="space-y-2"><legend className="text-[13px] font-medium leading-5">บทบาท</legend><div className="grid gap-2 sm:grid-cols-2">{roles.map((role) => <label key={role.id} className="flex min-h-10 items-start gap-2 rounded-md border p-2.5"><Checkbox checked={selectedRoles.includes(role.id)} onCheckedChange={(checked) => form.setValue("roleIds", checked ? [...selectedRoles, role.id] : selectedRoles.filter((id) => id !== role.id), { shouldDirty: true })} /><span><span className="block text-sm font-medium">{role.name}</span><span className="block text-xs text-muted-foreground">{role.code}</span></span></label>)}</div></fieldset><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>ยกเลิก</Button><Button type="submit" loading={form.formState.isSubmitting}>{editing ? "บันทึกการเปลี่ยนแปลง" : "สร้างผู้ใช้งาน"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
