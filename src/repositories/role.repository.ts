import "server-only";
import { db } from "@/lib/db";

export function listRoles() { return db.role.findMany({ select: { id: true, code: true, name: true, description: true, isSystem: true, isActive: true, createdAt: true, _count: { select: { users: true, permissions: true } }, permissions: { select: { permission: { select: { code: true } } } } }, orderBy: [{ isSystem: "desc" }, { name: "asc" }] }); }
export function findRole(id: string) { return db.role.findUnique({ where: { id }, select: { id: true, code: true, name: true, description: true, isSystem: true, isActive: true, permissions: { select: { permission: { select: { code: true } } } } } }); }
