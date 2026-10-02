import { spawnSync } from "node:child_process";
import process from "node:process";

const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL || "postgresql://generate.invalid/aquaops" };
const result = spawnSync("npx", ["prisma", "generate"], { env, stdio: "inherit" });
process.exit(result.status ?? 1);
