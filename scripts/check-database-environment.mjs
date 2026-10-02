import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import { getRuntimeDatabaseConfig } from "../src/config/database-environment.ts";

function readDatabaseUrl(path) {
  if (!existsSync(path)) return undefined;
  const match = readFileSync(path, "utf8").match(/^\s*(?:export\s+)?DATABASE_URL\s*=\s*(.*?)\s*$/m);
  if (!match) return undefined;
  return match[1].replace(/^(['"])(.*)\1$/, "$2");
}

const envUrl = readDatabaseUrl(".env");
const localUrl = readDatabaseUrl(".env.local");
if (envUrl && localUrl && envUrl !== localUrl) throw new Error("DATABASE_URL differs between .env and .env.local; keep DATABASE_URL only in .env");
getRuntimeDatabaseConfig(process.env);
