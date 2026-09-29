import "server-only";
import { isPermissionCode } from "@/config/permissions";
import { db } from "@/lib/db";
import { findRole, listRoles } from "@/repositories/role.repository";
import { AdministrationRuleError } from "@/services/user-administration.service";
import type { RoleCreateValues, RoleUpdateValues } from "@/validations/admin";

export async function getRoles() { return listRoles(); }
function validatePermissionCodes(codes: string[]) { if (codes.some((code) => !isPermissionCode(code))) throw new AdministrationRuleError("พบสิทธิ์ที่ไม่ถูกต้อง"); }

export async function createCustomRole(input: RoleCreateValues, actorId: string) {
  validatePermissionCodes(input.permissionCodes);
  const existing = await db.role.findUnique({ where: { code: input.code }, select: { id: true } });
  if (existing) throw new AdministrationRuleError("รหัสบทบาทนี้ถูกใช้งานแล้ว");
  return db.$transaction(async (tx) => {
    const permissions = await tx.permission.findMany({ where: { code: { in: input.permissionCodes } }, select: { id: true } });
    if (permissions.length !== input.permissionCodes.length) throw new AdministrationRuleError("ฐานข้อมูลสิทธิ์ยังไม่พร้อม กรุณารัน seed");
    const role = await tx.role.create({ data: { code: input.code, name: input.name, description: input.description || null } });
    if (permissions.length) await tx.rolePermission.createMany({ data: permissions.map(({ id }) => ({ roleId: role.id, permissionId: id })) });
    await tx.auditLog.create({ data: { actorId, action: "ROLE_CREATED", entityType: "Role", entityId: role.id, afterData: { code: role.code, name: role.name, permissionCodes: input.permissionCodes } } });
    return role.id;
  });
}

export async function updateCustomRole(input: RoleUpdateValues, actorId: string) {
  validatePermissionCodes(input.permissionCodes);
  const current = await findRole(input.id);
  if (!current) throw new AdministrationRuleError("ไม่พบบทบาท");
  if (current.isSystem) throw new AdministrationRuleError("บทบาทระบบแก้ไขได้ผ่าน seed เท่านั้น");
  await db.$transaction(async (tx) => {
    const permissions = await tx.permission.findMany({ where: { code: { in: input.permissionCodes } }, select: { id: true } });
    if (permissions.length !== input.permissionCodes.length) throw new AdministrationRuleError("ฐานข้อมูลสิทธิ์ยังไม่พร้อม กรุณารัน seed");
    await tx.role.update({ where: { id: input.id }, data: { name: input.name, description: input.description || null, isActive: input.isActive } });
    await tx.rolePermission.deleteMany({ where: { roleId: input.id } });
    if (permissions.length) await tx.rolePermission.createMany({ data: permissions.map(({ id }) => ({ roleId: input.id, permissionId: id })) });
    await tx.auditLog.create({ data: { actorId, action: "ROLE_UPDATED", entityType: "Role", entityId: input.id, beforeData: { name: current.name, isActive: current.isActive, permissionCodes: current.permissions.map(({ permission }) => permission.code) }, afterData: { name: input.name, isActive: input.isActive, permissionCodes: input.permissionCodes } } });
    await tx.auditLog.create({ data: { actorId, action: "PERMISSION_CHANGED", entityType: "Role", entityId: input.id, metadata: { permissionCodes: input.permissionCodes } } });
  });
}
