import { runDatabaseTest } from "./lib/run-isolated-database.mjs";
await runDatabaseTest({ slug: "settings_test", flag: "AQUAOPS_SETTINGS_DB_TEST", testFile: "src/services/settings-database.test.ts" });
