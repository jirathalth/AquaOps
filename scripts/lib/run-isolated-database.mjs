import "dotenv/config";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import pg from "pg";
import { getTestAdministrationConfig } from "../../src/config/database-environment.ts";

function execute(command, args, env, cwd = process.cwd()) {
  const result = spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status ?? 1}`);
}

async function withIsolatedDatabase(slug, callback) {
  const { sharedUrl, testUrl: configuredTestUrl, adminUrl } = getTestAdministrationConfig();
  const name = `aquaops_${slug}_${process.pid}`;
  if (!/^[a-z0-9_]+$/.test(name)) throw new Error("Unsafe generated test database name");
  const testUrl = new URL(configuredTestUrl);
  testUrl.pathname = `/${name}`;
  const approvedTestUrl = testUrl.toString();
  const admin = new pg.Client({ connectionString: adminUrl });
  let created = false;
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE "${name}"`);
    created = true;
    const env = {
      ...process.env,
      DATABASE_URL: approvedTestUrl,
      AQUAOPS_DATABASE_PURPOSE: "test",
      AQUAOPS_TEST_TARGET_URL: approvedTestUrl,
      AQUAOPS_SHARED_DATABASE_URL: sharedUrl,
      NODE_ENV: "development",
    };
    await callback(env);
  } finally {
    if (created) {
      await admin.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()", [name]);
      await admin.query(`DROP DATABASE "${name}"`);
    }
    await admin.end();
  }
}

function prepareDatabase(env, verifyDemoIdempotence = false) {
  execute("npm", ["run", "db:generate"], env);
  execute("npx", ["prisma", "migrate", "deploy"], env);
  execute("npx", ["tsx", "prisma/seed.ts", "demo"], env);
  if (verifyDemoIdempotence) execute("npx", ["tsx", "prisma/seed.ts", "demo"], env);
}

export async function runDatabaseTest({ slug, flag, testFile }) {
  await withIsolatedDatabase(slug, async (baseEnv) => {
    const env = { ...baseEnv, [flag]: "true", AQUAOPS_AUTH_BYPASS: "false", AQUAOPS_BOOTSTRAP_EMAIL: "", AQUAOPS_BOOTSTRAP_PASSWORD: "", AQUAOPS_DEV_SEED_PASSWORD: `${randomUUID()}Aa1!` };
    prepareDatabase(env, true);
    execute("npx", ["vitest", "run", "--config", "vitest.database.config.mts", testFile], env);
  });
}

export async function runE2E({ slug, specs = [], authBypass = true, workers }) {
  await withIsolatedDatabase(slug, async (baseEnv) => {
    const sourceDirectory = process.cwd();
    const appDirectory = mkdtempSync(join(tmpdir(), `aquaops-${slug}-`));
    const port = String(3100 + process.pid % 1700);
    const password = `${randomUUID()}Aa1!`;
    try {
      cpSync(sourceDirectory, appDirectory, { recursive: true, filter: (sourcePath) => {
        const name = sourcePath.split("/").at(-1) ?? "";
        return ![".git", ".next", "node_modules", "test-results", "playwright-report", "blob-report"].includes(name) && !name.startsWith(".env");
      } });
      symlinkSync(join(sourceDirectory, "node_modules"), join(appDirectory, "node_modules"), "dir");
      const env = {
        ...baseEnv,
        BETTER_AUTH_SECRET: randomUUID() + randomUUID(),
        BETTER_AUTH_URL: `http://localhost:${port}`,
        AQUAOPS_AUTH_BYPASS: String(authBypass),
        AQUAOPS_BOOTSTRAP_EMAIL: "",
        AQUAOPS_BOOTSTRAP_PASSWORD: "",
        AQUAOPS_DEV_SEED_PASSWORD: password,
        E2E_ADMIN_EMAIL: "admin@aquaops.local",
        E2E_ADMIN_PASSWORD: password,
        E2E_RESTRICTED_EMAIL: "viewer@aquaops.local",
        E2E_RESTRICTED_PASSWORD: password,
        E2E_PORT: port,
        E2E_APP_DIR: appDirectory,
      };
      prepareDatabase(env);
      const args = ["playwright", "test", ...specs, "--project=chromium", ...(workers ? [`--workers=${workers}`] : [])];
      execute("npx", args, env);
    } finally {
      rmSync(appDirectory, { recursive: true, force: true });
    }
  });
}
