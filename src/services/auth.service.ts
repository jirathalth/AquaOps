import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { PermissionCode } from "@/config/permissions";
import { getDevelopmentBypassContext, isDevelopmentAuthBypass } from "@/config/auth-bypass";
import { getRoutePermission } from "@/config/route-permissions";
import { auth } from "@/lib/auth";
import { AuthenticationError, AuthorizationError, InactiveUserError } from "@/lib/authorization-errors";
import { findUserAccess } from "@/repositories/authorization.repository";
import { assertAnyPermission, assertPermission, buildAuthorizationContext, type AuthorizationContext } from "@/services/authorization-core";

export const getCurrentSession = cache(async () => auth.api.getSession({ headers: await headers() }));
export const getCurrentUser = cache(async () => { const session = await getCurrentSession(); return session ? findUserAccess(session.user.id) : null; });
export const getAuthorizationContext = cache(async (): Promise<AuthorizationContext | null> => { if (isDevelopmentAuthBypass()) return getDevelopmentBypassContext(); const session = await getCurrentSession(); if (!session) return null; return buildAuthorizationContext(await findUserAccess(session.user.id), true); });

export async function requireSession(): Promise<AuthorizationContext> {
  try { const context = await getAuthorizationContext(); if (!context) throw new AuthenticationError(); return context; }
  catch (error) { if (error instanceof AuthenticationError) redirect("/login?reason=expired"); if (error instanceof InactiveUserError) redirect("/login?reason=inactive"); throw error; }
}

export async function requirePermission(permission: PermissionCode): Promise<AuthorizationContext> { const context = await requireSession(); try { assertPermission(context, permission); } catch (error) { if (error instanceof AuthorizationError) redirect("/forbidden"); throw error; } return context; }
export async function requireAnyPermission(permissions: readonly PermissionCode[]): Promise<AuthorizationContext> { const context = await requireSession(); try { assertAnyPermission(context, permissions); } catch (error) { if (error instanceof AuthorizationError) redirect("/forbidden"); throw error; } return context; }
export async function requireRouteAccess(pathname: string): Promise<AuthorizationContext> { const permission = getRoutePermission(pathname); return permission ? requirePermission(permission) : requireSession(); }

export async function authorizeApi(permission?: PermissionCode): Promise<{ context?: AuthorizationContext; response?: Response }> {
  try { const context = await getAuthorizationContext(); if (!context) return { response: Response.json({ error: "UNAUTHENTICATED" }, { status: 401 }) }; if (permission) assertPermission(context, permission); return { context }; }
  catch (error) { if (error instanceof AuthenticationError) return { response: Response.json({ error: "UNAUTHENTICATED" }, { status: 401 }) }; if (error instanceof InactiveUserError || error instanceof AuthorizationError) return { response: Response.json({ error: "FORBIDDEN" }, { status: 403 }) }; throw error; }
}
