import "dotenv/config";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { getMigrationDatabaseUrl } from "../src/config/database-environment.ts";

const command = process.argv[2];
if (command !== "dev" && command !== "deploy" && command !== "status") throw new Error("Migration command must be dev, deploy, or status");
const mode = command === "dev" ? "development" : "deploy";
const databaseUrl = getMigrationDatabaseUrl(process.env, mode);
const args = ["prisma", "migrate", command, ...process.argv.slice(3)];
const result = spawnSync("npx", args, { env: { ...process.env, DATABASE_URL: databaseUrl }, stdio: "inherit" });
process.exit(result.status ?? 1);
