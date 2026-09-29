import { PageHeader } from "@/components/shared/page-header";
import { RoleManagement } from "@/features/admin/components/role-management";
import { requireRouteAccess } from "@/services/auth.service";
import { getRoles } from "@/services/role-administration.service";

export const metadata = { title: "บทบาทและสิทธิ์" };
export default async function RolesPage() { const access = await requireRouteAccess("/admin/roles"); const roles = await getRoles(); return <div className="page-stack"><PageHeader title="บทบาทและสิทธิ์" description="กำหนดสิทธิ์แบบเพิ่มรวมจากทุกบทบาทที่ผู้ใช้ได้รับ" breadcrumbs={[{ label: "ผู้ดูแลระบบ" }]} /><RoleManagement roles={roles.map((role) => ({ ...role, permissions: role.permissions.map(({ permission }) => permission.code) }))} canManage={access.permissions.includes("role.manage")} /></div>; }
