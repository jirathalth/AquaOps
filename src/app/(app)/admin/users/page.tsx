import { PageHeader } from "@/components/shared/page-header";
import { UserManagement } from "@/features/admin/components/user-management";
import { requireRouteAccess } from "@/services/auth.service";
import { getAssignableRoles, getUsers } from "@/services/user-administration.service";

export const metadata = { title: "ผู้ใช้งาน" };
export default async function UsersPage() {
  const access = await requireRouteAccess("/admin/users");
  const [users, roles] = await Promise.all([getUsers(), getAssignableRoles()]);
  return <div className="page-stack"><PageHeader title="ผู้ใช้งาน" description="จัดการบัญชี สถานะ และบทบาทของผู้ใช้งาน AquaOps" breadcrumbs={[{ label: "ผู้ดูแลระบบ" }]} /><UserManagement users={users.map((user) => ({ ...user, createdAt: user.createdAt.toISOString(), roles: user.roles.map(({ role }) => role) }))} roles={roles} currentUserId={access.user.id} permissions={access.permissions} /></div>;
}
