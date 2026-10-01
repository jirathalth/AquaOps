import "dotenv/config";
import { spawnSync } from "node:child_process";
import process from "node:process";
import pg from "pg";

const source = process.env.DATABASE_URL;
if (!source) throw new Error("DATABASE_URL is required");
const name = `aquaops_accounting_test_${process.pid}`;
if (!/^[a-z0-9_]+$/.test(name)) throw new Error("Unsafe test database name");
const adminUrl = new URL(source); adminUrl.pathname = "/postgres";
const testUrl = new URL(source); testUrl.pathname = `/${name}`;
const admin = new pg.Client({ connectionString: adminUrl.toString() });
await admin.connect();
try {
  await admin.query(`CREATE DATABASE "${name}"`);
  const env = { ...process.env, DATABASE_URL: testUrl.toString(), NODE_ENV: "development", AQUAOPS_ACCOUNTING_DB_TEST: "true", AQUAOPS_ENABLE_DEV_SEED: "true", AQUAOPS_DEV_SEED_PASSWORD: "AccountingTest123!" };
  const migrate = spawnSync("npm", ["run", "db:deploy"], { env, stdio: "inherit" });
  if (migrate.status !== 0) process.exitCode = migrate.status ?? 1;
  else {
    const firstSeed = spawnSync("npm", ["run", "db:seed"], { env, stdio: "inherit" });
    const secondSeed = firstSeed.status === 0 ? spawnSync("npm", ["run", "db:seed"], { env, stdio: "inherit" }) : firstSeed;
    if (firstSeed.status !== 0 || secondSeed.status !== 0) process.exitCode = firstSeed.status || secondSeed.status || 1;
    else { const test = spawnSync("npx", ["vitest", "run", "src/services/accounting-database.test.ts"], { env, stdio: "inherit" }); process.exitCode = test.status ?? 1; }
  }
} finally {
  await admin.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()", [name]);
  await admin.query(`DROP DATABASE IF EXISTS "${name}"`);
  await admin.end();
}
