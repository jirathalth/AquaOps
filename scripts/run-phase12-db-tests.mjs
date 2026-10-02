import { runDatabaseTest } from "./lib/run-isolated-database.mjs";
await runDatabaseTest({ slug: "phase12_test", flag: "AQUAOPS_PHASE12_DB_TEST", testFile: "src/services/phase12-database.test.ts" });
