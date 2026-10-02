import { runDatabaseTest } from "./lib/run-isolated-database.mjs";
await runDatabaseTest({ slug: "inventory_test", flag: "AQUAOPS_INVENTORY_DB_TEST", testFile: "src/services/inventory-database.test.ts" });
