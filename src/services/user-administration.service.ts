import "server-only";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { countOtherActivePrivilegedUsers, findUserForAdministration, listAssignableRoles, listUsers } from "@/repositories/user.repository";
import type { UserCreateValues, UserUpdateValues } from "@/validations/admin";

export class AdministrationRuleError extends Error { constructor(message: string) { super(message); this.name = "AdministrationRuleError"; } }

export async function getUsers(search?: string) { return listUsers(search); }
export async function getAssignableRoles() { return listAssignableRoles(); }
export async function isUserStatusChange(userId: string, status: UserUpdateValues["status"]): Promise<boolean> { return (await findUserForAdministration(userId))?.status !== status; }

export async function createManagedUser(input: UserCreateValues, actorId: string) {
  const existing = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw new AdministrationRuleError("อีเมลนี้ถูกใช้งานแล้ว");
  const roles = await db.role.findMany({ where: { id: { in: input.roleIds }, isActive: true }, select: { id: true } });
  if (roles.length !== input.roleIds.length) throw new AdministrationRuleError("พบบทบาทที่ไม่ถูกต้องหรือปิดใช้งาน");
  const password = await (await auth.$context).password.hash(input.password);
  const userId = randomUUID();
  await db.$transaction(async (tx) => {
    await tx.user.create({ data: { id: userId, name: input.name, email: input.email, status: input.status } });
    await tx.account.create({ data: { id: randomUUID(), accountId: userId, providerId: "credential", userId, password } });
    if (roles.length) await tx.userRole.createMany({ data: roles.map(({ id }) => ({ userId, roleId: id, assignedById: actorId })) });
    await tx.auditLog.create({ data: { actorId, action: "USER_CREATED", entityType: "User", entityId: userId, afterData: { name: input.name, email: input.email, status: input.status, roleIds: input.roleIds } } });
  });
  return userId;
}

export async function updateManagedUser(input: UserUpdateValues, actorId: string) {
  const current = await findUserForAdministration(input.id);
  if (!current) throw new AdministrationRuleError("ไม่พบผู้ใช้งาน");
  if (input.id === actorId && input.status === "INACTIVE") throw new AdministrationRuleError("ไม่สามารถปิดบัญชีของตนเองได้");
  const roles = await db.role.findMany({ where: { id: { in: input.roleIds }, isActive: true }, select: { id: true, code: true } });
  if (roles.length !== input.roleIds.length) throw new AdministrationRuleError("พบบทบาทที่ไม่ถูกต้องหรือปิดใช้งาน");
  const currentRoleIds = new Set(current.roles.map(({ roleId }) => roleId));
  const nextRoleIds = new Set(roles.map(({ id }) => id));
  const wasPrivileged = current.roles.some(({ role }) => role.code === "OWNER" || role.code === "ADMIN");
  const staysPrivileged = input.status === "ACTIVE" && roles.some(({ code }) => code === "OWNER" || code === "ADMIN");
  if (wasPrivileged && !staysPrivileged && await countOtherActivePrivilegedUsers(input.id) === 0) throw new AdministrationRuleError("ต้องมีบัญชีผู้ดูแลที่ใช้งานได้อย่างน้อยหนึ่งบัญชี");
  if (input.id === actorId && wasPrivileged && !staysPrivileged) throw new AdministrationRuleError("ไม่สามารถนำสิทธิ์ผู้ดูแลสุดท้ายของตนเองออกได้");
  const added = roles.filter(({ id }) => !currentRoleIds.has(id));
  const removed = current.roles.filter(({ roleId }) => !nextRoleIds.has(roleId));
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: input.id }, data: { name: input.name, status: input.status } });
    if (removed.length) await tx.userRole.deleteMany({ where: { userId: input.id, roleId: { in: removed.map(({ roleId }) => roleId) } } });
    if (added.length) await tx.userRole.createMany({ data: added.map(({ id }) => ({ userId: input.id, roleId: id, assignedById: actorId })) });
    if (input.status === "INACTIVE") await tx.session.deleteMany({ where: { userId: input.id } });
    await tx.auditLog.create({ data: { actorId, action: current.status !== input.status ? (input.status === "ACTIVE" ? "USER_ENABLED" : "USER_DISABLED") : "USER_UPDATED", entityType: "User", entityId: input.id, beforeData: { name: current.name, status: current.status }, afterData: { name: input.name, status: input.status } } });
    for (const role of added) await tx.auditLog.create({ data: { actorId, action: "ROLE_ASSIGNED", entityType: "User", entityId: input.id, metadata: { roleId: role.id } } });
    for (const role of removed) await tx.auditLog.create({ data: { actorId, action: "ROLE_REMOVED", entityType: "User", entityId: input.id, metadata: { roleId: role.roleId } } });
  });
}
