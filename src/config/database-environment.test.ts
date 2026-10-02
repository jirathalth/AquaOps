import { describe, expect, it } from "vitest";
import { assertDemoSeedAllowed, assertIsolatedTestRuntime, databaseTargetIdentity, getRuntimeDatabaseConfig, getTestAdministrationConfig, isSameDatabaseTarget } from "./database-environment";

const shared = "postgresql://db.example.com:5432/aquaops?sslmode=require";
const test = "postgresql://db.example.com:5432/aquaops_test?sslmode=require";
const isolated = { DATABASE_URL: test, AQUAOPS_DATABASE_PURPOSE: "test", AQUAOPS_TEST_TARGET_URL: test, AQUAOPS_SHARED_DATABASE_URL: shared };

describe("database environment safety", () => {
  it("requires DATABASE_URL", () => expect(() => getRuntimeDatabaseConfig({ AQUAOPS_DATABASE_PURPOSE: "shared" })).toThrow("DATABASE_URL is required"));
  it("rejects a non-PostgreSQL URL", () => expect(() => getRuntimeDatabaseConfig({ DATABASE_URL: "https://db.example.com/aquaops", AQUAOPS_DATABASE_PURPOSE: "shared" })).toThrow("postgresql:// or postgres://"));
  it("rejects an invalid purpose", () => expect(() => getRuntimeDatabaseConfig({ DATABASE_URL: shared, AQUAOPS_DATABASE_PURPOSE: "development" })).toThrow("shared, test, or migration"));
  it("rejects auth bypass on the shared database", () => expect(() => getRuntimeDatabaseConfig({ DATABASE_URL: shared, AQUAOPS_DATABASE_PURPOSE: "shared", AQUAOPS_AUTH_BYPASS: "true" })).toThrow("approved isolated test"));
  it("rejects demo seed on the shared database", () => expect(() => assertDemoSeedAllowed({ DATABASE_URL: shared, AQUAOPS_DATABASE_PURPOSE: "shared" })).toThrow("requires AQUAOPS_DATABASE_PURPOSE=test"));
  it("rejects DB integration and E2E mutation on the shared database", () => {
    expect(() => getRuntimeDatabaseConfig({ DATABASE_URL: shared, AQUAOPS_DATABASE_PURPOSE: "shared", AQUAOPS_INVENTORY_DB_TEST: "true" })).toThrow("requires AQUAOPS_DATABASE_PURPOSE=test");
    expect(() => assertIsolatedTestRuntime({ DATABASE_URL: shared, AQUAOPS_DATABASE_PURPOSE: "shared" }, "Playwright E2E")).toThrow();
  });
  it("requires TEST_DATABASE_URL to differ from DATABASE_URL", () => expect(() => getTestAdministrationConfig({ DATABASE_URL: shared, TEST_DATABASE_URL: shared, TEST_DATABASE_ADMIN_URL: "postgresql://db.example.com/postgres", AQUAOPS_DATABASE_PURPOSE: "test" })).toThrow("must identify a database different"));
  it("accepts an explicitly approved isolated test target", () => expect(() => assertIsolatedTestRuntime(isolated)).not.toThrow());
  it("compares targets without credentials or query parameters", () => {
    expect(databaseTargetIdentity(shared)).toBe("db.example.com:5432/aquaops");
    expect(isSameDatabaseTarget(shared, "postgres://DB.EXAMPLE.COM/aquaops?application_name=test")).toBe(true);
  });
});
