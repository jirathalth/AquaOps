import { runDatabaseTest } from "./lib/run-isolated-database.mjs";
await runDatabaseTest({ slug: "delivery_test", flag: "AQUAOPS_DELIVERY_DB_TEST", testFile: "src/services/delivery-database.test.ts" });
