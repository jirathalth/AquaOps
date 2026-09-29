import { afterEach, describe, expect, it, vi } from "vitest";
import { getDevelopmentBypassContext, isDevelopmentAuthBypass } from "@/config/auth-bypass";

describe("development authentication bypass", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("works only when explicitly enabled in development", () => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AQUAOPS_AUTH_BYPASS", "true"); expect(isDevelopmentAuthBypass()).toBe(true); vi.stubEnv("NODE_ENV", "production"); expect(isDevelopmentAuthBypass()).toBe(false); });
  it("does not grant user, role, or audit administration permissions", () => { const context = getDevelopmentBypassContext(); expect(context.permissions).toContain("dashboard.view"); expect(context.permissions).not.toContain("user.view"); expect(context.permissions).not.toContain("role.manage"); expect(context.permissions).not.toContain("audit_log.view"); });
});
