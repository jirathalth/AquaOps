import { describe, expect, it } from "vitest";
import { buildMappingSyncPlan } from "./rbac-bootstrap-core";

describe("RBAC bootstrap", () => {
  it("adds and removes only the mapping differences", () => {
    expect(buildMappingSyncPlan(["keep", "obsolete"], ["keep", "missing"])).toEqual({ add: ["missing"], remove: ["obsolete"] });
  });

  it("is idempotent when mappings already match", () => {
    expect(buildMappingSyncPlan(["one", "two"], ["one", "two"])).toEqual({ add: [], remove: [] });
  });
});
