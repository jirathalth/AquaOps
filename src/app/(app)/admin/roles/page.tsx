import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { RoleManagement } from "@/features/admin/components/role-management";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireRouteAccess } from "@/services/auth.service";
import { getRoles } from "@/services/role-administration.service";

export const metadata = { title: "บทบาทและสิทธิ์" };
export default async function RolesPage() { const access = await requireRouteAccess("/admin/roles"); const roles = await getRoles(); const canManage = access.permissions.includes("role.manage"); return <div className="page-stack"><PageHeader title="บทบาทและสิทธิ์" description="กำหนดสิทธิ์แบบเพิ่มรวมจากทุกบทบาทที่ผู้ใช้ได้รับ" breadcrumbs={[{ label: "ผู้ดูแลระบบ" }]} primaryAction={canManage ? <Button asChild><Link href="/admin/roles?create=1"><Plus className="size-4" aria-hidden="true" />เพิ่มบทบาท</Link></Button> : undefined} /><RoleManagement roles={roles.map((role) => ({ ...role, permissions: role.permissions.map(({ permission }) => permission.code) }))} canManage={canManage} /></div>; }
