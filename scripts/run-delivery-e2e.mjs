import "dotenv/config";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import pg from "pg";

const source = process.env.DATABASE_URL;
if (!source) throw new Error("DATABASE_URL is required");
const name = `aquaops_delivery_e2e_${process.pid}`;
if (!/^[a-z0-9_]+$/.test(name)) throw new Error("Unsafe test database name");
const adminUrl = new URL(source); adminUrl.pathname = "/postgres";
const testUrl = new URL(source); testUrl.pathname = `/${name}`;
const admin = new pg.Client({ connectionString: adminUrl.toString() });
const sourceDirectory = process.cwd();
const appDirectory = mkdtempSync(join(tmpdir(), "aquaops-delivery-e2e-"));
cpSync(sourceDirectory, appDirectory, { recursive: true, filter: (sourcePath) => ![".git", ".next", "node_modules", "test-results"].includes(sourcePath.split("/").at(-1) ?? "") });
symlinkSync(join(sourceDirectory, "node_modules"), join(appDirectory, "node_modules"), "dir");
await admin.connect();
try {
  await admin.query(`CREATE DATABASE "${name}"`);
  const env = { ...process.env, DATABASE_URL: testUrl.toString(), NODE_ENV: "development", AQUAOPS_AUTH_BYPASS: "true", AQUAOPS_ENABLE_DEV_SEED: "true", AQUAOPS_DEV_SEED_PASSWORD: "DeliveryE2EOnly123!", E2E_PORT: String(3200 + process.pid % 500), E2E_APP_DIR: appDirectory };
  const migrate = spawnSync("npm", ["run", "db:deploy"], { env, stdio: "inherit" });
  if (migrate.status !== 0) process.exitCode = migrate.status ?? 1;
  else {
    const seed = spawnSync("npm", ["run", "db:seed"], { env, stdio: "inherit" });
    if (seed.status !== 0) process.exitCode = seed.status ?? 1;
    else { const test = spawnSync("npx", ["playwright", "test", "tests/e2e/delivery.spec.ts", "--project=chromium"], { env, stdio: "inherit" }); process.exitCode = test.status ?? 1; }
  }
} finally {
  await admin.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()", [name]);
  await admin.query(`DROP DATABASE IF EXISTS "${name}"`);
  await admin.end();
  rmSync(appDirectory, { recursive: true, force: true });
}
