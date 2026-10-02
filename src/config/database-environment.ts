export type DatabasePurpose = "shared" | "test" | "migration";

export class DatabaseConfigurationError extends Error {
  constructor(message: string) { super(message); this.name = "DatabaseConfigurationError"; }
}

type Environment = Record<string, string | undefined>;

const purposes = new Set<DatabasePurpose>(["shared", "test", "migration"]);

function required(env: Environment, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new DatabaseConfigurationError(`${name} is required`);
  return value;
}

export function parsePostgresUrl(value: string, name = "DATABASE_URL"): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new DatabaseConfigurationError(`${name} must be a valid PostgreSQL URL`); }
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") throw new DatabaseConfigurationError(`${name} must use the postgresql:// or postgres:// protocol`);
  if (!url.hostname || !url.pathname || url.pathname === "/") throw new DatabaseConfigurationError(`${name} must identify a PostgreSQL host and database`);
  return url;
}

export function databaseTargetIdentity(value: string): string {
  const url = parsePostgresUrl(value);
  const port = url.port || "5432";
  return `${url.hostname.toLowerCase()}:${port}${decodeURIComponent(url.pathname)}`;
}

function databaseServerIdentity(value: string): string {
  const url = parsePostgresUrl(value);
  return `${url.hostname.toLowerCase()}:${url.port || "5432"}`;
}

export function isSameDatabaseTarget(left: string, right: string): boolean { return databaseTargetIdentity(left) === databaseTargetIdentity(right); }

export function getDatabasePurpose(env: Environment = process.env): DatabasePurpose {
  const value = required(env, "AQUAOPS_DATABASE_PURPOSE");
  if (!purposes.has(value as DatabasePurpose)) throw new DatabaseConfigurationError("AQUAOPS_DATABASE_PURPOSE must be shared, test, or migration");
  return value as DatabasePurpose;
}

function positiveInteger(env: Environment, name: string, fallback: number): number {
  const value = env[name]?.trim();
  if (!value) return fallback;
  if (!/^\d+$/.test(value) || Number(value) < 1) throw new DatabaseConfigurationError(`${name} must be a positive integer`);
  return Number(value);
}

export function assertIsolatedTestRuntime(env: Environment = process.env, operation = "Database mutation"): void {
  if (getDatabasePurpose(env) !== "test") throw new DatabaseConfigurationError(`${operation} requires AQUAOPS_DATABASE_PURPOSE=test`);
  const runtimeUrl = required(env, "DATABASE_URL");
  const approvedTestUrl = required(env, "AQUAOPS_TEST_TARGET_URL");
  const sharedUrl = required(env, "AQUAOPS_SHARED_DATABASE_URL");
  parsePostgresUrl(runtimeUrl);
  parsePostgresUrl(approvedTestUrl, "AQUAOPS_TEST_TARGET_URL");
  parsePostgresUrl(sharedUrl, "AQUAOPS_SHARED_DATABASE_URL");
  if (!isSameDatabaseTarget(runtimeUrl, approvedTestUrl)) throw new DatabaseConfigurationError(`${operation} target is not the approved isolated test database`);
  if (isSameDatabaseTarget(runtimeUrl, sharedUrl)) throw new DatabaseConfigurationError(`${operation} cannot target the shared runtime database`);
}

export function assertDemoSeedAllowed(env: Environment = process.env): void { assertIsolatedTestRuntime(env, "Demo seed"); }

export function getRuntimeDatabaseConfig(env: Environment = process.env) {
  const connectionString = required(env, "DATABASE_URL");
  parsePostgresUrl(connectionString);
  const purpose = getDatabasePurpose(env);
  if (purpose === "migration") throw new DatabaseConfigurationError("AQUAOPS_DATABASE_PURPOSE=migration is not valid for application runtime");
  if (purpose === "test") assertIsolatedTestRuntime(env, "Test runtime");
  const databaseTestRequested = ["AQUAOPS_INVENTORY_DB_TEST", "AQUAOPS_DELIVERY_DB_TEST", "AQUAOPS_ACCOUNTING_DB_TEST", "AQUAOPS_PHASE12_DB_TEST", "AQUAOPS_SETTINGS_DB_TEST"].some((name) => env[name] === "true");
  if (databaseTestRequested) assertIsolatedTestRuntime(env, "Database integration test");
  if (env.AQUAOPS_AUTH_BYPASS === "true" && purpose !== "test") throw new DatabaseConfigurationError("AQUAOPS_AUTH_BYPASS is permitted only for an approved isolated test database");
  return {
    connectionString,
    purpose,
    max: positiveInteger(env, "DATABASE_POOL_MAX", 3),
    idleTimeoutMillis: positiveInteger(env, "DATABASE_POOL_IDLE_TIMEOUT_MS", 10_000),
    connectionTimeoutMillis: positiveInteger(env, "DATABASE_POOL_CONNECTION_TIMEOUT_MS", 10_000),
  };
}

export function getTestAdministrationConfig(env: Environment = process.env) {
  if (getDatabasePurpose(env) !== "test") throw new DatabaseConfigurationError("Disposable test database administration requires AQUAOPS_DATABASE_PURPOSE=test");
  const sharedUrl = required(env, "DATABASE_URL");
  const testUrl = required(env, "TEST_DATABASE_URL");
  const adminUrl = required(env, "TEST_DATABASE_ADMIN_URL");
  parsePostgresUrl(sharedUrl);
  parsePostgresUrl(testUrl, "TEST_DATABASE_URL");
  parsePostgresUrl(adminUrl, "TEST_DATABASE_ADMIN_URL");
  if (isSameDatabaseTarget(testUrl, sharedUrl)) throw new DatabaseConfigurationError("TEST_DATABASE_URL must identify a database different from DATABASE_URL");
  if (databaseServerIdentity(testUrl) !== databaseServerIdentity(adminUrl)) throw new DatabaseConfigurationError("TEST_DATABASE_ADMIN_URL must administer the same server as TEST_DATABASE_URL");
  return { sharedUrl, testUrl, adminUrl };
}

export function getMigrationDatabaseUrl(env: Environment = process.env, mode: "development" | "deploy") {
  const expectedPurpose: DatabasePurpose = mode === "development" ? "migration" : "shared";
  if (getDatabasePurpose(env) !== expectedPurpose) throw new DatabaseConfigurationError(`Migration ${mode} requires AQUAOPS_DATABASE_PURPOSE=${expectedPurpose}`);
  const runtimeUrl = required(env, "DATABASE_URL");
  const migrationUrl = required(env, "MIGRATION_DATABASE_URL");
  parsePostgresUrl(runtimeUrl);
  parsePostgresUrl(migrationUrl, "MIGRATION_DATABASE_URL");
  if (mode === "development" && isSameDatabaseTarget(runtimeUrl, migrationUrl)) throw new DatabaseConfigurationError("Migration development database must differ from the shared runtime database");
  return migrationUrl;
}
