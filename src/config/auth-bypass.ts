import { permissionCodes } from "@/config/permissions";
import { assertIsolatedTestRuntime } from "@/config/database-environment";
import type { AuthorizationContext } from "@/services/authorization-core";

export function isDevelopmentAuthBypass(): boolean {
  if (process.env.AQUAOPS_AUTH_BYPASS !== "true") return false;
  assertIsolatedTestRuntime(process.env, "Authentication bypass");
  return true;
}

export function getDevelopmentBypassContext(): AuthorizationContext {
  const permissions = permissionCodes.filter((code) => !code.startsWith("user.") && !code.startsWith("role.") && code !== "audit_log.view" && code !== "settings.manage");
  return { user: { id: "development-preview", name: "Development Preview", email: "preview@aquaops.local", image: null, status: "ACTIVE" }, roles: [{ id: "development-preview", code: "DEVELOPMENT_PREVIEW", name: "Development Preview" }], permissions };
}
