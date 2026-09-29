import "server-only";
import { db } from "@/lib/db";

export function listUsers(search?: string) { return db.user.findMany({ where: search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : undefined, select: { id: true, name: true, email: true, status: true, createdAt: true, roles: { select: { role: { select: { id: true, code: true, name: true } } } } }, orderBy: [{ status: "asc" }, { name: "asc" }] }); }
export function listAssignableRoles() { return db.role.findMany({ where: { isActive: true }, select: { id: true, code: true, name: true, isSystem: true }, orderBy: [{ isSystem: "desc" }, { name: "asc" }] }); }
export function findUserForAdministration(id: string) { return db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, status: true, roles: { select: { roleId: true, role: { select: { code: true } } } } } }); }
export function countOtherActivePrivilegedUsers(userId: string) { return db.user.count({ where: { id: { not: userId }, status: "ACTIVE", roles: { some: { role: { isActive: true, code: { in: ["OWNER", "ADMIN"] } } } } } }); }
