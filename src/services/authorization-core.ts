import type { PermissionCode } from "@/config/permissions";
import { AuthenticationError, AuthorizationError, InactiveUserError } from "@/lib/authorization-errors";

export type UserAccessRecord = { id: string; name: string; email: string; image: string | null; status: "ACTIVE" | "INACTIVE"; roles: { role: { id: string; code: string; name: string; permissions: { permission: { code: string } }[] } }[] };
export type AuthorizationContext = { user: Pick<UserAccessRecord, "id" | "name" | "email" | "image" | "status">; roles: { id: string; code: string; name: string }[]; permissions: PermissionCode[] };

export function buildAuthorizationContext(user: UserAccessRecord | null, isAuthenticated: boolean): AuthorizationContext {
  if (!isAuthenticated || !user) throw new AuthenticationError();
  if (user.status !== "ACTIVE") throw new InactiveUserError();
  const permissions = new Set<PermissionCode>();
  const roles = user.roles.map(({ role }) => {
    role.permissions.forEach(({ permission }) => permissions.add(permission.code as PermissionCode));
    return { id: role.id, code: role.code, name: role.name };
  });
  return { user: { id: user.id, name: user.name, email: user.email, image: user.image, status: user.status }, roles, permissions: [...permissions] };
}

export function hasPermission(context: Pick<AuthorizationContext, "permissions">, permission: PermissionCode): boolean { return context.permissions.includes(permission); }
export function assertPermission(context: Pick<AuthorizationContext, "permissions">, permission: PermissionCode): void { if (!hasPermission(context, permission)) throw new AuthorizationError(); }
export function assertAnyPermission(context: Pick<AuthorizationContext, "permissions">, permissions: readonly PermissionCode[]): void { if (!permissions.some((permission) => hasPermission(context, permission))) throw new AuthorizationError(); }
