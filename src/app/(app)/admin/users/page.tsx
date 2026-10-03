import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { UserManagement } from "@/features/admin/components/user-management";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireRouteAccess } from "@/services/auth.service";
import { getAssignableRoles, getUsers } from "@/services/user-administration.service";

export const metadata = { title: "ผู้ใช้งาน" };
export default async function UsersPage() {
  const access = await requireRouteAccess("/admin/users");
  const [users, roles] = await Promise.all([getUsers(), getAssignableRoles()]);
  const canCreate = access.permissions.includes("user.create") && access.permissions.includes("role.manage"); return <div className="page-stack"><PageHeader title="ผู้ใช้งาน" description="จัดการบัญชี สถานะ และบทบาทของผู้ใช้งาน AquaOps" breadcrumbs={[{ label: "ผู้ดูแลระบบ" }]} primaryAction={canCreate ? <Button asChild><Link href="/admin/users?create=1"><Plus className="size-4" aria-hidden="true" />เพิ่มผู้ใช้งาน</Link></Button> : undefined} /><UserManagement users={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString(), roles: user.roles.map(({ role }) => role) }))} roles={roles} currentUserId={access.user.id} permissions={access.permissions} /></div>;
}
