import { describe, expect, it } from "vitest";
import { filterNavigation } from "@/config/navigation";
import { permissionCodes } from "@/config/permissions";
import { getRoutePermission } from "@/config/route-permissions";
import { defaultRolePermissions } from "@/config/roles";

describe("authorization configuration", () => {
  it("maps protected routes to centralized permissions", () => { expect(getRoutePermission("/sales/orders/123")).toBe("sales_order.view"); expect(getRoutePermission("/customers/123/edit")).toBe("customer.view"); expect(getRoutePermission("/admin/users")).toBe("user.view"); });
  it("hides unauthorized navigation and empty groups", () => { const visible = filterNavigation(new Set(["dashboard.view", "customer.view"])); const items = visible.flatMap(({ items }) => items); expect(items.some(({ href }) => href === "/customers")).toBe(true); expect(items.some(({ href }) => href === "/admin/users")).toBe(false); expect(visible.some(({ label }) => label === "administration")).toBe(false); });
  it("keeps authorized navigation visible", () => { const visible = filterNavigation(new Set(["user.view"])); expect(visible.flatMap(({ items }) => items).some(({ href }) => href === "/admin/users")).toBe(true); });
  it("registers every default role permission", () => { for (const permissions of Object.values(defaultRolePermissions)) for (const permission of permissions) expect(permissionCodes).toContain(permission); });
  it("grants administration mutations only to configured privileged roles", () => { expect(defaultRolePermissions.ADMIN).toEqual(expect.arrayContaining(["user.update", "user.disable", "role.manage"])); expect(defaultRolePermissions.SALES).not.toContain("user.update"); expect(defaultRolePermissions.SALES).not.toContain("role.manage"); });
});
