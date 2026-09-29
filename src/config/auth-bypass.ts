import { permissionCodes } from "@/config/permissions";
import type { AuthorizationContext } from "@/services/authorization-core";

export function isDevelopmentAuthBypass(): boolean { return process.env.NODE_ENV === "development" && process.env.AQUAOPS_AUTH_BYPASS === "true"; }

export function getDevelopmentBypassContext(): AuthorizationContext {
  const permissions = permissionCodes.filter((code) => !code.startsWith("user.") && !code.startsWith("role.") && code !== "audit_log.view" && code !== "settings.manage");
  return { user: { id: "development-preview", name: "Development Preview", email: "preview@aquaops.local", image: null, status: "ACTIVE" }, roles: [{ id: "development-preview", code: "DEVELOPMENT_PREVIEW", name: "Development Preview" }], permissions };
}
