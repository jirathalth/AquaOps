import { describe, expect, it } from "vitest";
import { AuthenticationError, AuthorizationError, InactiveUserError } from "@/lib/authorization-errors";
import { assertPermission, buildAuthorizationContext, hasPermission, type UserAccessRecord } from "@/services/authorization-core";

function user(status: "ACTIVE" | "INACTIVE" = "ACTIVE"): UserAccessRecord { return { id: "user-1", name: "Test User", email: "test@aquaops.local", image: null, status, roles: [{ role: { id: "role-1", code: "SALES", name: "Sales", permissions: [{ permission: { code: "customer.view" } }] } }, { role: { id: "role-2", code: "REPORTER", name: "Reporter", permissions: [{ permission: { code: "report.view" } }, { permission: { code: "customer.view" } }] } }] }; }

describe("authorization core", () => {
  it("combines and deduplicates permissions from active roles", () => { const context = buildAuthorizationContext(user(), true); expect(context.permissions).toEqual(expect.arrayContaining(["customer.view", "report.view"])); expect(context.permissions).toHaveLength(2); });
  it("rejects missing sessions and inactive users", () => { expect(() => buildAuthorizationContext(null, false)).toThrow(AuthenticationError); expect(() => buildAuthorizationContext(user("INACTIVE"), true)).toThrow(InactiveUserError); });
  it("allows known permissions and denies missing permissions", () => { const context = buildAuthorizationContext(user(), true); expect(hasPermission(context, "customer.view")).toBe(true); expect(() => assertPermission(context, "user.update")).toThrow(AuthorizationError); });
  it("never trusts a client-provided permission outside the server context", () => { const context = buildAuthorizationContext(user(), true); const untrustedRequest = { permission: "user.update" }; expect(() => assertPermission(context, untrustedRequest.permission as "user.update")).toThrow(AuthorizationError); });
});
