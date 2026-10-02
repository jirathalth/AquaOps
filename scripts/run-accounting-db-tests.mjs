import { runDatabaseTest } from "./lib/run-isolated-database.mjs";
await runDatabaseTest({ slug: "accounting_test", flag: "AQUAOPS_ACCOUNTING_DB_TEST", testFile: "src/services/accounting-database.test.ts" });
