import { afterEach, describe, expect, it, vi } from "vitest";
import { getDevelopmentBypassContext, isDevelopmentAuthBypass } from "@/config/auth-bypass";

describe("development authentication bypass", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("works only for an explicitly approved isolated test target", () => {
    vi.stubEnv("AQUAOPS_AUTH_BYPASS", "true");
    vi.stubEnv("AQUAOPS_DATABASE_PURPOSE", "test");
    vi.stubEnv("DATABASE_URL", "postgresql://test.example/aquaops_test");
    vi.stubEnv("AQUAOPS_TEST_TARGET_URL", "postgresql://test.example/aquaops_test");
    vi.stubEnv("AQUAOPS_SHARED_DATABASE_URL", "postgresql://shared.example/aquaops");
    expect(isDevelopmentAuthBypass()).toBe(true);
    vi.stubEnv("AQUAOPS_DATABASE_PURPOSE", "shared");
    expect(() => isDevelopmentAuthBypass()).toThrow("requires AQUAOPS_DATABASE_PURPOSE=test");
  });
  it("does not grant user, role, or audit administration permissions", () => { const context = getDevelopmentBypassContext(); expect(context.permissions).toContain("dashboard.view"); expect(context.permissions).not.toContain("user.view"); expect(context.permissions).not.toContain("role.manage"); expect(context.permissions).not.toContain("audit_log.view"); });
});
